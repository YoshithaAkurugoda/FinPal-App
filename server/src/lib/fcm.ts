import admin from 'firebase-admin';

import { env } from '../config/env.js';

let initialized = false;

export function initFirebase(): void {
  if (initialized) return;
  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_PRIVATE_KEY || !env.FIREBASE_CLIENT_EMAIL) {
    console.warn('[FCM] Firebase env not set — push notifications will be logged only');
    return;
  }
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
    }),
  });
  initialized = true;
}

export async function sendPushToDevice(
  token: string,
  title: string,
  body: string,
  data: Record<string, string> = {},
): Promise<void> {
  if (!initialized) {
    console.log('[FCM stub]', title, '|', body, JSON.stringify(data));
    return;
  }

  const stringData: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    stringData[k] = String(v);
  }

  await admin.messaging().send({
    token,
    notification: { title, body },
    data: stringData,
    android: { priority: 'high' },
    apns: { payload: { aps: { sound: 'default' } } },
  });
}
