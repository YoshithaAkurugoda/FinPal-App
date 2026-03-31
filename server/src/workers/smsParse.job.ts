import { z } from 'zod';

import { anthropic } from '../lib/anthropic.js';
import { prisma } from '../lib/prisma.js';
import { sendNotification } from '../services/notification.service.js';

const ParsedSms = z.object({
  amount: z.number(),
  type: z.enum(['debit', 'credit']),
  merchant: z.string(),
  category: z.string(),
  date: z.string().nullable().optional(),
  confidence: z.number(),
});

function parseJsonFromModel(text: string): unknown {
  const t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = fence ? fence[1].trim() : t;
  return JSON.parse(jsonStr);
}

export async function processSmsParseJob(data: {
  ingestionLogId: string;
  userId: string;
  rawText: string;
  walletId: string;
}): Promise<void> {
  const { ingestionLogId, userId, rawText, walletId } = data;

  await prisma.ingestionLog.update({
    where: { id: ingestionLogId },
    data: { status: 'processing' },
  });

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      system: `Extract transaction data from bank SMS. Return ONLY valid JSON, no markdown.
Schema: { "amount": number, "type": "debit"|"credit", "merchant": string, "category": string, "date": "YYYY-MM-DD"|null, "confidence": number }
Categories: Groceries | Dining | Transport | Health | Shopping | Entertainment | Utilities | Savings | Transfer | Other
confidence: 0.0-1.0`,
      messages: [{ role: 'user', content: rawText }],
    });

    const block = msg.content.find((b) => b.type === 'text');
    const raw = block?.type === 'text' ? block.text : '{}';
    const parsed = ParsedSms.safeParse(parseJsonFromModel(raw));
    if (!parsed.success) {
      throw new Error('AI returned invalid transaction JSON');
    }

    const p = parsed.data;
    const signedAmount = p.type === 'debit' ? -Math.abs(p.amount) : Math.abs(p.amount);
    const txDate = p.date ? new Date(p.date) : new Date();

    await prisma.transaction.create({
      data: {
        userId,
        walletId,
        amount: Math.abs(p.amount),
        signedAmount,
        type: p.type,
        merchant: p.merchant,
        category: p.category,
        status: 'pending',
        source: 'sms',
        rawInput: rawText,
        aiConfidence: p.confidence,
        transactionDate: txDate,
      },
    });

    await prisma.ingestionLog.update({
      where: { id: ingestionLogId },
      data: { status: 'processed' },
    });

    const preview = `LKR ${Math.abs(p.amount).toLocaleString()} · ${p.merchant} · ${p.category}`;
    await sendNotification(userId, 'Review transaction', `${preview} — tap to confirm`, {
      type: 'pending_transaction',
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Parse failed';
    await prisma.ingestionLog.update({
      where: { id: ingestionLogId },
      data: { status: 'failed', errorMessage: message },
    });
    await sendNotification(userId, 'Could not read SMS', 'Please add this transaction manually.', {
      type: 'ingestion_failed',
    });
  }
}
