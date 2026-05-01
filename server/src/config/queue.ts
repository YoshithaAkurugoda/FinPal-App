import { Queue } from 'bullmq';

import { redis } from './redis.js';

const connection = redis;

export const smsParseQueue = new Queue('sms-parse', { connection });
export const statementParseQueue = new Queue('statement-parse', { connection });
export const aiInsightQueue = new Queue('ai-insight', { connection });
export const patternDetectionQueue = new Queue('pattern-detection', { connection });
export const notificationQueue = new Queue('notification', { connection });
export const memoryExtractionQueue = new Queue('memory-extraction', { connection });
export const budgetRolloverQueue = new Queue('budget-rollover', { connection });
export const reconciliationReminderQueue = new Queue('reconciliation-reminder', { connection });

export async function setupRepeatableJobs(): Promise<void> {
  // Daily check-in — 08:00 UTC every day
  await aiInsightQueue.add(
    'daily_checkin',
    {},
    { repeat: { pattern: '0 8 * * *' }, jobId: 'repeatable:daily_checkin' },
  );

  // Weekly summary — 18:00 UTC every Sunday
  await aiInsightQueue.add(
    'weekly_summary',
    {},
    { repeat: { pattern: '0 18 * * 0' }, jobId: 'repeatable:weekly_summary' },
  );

  // Pattern detection — every 6 hours
  await patternDetectionQueue.add(
    'run',
    {},
    { repeat: { pattern: '0 */6 * * *' }, jobId: 'repeatable:pattern_detection' },
  );

  // Budget rollover — 00:05 on first of each month
  await budgetRolloverQueue.add(
    'run',
    {},
    { repeat: { pattern: '5 0 1 * *' }, jobId: 'repeatable:budget_rollover' },
  );

  // Reconciliation reminder — 09:00 on first of each month
  await reconciliationReminderQueue.add(
    'run',
    {},
    { repeat: { pattern: '0 9 1 * *' }, jobId: 'repeatable:reconciliation_reminder' },
  );

  console.log('[Queue] Repeatable jobs registered');
}
