import { z } from 'zod';

import { anthropic } from '../lib/anthropic.js';
import { prisma } from '../lib/prisma.js';
import { sendNotification } from '../services/notification.service.js';

const CLAUDE_MAX_INPUT_CHARS = 120_000;

const ParsedStatement = z.object({
  transactions: z.array(
    z.object({
      amount: z.number(),
      type: z.enum(['debit', 'credit']),
      merchant: z.string(),
      category: z.string(),
      date: z.string().nullable().optional(),
      confidence: z.number().optional(),
    }),
  ),
});

function parseJsonFromModel(text: string): unknown {
  const t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = fence ? fence[1].trim() : t;
  return JSON.parse(jsonStr);
}

export async function processStatementParseJob(data: {
  ingestionLogId: string;
  userId: string;
  walletId: string;
}): Promise<void> {
  const { ingestionLogId, userId, walletId } = data;

  await prisma.ingestionLog.update({
    where: { id: ingestionLogId },
    data: { status: 'processing' },
  });

  const log = await prisma.ingestionLog.findUnique({ where: { id: ingestionLogId } });
  if (!log || log.sourceType !== 'statement') {
    throw new Error('Ingestion log not found');
  }

  const text =
    log.rawPayload.length > CLAUDE_MAX_INPUT_CHARS
      ? `${log.rawPayload.slice(0, CLAUDE_MAX_INPUT_CHARS)}\n\n[...truncated for processing]`
      : log.rawPayload;

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: `You extract bank transactions from statement text (Sri Lanka / LKR context). Return ONLY valid JSON, no markdown.
Schema: { "transactions": [ { "amount": number, "type": "debit"|"credit", "merchant": string, "category": string, "date": "YYYY-MM-DD"|null, "confidence": number } ] }
Include every card/transfer/fee line that is a real transaction. Skip opening balances and summary-only rows.
Categories: Groceries | Dining | Transport | Health | Shopping | Entertainment | Utilities | Savings | Transfer | Other
confidence: 0.0-1.0 per row. If unsure of a row, omit it or use low confidence.`,
      messages: [{ role: 'user', content: text }],
    });

    const block = msg.content.find((b) => b.type === 'text');
    const raw = block?.type === 'text' ? block.text : '{"transactions":[]}';
    const parsed = ParsedStatement.safeParse(parseJsonFromModel(raw));
    if (!parsed.success) {
      throw new Error('AI returned invalid statement JSON');
    }

    const rows = parsed.data.transactions;
    let created = 0;
    for (const p of rows) {
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
          source: 'statement',
          rawInput: null,
          aiConfidence: p.confidence ?? 0.7,
          transactionDate: txDate,
        },
      });
      created += 1;
    }

    await prisma.ingestionLog.update({
      where: { id: ingestionLogId },
      data: { status: 'processed' },
    });

    if (created > 0) {
      await sendNotification(
        userId,
        'Statement imported',
        `${created} transaction${created === 1 ? '' : 's'} pending review — open to confirm.`,
        { type: 'pending_transaction' },
      );
    } else {
      await sendNotification(
        userId,
        'Statement processed',
        'No transactions were extracted. Try a clearer PDF or add entries manually.',
        { type: 'ingestion_failed' },
      );
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Parse failed';
    await prisma.ingestionLog.update({
      where: { id: ingestionLogId },
      data: { status: 'failed', errorMessage: message },
    });
    await sendNotification(userId, 'Statement import failed', message.slice(0, 200), {
      type: 'ingestion_failed',
    });
  }
}
