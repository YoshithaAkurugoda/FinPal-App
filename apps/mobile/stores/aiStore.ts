import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { apiGet, apiPost } from '@/lib/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface AiCheckin {
  id: string;
  type: string;
  content: string;
  createdAt: string;
}

const CHAT_KEY = (userId: string) => `finpal:chat:${userId}`;
const MAX_PERSISTED = 50;

interface AiState {
  chatHistory: ChatMessage[];
  insights: AiCheckin[];
  isTyping: boolean;
  latestCheckin: AiCheckin | null;

  loadChatHistory: (userId: string) => Promise<void>;
  sendMessage: (content: string, userId?: string) => Promise<void>;
  fetchInsights: () => Promise<void>;
  fetchLatestCheckin: () => Promise<void>;
  clearChat: (userId?: string) => void;
}

export const useAiStore = create<AiState>()((set, get) => ({
  chatHistory: [],
  insights: [],
  isTyping: false,
  latestCheckin: null,

  loadChatHistory: async (userId) => {
    try {
      const stored = await AsyncStorage.getItem(CHAT_KEY(userId));
      if (stored) {
        const messages: ChatMessage[] = JSON.parse(stored);
        set({ chatHistory: messages });
      }
    } catch {
      // ignore storage errors
    }
  },

  sendMessage: async (content, userId) => {
    const history = get().chatHistory;
    const messages = [
      ...history.slice(-MAX_PERSISTED).map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content },
    ];

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    const newHistory = [...history, userMessage];
    set({ chatHistory: newHistory, isTyping: true });

    // Persist immediately
    if (userId) {
      void AsyncStorage.setItem(CHAT_KEY(userId), JSON.stringify(newHistory.slice(-MAX_PERSISTED)));
    }

    try {
      const replyText = await apiPost<string>('/ai/chat', { messages });
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: typeof replyText === 'string' ? replyText : String(replyText),
        createdAt: new Date().toISOString(),
      };
      const finalHistory = [...newHistory, assistantMessage];
      set({ chatHistory: finalHistory, isTyping: false });

      if (userId) {
        void AsyncStorage.setItem(CHAT_KEY(userId), JSON.stringify(finalHistory.slice(-MAX_PERSISTED)));
      }
    } catch (err: any) {
      const serverMsg = err?.response?.data?.error;
      const errorContent = serverMsg
        ? `Error: ${serverMsg}`
        : err?.message === 'Network Error'
        ? 'Could not reach the server. Check that the API is running.'
        : 'Sorry, I had trouble responding. Please try again.';
      console.error('[AI Chat]', serverMsg ?? err?.message ?? err);
      const errHistory = [
        ...newHistory,
        {
          id: `err-${Date.now()}`,
          role: 'assistant' as const,
          content: errorContent,
          createdAt: new Date().toISOString(),
        },
      ];
      set({ chatHistory: errHistory, isTyping: false });
    }
  },

  fetchInsights: async () => {
    try {
      const insights = await apiGet<AiCheckin[]>('/ai/insights');
      set({ insights });
    } catch {
      // ignore
    }
  },

  fetchLatestCheckin: async () => {
    try {
      const checkin = await apiGet<AiCheckin | null>('/ai/checkin');
      set({ latestCheckin: checkin });
    } catch {
      set({ latestCheckin: null });
    }
  },

  clearChat: (userId) => {
    set({ chatHistory: [] });
    if (userId) {
      void AsyncStorage.removeItem(CHAT_KEY(userId));
    }
  },
}));
