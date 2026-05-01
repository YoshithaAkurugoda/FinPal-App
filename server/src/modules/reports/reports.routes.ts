import { Router } from 'express';

import { authMiddleware } from '../../middleware/auth.js';
import {
  getMonthlyReportHandler,
  getMerchantReportHandler,
  getMonthOverMonthHandler,
  getSavingsTrendHandler,
  getIncomePercentagesHandler,
} from './reports.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/monthly', getMonthlyReportHandler);
router.get('/merchants', getMerchantReportHandler);
router.get('/month-over-month', getMonthOverMonthHandler);
router.get('/savings-trend', getSavingsTrendHandler);
router.get('/income-percentages', getIncomePercentagesHandler);

export default router;
