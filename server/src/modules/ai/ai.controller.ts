import type { Request, Response } from 'express';

import { getUserId } from '../../middleware/auth.js';
import * as aiService from './ai.service.js';

export async function chatHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const reply = await aiService.handleChat(userId, req.body.messages);
    res.json({ success: true, data: reply });
  } catch (err: any) {
    const status = err.statusCode ?? 500;
    res.status(status).json({ success: false, error: err.message });
  }
}

export async function getInsightsHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const type = req.query.type as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const insights = await aiService.getInsights(userId, type, limit);
    res.json({ success: true, data: insights });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getCheckinHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const checkin = await aiService.getLatestCheckin(userId);
    res.json({ success: true, data: checkin });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
