import type { Request, Response } from 'express';

import { getUserId } from '../../middleware/auth.js';
import * as reportsService from './reports.service.js';

export async function getMonthlyReportHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const now = new Date();
    const month = req.query.month ? parseInt(req.query.month as string, 10) : now.getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year as string, 10) : now.getFullYear();

    if (month < 1 || month > 12) {
      res.status(400).json({ success: false, error: 'Month must be between 1 and 12' });
      return;
    }

    const report = await reportsService.getMonthlyReport(userId, month, year);
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getMerchantReportHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const now = new Date();
    const from = (req.query.from as string) ?? new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const to = (req.query.to as string) ?? now.toISOString();
    const category = req.query.category as string | undefined;

    const report = await reportsService.getMerchantReport(userId, from, to, category);
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getMonthOverMonthHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const months = req.query.months ? parseInt(req.query.months as string, 10) : 6;
    const report = await reportsService.getMonthOverMonth(userId, months);
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getSavingsTrendHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const months = req.query.months ? parseInt(req.query.months as string, 10) : 6;
    const report = await reportsService.getSavingsTrend(userId, months);
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getIncomePercentagesHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const now = new Date();
    const month = req.query.month ? parseInt(req.query.month as string, 10) : now.getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year as string, 10) : now.getFullYear();

    const report = await reportsService.getIncomePercentages(userId, month, year);
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
