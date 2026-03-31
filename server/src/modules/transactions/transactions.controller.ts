import type { Request, Response } from 'express';

import { getUserId } from '../../middleware/auth.js';
import * as txService from './transactions.service.js';

export async function listTransactionsHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const result = await txService.getTransactions(userId, {
      status: req.query.status as string | undefined,
      category: req.query.category as string | undefined,
      walletId: req.query.walletId as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
    });
    const { transactions, total, page, limit } = result;
    const hasMore = page * limit < total;
    res.json({
      success: true,
      data: { items: transactions, total, page, limit, hasMore },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createTransactionHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const tx = await txService.createManualTransaction(userId, req.body);
    res.status(201).json({ success: true, data: tx });
  } catch (err: any) {
    const status = err.statusCode ?? 500;
    res.status(status).json({ success: false, error: err.message });
  }
}

export async function approveTransactionHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const tx = await txService.approveTransaction(userId, req.params.id as string, req.body);
    res.json({ success: true, data: tx });
  } catch (err: any) {
    const status = err.statusCode ?? 500;
    res.status(status).json({ success: false, error: err.message });
  }
}

export async function rejectTransactionHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const tx = await txService.rejectTransaction(userId, req.params.id as string);
    res.json({ success: true, data: tx });
  } catch (err: any) {
    const status = err.statusCode ?? 500;
    res.status(status).json({ success: false, error: err.message });
  }
}

export async function batchApproveHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const count = await txService.batchApproveTransactions(userId, req.body.transactionIds);
    res.json({ success: true, data: { approved: count } });
  } catch (err: any) {
    const status = err.statusCode ?? 500;
    res.status(status).json({ success: false, error: err.message });
  }
}
