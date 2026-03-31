import { Router } from 'express';
import { submitReconciliationSchema } from '@finpal/shared';

import { authMiddleware } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { getStatusHandler, submitHandler } from './reconciliation.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/status', getStatusHandler);
router.post('/submit', validate(submitReconciliationSchema), submitHandler);

export default router;
