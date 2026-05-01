import '../loadEnv.js';

import { Worker } from 'bullmq';

import { redis } from '../config/redis.js';
import { setupRepeatableJobs } from '../config/queue.js';
import { initFirebase } from '../lib/fcm.js';
import { processNotificationJob } from './notification.job.js';
import { processSmsParseJob } from './smsParse.job.js';
import { processStatementParseJob } from './statementParse.job.js';
import { processAiInsightJob } from './aiInsight.job.js';
import { processMemoryExtractionJob } from './memoryExtraction.job.js';
import { processPatternDetectionJob } from './patternDetection.job.js';
import { processBudgetRolloverJob } from './budgetRollover.job.js';
import { processReconciliationReminderJob } from './reconciliationReminder.job.js';

initFirebase();

const connection = redis;
const workers: Worker[] = [];

workers.push(
  new Worker(
    'sms-parse',
    async (job) => {
      if (job.name === 'parse_sms') {
        await processSmsParseJob(job.data as Parameters<typeof processSmsParseJob>[0]);
      }
    },
    { connection },
  ),
);

workers.push(new Worker('notification', async (job) => processNotificationJob(job), { connection }));

workers.push(
  new Worker(
    'statement-parse',
    async (job) => {
      if (job.name === 'parse_statement') {
        await processStatementParseJob(
          job.data as Parameters<typeof processStatementParseJob>[0],
        );
      }
    },
    { connection },
  ),
);

workers.push(
  new Worker(
    'ai-insight',
    async (job) => {
      await processAiInsightJob(job.name);
    },
    { connection },
  ),
);

workers.push(
  new Worker(
    'memory-extraction',
    async (job) => {
      if (job.name === 'extract') {
        await processMemoryExtractionJob(
          job.data as Parameters<typeof processMemoryExtractionJob>[0],
        );
      }
    },
    { connection },
  ),
);

workers.push(
  new Worker(
    'pattern-detection',
    async (job) => {
      if (job.name === 'run') {
        await processPatternDetectionJob();
      }
    },
    { connection },
  ),
);

workers.push(
  new Worker(
    'budget-rollover',
    async (job) => {
      if (job.name === 'run') {
        await processBudgetRolloverJob();
      }
    },
    { connection },
  ),
);

workers.push(
  new Worker(
    'reconciliation-reminder',
    async (job) => {
      if (job.name === 'run') {
        await processReconciliationReminderJob();
      }
    },
    { connection },
  ),
);

console.log(`[Workers] ${workers.length} workers started`);

async function shutdown() {
  console.log('[Workers] Shutting down...');
  await Promise.all(workers.map((w) => w.close()));
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Register all repeatable/cron jobs
setupRepeatableJobs().catch((err) => {
  console.error('[Workers] Failed to setup repeatable jobs:', err);
});
