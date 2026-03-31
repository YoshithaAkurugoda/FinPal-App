import type { Job } from 'bullmq';

import { sendPushToDevice } from '../lib/fcm.js';

type NotificationJobData = {
  fcmToken: string;
  title: string;
  body: string;
  data?: Record<string, string>;
};

export async function processNotificationJob(job: Job): Promise<void> {
  if (job.name !== 'notification_dispatch') return;

  const { fcmToken, title, body, data } = job.data as NotificationJobData;
  if (!fcmToken) return;

  await sendPushToDevice(fcmToken, title, body, data ?? {});
}
