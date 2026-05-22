function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  get DATABASE_URL() {
    return required('DATABASE_URL');
  },
  get UPSTASH_REDIS_REST_URL() {
    return optional('UPSTASH_REDIS_REST_URL', 'http://localhost:6379');
  },
  get UPSTASH_REDIS_REST_TOKEN() {
    return optional('UPSTASH_REDIS_REST_TOKEN', '');
  },
  get JWT_ACCESS_SECRET() {
    return required('JWT_ACCESS_SECRET');
  },
  get JWT_REFRESH_SECRET() {
    return required('JWT_REFRESH_SECRET');
  },
  get AI_PROVIDER() {
    return optional('AI_PROVIDER', 'nvidia') as 'anthropic' | 'gemini' | 'nvidia';
  },
  get ANTHROPIC_API_KEY() {
    return optional('ANTHROPIC_API_KEY', '');
  },
  get GEMINI_API_KEY() {
    return optional('GEMINI_API_KEY', '');
  },
  get NVIDIA_API_KEY() {
    return optional('NVIDIA_API_KEY', '');
  },
  get SUPABASE_URL() {
    return optional('SUPABASE_URL', '');
  },
  get SUPABASE_SERVICE_KEY() {
    return optional('SUPABASE_SERVICE_KEY', '');
  },
  get FIREBASE_PROJECT_ID() {
    return optional('FIREBASE_PROJECT_ID', '');
  },
  get FIREBASE_PRIVATE_KEY() {
    return optional('FIREBASE_PRIVATE_KEY', '');
  },
  get FIREBASE_CLIENT_EMAIL() {
    return optional('FIREBASE_CLIENT_EMAIL', '');
  },
  get PORT() {
    return parseInt(optional('PORT', '3000'), 10);
  },
  get NODE_ENV() {
    return optional('NODE_ENV', 'development');
  },
  get ALLOWED_ORIGINS() {
    const raw = optional('ALLOWED_ORIGINS', '');
    return raw ? raw.split(',').map((o) => o.trim()) : [];
  },
} as const;
