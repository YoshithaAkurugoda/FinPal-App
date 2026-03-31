import { Router } from 'express';

import { authMiddleware } from '../../middleware/auth.js';
import { getMonthlyReportHandler } from './reports.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/monthly', getMonthlyReportHandler);

export default router;
