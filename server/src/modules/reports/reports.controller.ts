import type { Request, Response } from 'express';

import { getUserId } from '../../middleware/auth.js';
import * as reportsService from './reports.service.js';

export async function getMonthlyReportHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    // month/year are coerced and validated integers by validateQuery(monthReportSchema)
    const month = req.query.month as unknown as number;
    const year = req.query.year as unknown as number;
    const report = await reportsService.getMonthlyReport(userId, month, year);
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ success: false, error: 'Internal server error' });
  }
}

export async function getMerchantReportHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    // from/to are validated non-empty strings by validateQuery(merchantReportSchema)
    const from = req.query.from as string;
    const to = req.query.to as string;
    const category = req.query.category as string | undefined;
    const report = await reportsService.getMerchantReport(userId, from, to, category);
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ success: false, error: 'Internal server error' });
  }
}

export async function getMonthOverMonthHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const months = req.query.months as unknown as number;
    const report = await reportsService.getMonthOverMonth(userId, months);
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ success: false, error: 'Internal server error' });
  }
}

export async function getSavingsTrendHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const months = req.query.months as unknown as number;
    const report = await reportsService.getSavingsTrend(userId, months);
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ success: false, error: 'Internal server error' });
  }
}

export async function getIncomePercentagesHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const month = req.query.month as unknown as number;
    const year = req.query.year as unknown as number;
    const report = await reportsService.getIncomePercentages(userId, month, year);
    res.json({ success: true, data: report });
  } catch (err: any) {
    res.status(err.statusCode ?? 500).json({ success: false, error: 'Internal server error' });
  }
}
