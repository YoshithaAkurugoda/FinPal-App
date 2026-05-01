import type { Request, Response } from 'express';

import { getUserId } from '../../middleware/auth.js';
import * as walletsService from './wallets.service.js';

export async function listWalletsHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const wallets = await walletsService.getWallets(userId);
    res.json({ success: true, data: wallets });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createWalletHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const wallet = await walletsService.createWallet(userId, req.body);
    res.status(201).json({ success: true, data: wallet });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateWalletHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    const wallet = await walletsService.updateWallet(userId, req.params.id as string, req.body);
    res.json({ success: true, data: wallet });
  } catch (err: any) {
    const status = err.statusCode ?? 500;
    res.status(status).json({ success: false, error: err.message });
  }
}

export async function deleteWalletHandler(req: Request, res: Response): Promise<void> {
  try {
    const userId = getUserId(req);
    await walletsService.deleteWallet(userId, req.params.id as string);
    res.json({ success: true, data: null });
  } catch (err: any) {
    const status = err.statusCode ?? 500;
    res.status(status).json({ success: false, error: err.message });
  }
}
