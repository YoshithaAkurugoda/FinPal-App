import { Queue } from 'bullmq';

import { redis } from './redis.js';

const connection = redis;

export const smsParseQueue = new Queue('sms-parse', { connection });
export const statementParseQueue = new Queue('statement-parse', { connection });
export const aiInsightQueue = new Queue('ai-insight', { connection });
export const patternDetectionQueue = new Queue('pattern-detection', { connection });
export const notificationQueue = new Queue('notification', { connection });
export const memoryExtractionQueue = new Queue('memory-extraction', { connection });

export async function setupRepeatableJobs(): Promise<void> {
  // Repeatable/cron jobs (e.g. weekly digest) — future sprint
}
