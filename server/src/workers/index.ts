import '../loadEnv.js';

import { Worker } from 'bullmq';

import { redis } from '../config/redis.js';
import { initFirebase } from '../lib/fcm.js';
import { processNotificationJob } from './notification.job.js';
import { processSmsParseJob } from './smsParse.job.js';
import { processStatementParseJob } from './statementParse.job.js';

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

const stubQueues = ['ai-insight', 'pattern-detection', 'memory-extraction'] as const;
for (const name of stubQueues) {
  workers.push(
    new Worker(
      name,
      async (job) => {
        console.log(`[Worker:${name}] stub job ${job.id}`, job.name);
      },
      { connection },
    ),
  );
}

console.log(`[Workers] ${workers.length} workers started`);

async function shutdown() {
  console.log('[Workers] Shutting down...');
  await Promise.all(workers.map((w) => w.close()));
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
