import { Router } from 'express';
import { monthReportSchema, merchantReportSchema, trendReportSchema } from '@finpal/shared';

import { authMiddleware } from '../../middleware/auth.js';
import { validateQuery } from '../../middleware/validate.js';
import {
  getMonthlyReportHandler,
  getMerchantReportHandler,
  getMonthOverMonthHandler,
  getSavingsTrendHandler,
  getIncomePercentagesHandler,
} from './reports.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/monthly', validateQuery(monthReportSchema), getMonthlyReportHandler);
router.get('/merchants', validateQuery(merchantReportSchema), getMerchantReportHandler);
router.get('/month-over-month', validateQuery(trendReportSchema), getMonthOverMonthHandler);
router.get('/savings-trend', validateQuery(trendReportSchema), getSavingsTrendHandler);
router.get('/income-percentages', validateQuery(monthReportSchema), getIncomePercentagesHandler);

export default router;
