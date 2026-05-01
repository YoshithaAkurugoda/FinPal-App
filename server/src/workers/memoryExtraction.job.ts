import { z } from 'zod';

import { generateText } from '../lib/ai-provider.js';
import { prisma } from '../lib/prisma.js';

const MemoryFactSchema = z.object({
  type: z.enum(['behaviour', 'preference', 'goal_context', 'user_stated']),
  key: z.string().min(1).max(100),
  value: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

const MemoryExtractionSchema = z.object({
  facts: z.array(MemoryFactSchema).max(3),
});

function parseJsonFromModel(text: string): unknown {
  const t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = fence ? fence[1].trim() : t;
  return JSON.parse(jsonStr);
}

export async function processMemoryExtractionJob(data: {
  userId: string;
  transactionId: string;
}): Promise<void> {
  const { userId, transactionId } = data;

  const [transaction, user, recentMemories] = await Promise.all([
    prisma.transaction.findUnique({ where: { id: transactionId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, currency: true } }),
    prisma.companionMemory.findMany({
      where: { userId },
      orderBy: { lastSeen: 'desc' },
      take: 10,
      select: { key: true, value: true },
    }),
  ]);

  if (!transaction || !user) return;

  const memoryContext = recentMemories.length > 0
    ? recentMemories.map((m) => `${m.key}: ${m.value}`).join('\n')
    : 'No prior memories.';

  const txSummary = `${transaction.type === 'debit' ? 'Spent' : 'Received'} ${user.currency} ${Number(transaction.amount).toLocaleString()} at ${transaction.merchant ?? 'unknown'} (${transaction.category}) on ${transaction.transactionDate.toISOString().split('T')[0]}`;

  const raw = await generateText({
    system: `Extract 0–3 durable financial facts about a user from a single transaction.
Return ONLY valid JSON matching: { "facts": [{ "type": "behaviour"|"preference"|"goal_context"|"user_stated", "key": string, "value": string, "confidence": 0.0-1.0 }] }
Only extract facts that are genuinely informative and not already known.
If nothing notable, return { "facts": [] }.`,
    messages: [
      {
        role: 'user',
        content: `Transaction: ${txSummary}
Already known about this user:\n${memoryContext}`,
      },
    ],
    maxTokens: 256,
    tier: 'fast',
  }) || '{"facts":[]}';

  let parsed: { facts: Array<{ type: string; key: string; value: string; confidence: number }> };
  try {
    const result = MemoryExtractionSchema.safeParse(parseJsonFromModel(raw));
    if (!result.success) return;
    parsed = result.data;
  } catch {
    return;
  }

  const now = new Date();
  for (const fact of parsed.facts) {
    await prisma.companionMemory.upsert({
      where: { userId_key: { userId, key: fact.key } },
      create: {
        userId,
        type: fact.type,
        key: fact.key,
        value: fact.value,
        confidence: fact.confidence,
        lastSeen: now,
      },
      update: {
        value: fact.value,
        confidence: fact.confidence,
        lastSeen: now,
      },
    });
  }
}
