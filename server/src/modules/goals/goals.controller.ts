import type { Request, Response } from 'express';

import { getUserId } from '../../middleware/auth.js';
import * as goalsService from './goals.service.js';

export async function listGoalsHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const goals = await goalsService.getGoals(userId);
    res.json({ success: true, data: goals });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createGoalHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const goal = await goalsService.createGoal(userId, req.body);
    res.status(201).json({ success: true, data: goal });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function contributeToGoalHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const result = await goalsService.contributeToGoal(userId, req.params.id as string, req.body);
    res.json({ success: true, data: result });
  } catch (err: any) {
    const status = err.statusCode ?? 500;
    res.status(status).json({ success: false, error: err.message });
  }
}
