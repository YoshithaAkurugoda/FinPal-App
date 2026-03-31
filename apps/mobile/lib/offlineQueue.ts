import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import api from './api';

const QUEUE_KEY = 'offline_queue';

interface QueuedAction {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload?: unknown;
  createdAt: string;
}

async function getQueue(): Promise<QueuedAction[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function saveQueue(queue: QueuedAction[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function queueAction(
  endpoint: string,
  method: QueuedAction['method'],
  payload?: unknown,
): Promise<void> {
  const queue = await getQueue();
  queue.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    endpoint,
    method,
    payload,
    createdAt: new Date().toISOString(),
  });
  await saveQueue(queue);
}

export async function processQueue(): Promise<number> {
  const queue = await getQueue();
  if (queue.length === 0) return 0;

  let processed = 0;
  const remaining: QueuedAction[] = [];

  for (const action of queue) {
    try {
      await api.request({
        url: action.endpoint,
        method: action.method,
        data: action.payload,
      });
      processed++;
    } catch {
      remaining.push(action);
    }
  }

  await saveQueue(remaining);
  return processed;
}

export async function getQueueLength(): Promise<number> {
  const queue = await getQueue();
  return queue.length;
}

export function startQueueListener(): () => void {
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected) {
      processQueue();
    }
  });
  return unsubscribe;
}
