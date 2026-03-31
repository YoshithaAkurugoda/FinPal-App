import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { JWT_ACCESS_TTL, JWT_REFRESH_TTL } from '@finpal/shared';

import { prisma } from '../../lib/prisma.js';
import { redis } from '../../config/redis.js';
import { env } from '../../config/env.js';

const BCRYPT_ROUNDS = 12;
const REFRESH_TTL_SECONDS = 30 * 24 * 3600;

function generateTokens(userId: string, email: string) {
  const tokenId = crypto.randomUUID();

  const accessToken = jwt.sign({ userId, email }, env.JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_TTL,
  });

  const refreshToken = jwt.sign({ userId, tokenId }, env.JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_TTL,
  });

  return { accessToken, refreshToken, tokenId };
}

function sanitizeUser(user: { id: string; email: string; name: string; currency: string; monthlyIncome: unknown; createdAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    currency: user.currency,
    monthlyIncome: user.monthlyIncome ? Number(user.monthlyIncome) : null,
    createdAt: user.createdAt,
  };
}

export async function register(data: {
  email: string;
  password: string;
  name: string;
  monthlyIncome?: number;
  currency?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw Object.assign(new Error('Email already registered'), { statusCode: 409 });
  }

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      name: data.name,
      monthlyIncome: data.monthlyIncome,
      currency: data.currency ?? 'LKR',
    },
  });

  const { accessToken, refreshToken, tokenId } = generateTokens(user.id, user.email);
  await redis.set(`refresh:${tokenId}`, user.id, 'EX', REFRESH_TTL_SECONDS);

  return {
    user: sanitizeUser(user),
    tokens: { accessToken, refreshToken },
  };
}

export async function login(data: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) {
    throw Object.assign(new Error('Invalid email or password'), { statusCode: 401 });
  }

  const { accessToken, refreshToken, tokenId } = generateTokens(user.id, user.email);
  await redis.set(`refresh:${tokenId}`, user.id, 'EX', REFRESH_TTL_SECONDS);

  return {
    user: sanitizeUser(user),
    tokens: { accessToken, refreshToken },
  };
}

export async function refreshTokens(refreshToken: string) {
  let payload: { userId: string; tokenId: string };
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as typeof payload;
  } catch {
    throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
  }

  const stored = await redis.get(`refresh:${payload.tokenId}`);
  if (!stored || stored !== payload.userId) {
    throw Object.assign(new Error('Refresh token revoked'), { statusCode: 401 });
  }

  await redis.del(`refresh:${payload.tokenId}`);

  const fullUser = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      currency: true,
      monthlyIncome: true,
      createdAt: true,
    },
  });

  if (!fullUser) {
    throw Object.assign(new Error('User not found'), { statusCode: 401 });
  }

  const tokens = generateTokens(fullUser.id, fullUser.email);
  await redis.set(`refresh:${tokens.tokenId}`, fullUser.id, 'EX', REFRESH_TTL_SECONDS);

  return {
    user: sanitizeUser(fullUser),
    tokens: { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
  };
}

export async function logout(userId: string, refreshToken: string): Promise<void> {
  try {
    const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
      userId: string;
      tokenId: string;
    };
    if (payload.userId === userId) {
      await redis.del(`refresh:${payload.tokenId}`);
    }
  } catch {
    // Token already expired or invalid — still consider logout successful
  }
}
