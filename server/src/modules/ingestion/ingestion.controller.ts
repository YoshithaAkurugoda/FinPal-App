import type { Request, Response } from 'express';
import { uploadStatementSchema } from '@finpal/shared';

import { getUserId } from '../../middleware/auth.js';
import * as ingestionService from './ingestion.service.js';

export async function submitSmsHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const log = await ingestionService.submitSms(userId, req.body);
    res.status(202).json({ success: true, data: { ingestionLogId: log.id } });
  } catch (err: any) {
    const status = err.statusCode ?? 500;
    res.status(status).json({ success: false, error: err.message });
  }
}

export async function submitStatementHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const file = req.file;
    if (!file?.buffer) {
      res.status(400).json({ success: false, error: 'Missing PDF file (field name: file)' });
      return;
    }
    const body = uploadStatementSchema.safeParse({
      walletId: typeof req.body?.walletId === 'string' ? req.body.walletId : '',
    });
    if (!body.success) {
      const msg = body.error.issues.map((i) => i.message).join('; ');
      res.status(400).json({ success: false, error: msg || 'Invalid wallet' });
      return;
    }
    const log = await ingestionService.submitStatement(userId, body.data.walletId, file);
    res.status(202).json({ success: true, data: { ingestionLogId: log.id } });
  } catch (err: any) {
    const status = err.statusCode ?? 500;
    res.status(status).json({ success: false, error: err.message });
  }
}
