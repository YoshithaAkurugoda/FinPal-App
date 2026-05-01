import { z } from 'zod';

import { generateText } from '../lib/ai-provider.js';
import { prisma } from '../lib/prisma.js';
import { sendNotification } from '../services/notification.service.js';

const VALID_CATEGORIES = [
  'Groceries', 'Dining', 'Transport', 'Health', 'Shopping',
  'Entertainment', 'Utilities', 'Savings', 'Transfer', 'Other',
] as const;

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
  hintCategory?: string;
}): Promise<void> {
  const { ingestionLogId, userId, rawText, walletId, hintCategory } = data;

  await prisma.ingestionLog.update({
    where: { id: ingestionLogId },
    data: { status: 'processing' },
  });

  try {
    // If user selected a category, tell the AI to use it rather than guess
    const categoryInstruction = hintCategory && VALID_CATEGORIES.includes(hintCategory as typeof VALID_CATEGORIES[number])
      ? `The user has already selected the category "${hintCategory}". Use this as the category value.`
      : `Infer the most likely category from the merchant name and context.`;

    const raw = await generateText({
      system: `Extract transaction data from bank SMS. Return ONLY valid JSON, no markdown.
Schema: { "amount": number, "type": "debit"|"credit", "merchant": string, "category": string, "date": "YYYY-MM-DD"|null, "confidence": number }
Categories: Groceries | Dining | Transport | Health | Shopping | Entertainment | Utilities | Savings | Transfer | Other
${categoryInstruction}
confidence: 0.0-1.0`,
      messages: [{ role: 'user', content: rawText }],
      maxTokens: 256,
    }) || '{}';
    const parsed = ParsedSms.safeParse(parseJsonFromModel(raw));
    if (!parsed.success) {
      throw new Error('AI returned invalid transaction JSON');
    }

    const p = parsed.data;
    // If user provided a valid hint, always use it over AI's guess
    const finalCategory = hintCategory && VALID_CATEGORIES.includes(hintCategory as typeof VALID_CATEGORIES[number])
      ? hintCategory
      : p.category;
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
        category: finalCategory,
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

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { currency: true } });
    const currency = user?.currency ?? 'USD';
    const preview = `${Math.abs(p.amount).toLocaleString()} ${currency} · ${p.merchant} · ${finalCategory}`;
    await sendNotification(userId, 'Review transaction', `${preview} — tap to confirm`, {
      type: 'pending_transaction',
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Parse failed';
    console.error('[SMS Parse Worker] Failed:', message);
    await prisma.ingestionLog.update({
      where: { id: ingestionLogId },
      data: { status: 'failed', errorMessage: message },
    });
    await sendNotification(userId, 'Could not read SMS', 'Please add this transaction manually.', {
      type: 'ingestion_failed',
    });
  }
}
