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

interface AiState {
  chatHistory: ChatMessage[];
  insights: AiCheckin[];
  isTyping: boolean;
  latestCheckin: AiCheckin | null;

  sendMessage: (content: string) => Promise<void>;
  fetchInsights: () => Promise<void>;
  fetchLatestCheckin: () => Promise<void>;
  clearChat: () => void;
}

export const useAiStore = create<AiState>()((set, get) => ({
  chatHistory: [],
  insights: [],
  isTyping: false,
  latestCheckin: null,

  sendMessage: async (content) => {
    const history = get().chatHistory;
    const messages = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content },
    ];

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      chatHistory: [...state.chatHistory, userMessage],
      isTyping: true,
    }));

    try {
      const replyText = await apiPost<string>('/ai/chat', { messages });
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: typeof replyText === 'string' ? replyText : String(replyText),
        createdAt: new Date().toISOString(),
      };
      set((state) => ({
        chatHistory: [...state.chatHistory, assistantMessage],
        isTyping: false,
      }));
    } catch {
      set((state) => ({
        chatHistory: [
          ...state.chatHistory,
          {
            id: `err-${Date.now()}`,
            role: 'assistant' as const,
            content: 'Sorry, I had trouble responding. Please try again.',
            createdAt: new Date().toISOString(),
          },
        ],
        isTyping: false,
      }));
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

  clearChat: () => set({ chatHistory: [] }),
}));
