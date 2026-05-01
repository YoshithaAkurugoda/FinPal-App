import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

import { env } from '../config/env.js';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiRequest {
  system: string;
  messages: AiMessage[];
  maxTokens: number;
  /** Optional model hint — mapped per provider */
  tier?: 'default' | 'fast';
  /** Max retry attempts on rate-limit (429). Default 2. Pass 0 for user-facing calls. */
  maxRetries?: number;
}

// ─── Provider implementations ────────────────────────────────────────────────

async function callAnthropic(req: AiRequest): Promise<string> {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const model =
    req.tier === 'fast' ? 'claude-haiku-4-5-20251001' : 'claude-sonnet-4-20250514';

  const response = await client.messages.create({
    model,
    max_tokens: req.maxTokens,
    system: req.system,
    messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const block = response.content.find((b) => b.type === 'text');
  return block?.text ?? '';
}

function getRetryDelayMs(err: unknown): number {
  // Parse retryDelay from Gemini error details, e.g. "15s"
  try {
    const msg = (err as any)?.message ?? '';
    const match = String(msg).match(/"retryDelay":"(\d+)s"/);
    if (match) return parseInt(match[1], 10) * 1000;
  } catch {
    // ignore
  }
  return 20_000; // default: 20s for free-tier rate limits
}

async function callGemini(req: AiRequest, attempt = 0): Promise<string> {
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  // Free tier: use flash-lite for all calls — higher RPM quota
  const modelName = 'gemini-2.0-flash-lite';
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: req.system,
    generationConfig: {
      maxOutputTokens: req.maxTokens,
    },
  });

  const contents = req.messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const maxRetries = req.maxRetries ?? 2;

  try {
    const result = await model.generateContent({ contents });
    return result.response.text();
  } catch (err: unknown) {
    const status = (err as any)?.status ?? (err as any)?.statusCode;
    if (status === 429 && attempt < maxRetries) {
      const delayMs = getRetryDelayMs(err);
      console.warn(`[AI] Gemini rate limited — retrying in ${delayMs / 1000}s (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise((r) => setTimeout(r, delayMs));
      return callGemini(req, attempt + 1);
    }
    throw err;
  }
}

async function callNvidia(req: AiRequest): Promise<string> {
  const client = new OpenAI({
    apiKey: env.NVIDIA_API_KEY,
    baseURL: 'https://integrate.api.nvidia.com/v1',
    timeout: 45_000,
  });

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: req.system },
    ...req.messages.map((m) => ({ role: m.role, content: m.content } as OpenAI.Chat.ChatCompletionMessageParam)),
  ];

  const stream = await client.chat.completions.create({
    model: 'meta/llama-3.3-70b-instruct',
    messages,
    temperature: 0.6,
    max_tokens: req.maxTokens,
    stream: true,
  } as OpenAI.Chat.ChatCompletionCreateParamsStreaming);

  let result = '';
  for await (const chunk of stream) {
    result += chunk.choices[0]?.delta?.content ?? '';
  }
  return result;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function generateText(req: AiRequest): Promise<string> {
  const provider = env.AI_PROVIDER;

  if (provider === 'gemini') return callGemini(req);
  if (provider === 'nvidia') return callNvidia(req);
  return callAnthropic(req);
}
