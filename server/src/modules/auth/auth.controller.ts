import type { Request, Response } from 'express';

import { getUserId } from '../../middleware/auth.js';
import * as authService from './auth.service.js';

export async function registerHandler(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    const status = err.statusCode ?? 500;
    res.status(status).json({ success: false, error: err.message });
  }
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
  try {
    const result = await authService.login(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    const status = err.statusCode ?? 500;
    res.status(status).json({ success: false, error: err.message });
  }
}

export async function refreshHandler(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ success: false, error: 'Refresh token is required' });
      return;
    }
    const tokens = await authService.refreshTokens(refreshToken);
    res.status(200).json({ success: true, data: tokens });
  } catch (err: any) {
    const status = err.statusCode ?? 500;
    res.status(status).json({ success: false, error: err.message });
  }
}

export async function logoutHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const { refreshToken } = req.body;
    await authService.logout(userId, refreshToken ?? '');
    res.status(200).json({ success: true, message: 'Logged out' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
