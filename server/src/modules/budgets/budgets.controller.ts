import type { Request, Response } from 'express';

import { getUserId } from '../../middleware/auth.js';
import * as budgetsService from './budgets.service.js';

export async function listBudgetsHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const budgets = await budgetsService.getBudgets(userId);
    res.json({ success: true, data: budgets });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createBudgetHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const budget = await budgetsService.createBudget(userId, req.body);
    res.status(201).json({ success: true, data: budget });
  } catch (err: any) {
    const status = err.statusCode ?? 500;
    res.status(status).json({ success: false, error: err.message });
  }
}

export async function updateBudgetHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const budget = await budgetsService.updateBudget(userId, req.params.id as string, req.body);
    res.json({ success: true, data: budget });
  } catch (err: any) {
    const status = err.statusCode ?? 500;
    res.status(status).json({ success: false, error: err.message });
  }
}

export async function deleteBudgetHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    await budgetsService.deleteBudget(userId, req.params.id as string);
    res.json({ success: true, data: null });
  } catch (err: any) {
    const status = err.statusCode ?? 500;
    res.status(status).json({ success: false, error: err.message });
  }
}
