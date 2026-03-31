import type { Request, Response } from 'express';

import { getUserId } from '../../middleware/auth.js';
import * as usersService from './users.service.js';

export async function getProfileHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const profile = await usersService.getProfile(userId);
    res.json({ success: true, data: profile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateProfileHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const profile = await usersService.updateProfile(userId, req.body);
    res.json({ success: true, data: profile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateFcmTokenHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    await usersService.updateFcmToken(userId, req.body.fcmToken);
    res.json({ success: true, message: 'FCM token updated' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
