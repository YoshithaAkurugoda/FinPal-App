import pdf from 'pdf-parse';
import { createHash } from 'node:crypto';

import { prisma } from '../../lib/prisma.js';
import { smsParseQueue, statementParseQueue } from '../../config/queue.js';

const MAX_STATEMENT_TEXT = 500_000;

export async function submitSms(
  userId: string,
  data: { rawText: string; walletId: string; hintCategory?: string },
) {
  const log = await prisma.ingestionLog.create({
    data: {
      userId,
      sourceType: 'sms',
      rawPayload: data.rawText,
      status: 'queued',
    },
  });

  // Deterministic jobId deduplicates the same SMS submitted twice within the
  // BullMQ job-retention window (e.g. network retry, double-tap).
  const smsJobId = createHash('sha256')
    .update(userId + data.walletId + data.rawText)
    .digest('hex')
    .slice(0, 40);

  await smsParseQueue.add(
    'parse_sms',
    {
      ingestionLogId: log.id,
      userId,
      rawText: data.rawText,
      walletId: data.walletId,
      hintCategory: data.hintCategory,
    },
    { jobId: smsJobId },
  );

  return log;
}

export async function submitStatement(
  userId: string,
  walletId: string,
  file: Express.Multer.File,
) {
  const mime = file.mimetype?.toLowerCase() ?? '';
  const name = file.originalname?.toLowerCase() ?? '';
  if (mime !== 'application/pdf' && !name.endsWith('.pdf')) {
    throw Object.assign(new Error('Only PDF bank statements are supported'), { statusCode: 400 });
  }

  let text: string;
  try {
    const parsed = await pdf(file.buffer);
    text = (parsed.text ?? '').trim();
  } catch {
    throw Object.assign(new Error('Could not read PDF file'), { statusCode: 400 });
  }

  if (!text) {
    throw Object.assign(
      new Error('No text found in PDF — try a text-based statement, not a scanned image'),
      { statusCode: 400 },
    );
  }

  if (text.length > MAX_STATEMENT_TEXT) {
    throw Object.assign(
      new Error(
        `Statement text exceeds the ${(MAX_STATEMENT_TEXT / 1000).toFixed(0)} KB processing limit. ` +
          'Please upload a shorter date range or split the statement into multiple files.',
      ),
      { statusCode: 413 },
    );
  }
  const rawPayload = text;

  const log = await prisma.ingestionLog.create({
    data: {
      userId,
      sourceType: 'statement',
      rawPayload,
      status: 'queued',
    },
  });

  const statementJobId = createHash('sha256')
    .update(userId + walletId + rawPayload.slice(0, 4096))
    .digest('hex')
    .slice(0, 40);

  await statementParseQueue.add(
    'parse_statement',
    { ingestionLogId: log.id, userId, walletId },
    { jobId: statementJobId },
  );

  return log;
}
