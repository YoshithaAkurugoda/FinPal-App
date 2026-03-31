import { Router } from 'express';
import { createTransactionSchema, batchApproveSchema } from '@finpal/shared';

import { authMiddleware } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  listTransactionsHandler,
  createTransactionHandler,
  approveTransactionHandler,
  rejectTransactionHandler,
  batchApproveHandler,
} from './transactions.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/', listTransactionsHandler);
router.post('/', validate(createTransactionSchema), createTransactionHandler);
router.patch('/batch-approve', validate(batchApproveSchema), batchApproveHandler);
router.patch('/:id/approve', approveTransactionHandler);
router.patch('/:id/reject', rejectTransactionHandler);

export default router;
