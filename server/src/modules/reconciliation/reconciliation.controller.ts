import type { Request, Response } from 'express';

import { getUserId } from '../../middleware/auth.js';
import * as reconciliationService from './reconciliation.service.js';

export async function getStatusHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const walletId = req.query.walletId as string;
    if (!walletId) {
      res.status(400).json({ success: false, error: 'walletId query parameter is required' });
      return;
    }
    const status = await reconciliationService.getReconciliationStatus(userId, walletId);
    res.json({ success: true, data: status });
  } catch (err: any) {
    const status = err.statusCode ?? 500;
    res.status(status).json({ success: false, error: err.message });
  }
}

export async function submitHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const result = await reconciliationService.submitReconciliation(userId, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err: any) {
    const status = err.statusCode ?? 500;
    res.status(status).json({ success: false, error: err.message });
  }
}
