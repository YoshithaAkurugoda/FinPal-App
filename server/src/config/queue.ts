import { Queue, type DefaultJobOptions } from 'bullmq';

import { redis } from './redis.js';

const connection = redis;

// Applied to every enqueued job unless overridden per-call.
// - attempts/backoff: bounded retries with exponential backoff so transient
//   errors recover but permanent failures don't loop forever.
// - removeOnComplete/Fail: keep Redis from filling up with completed jobs.
const defaultJobOptions: DefaultJobOptions = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
  removeOnComplete: { age: 24 * 60 * 60, count: 1000 },
  removeOnFail: { age: 7 * 24 * 60 * 60 },
};

const queueOpts = { connection, defaultJobOptions };

export const smsParseQueue = new Queue('sms-parse', queueOpts);
export const statementParseQueue = new Queue('statement-parse', queueOpts);
export const aiInsightQueue = new Queue('ai-insight', queueOpts);
export const patternDetectionQueue = new Queue('pattern-detection', queueOpts);
export const notificationQueue = new Queue('notification', queueOpts);
export const memoryExtractionQueue = new Queue('memory-extraction', queueOpts);
export const budgetRolloverQueue = new Queue('budget-rollover', queueOpts);
export const reconciliationReminderQueue = new Queue('reconciliation-reminder', queueOpts);

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
