import { Router } from 'express';
import { createBudgetSchema, updateBudgetSchema } from '@finpal/shared';

import { authMiddleware } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  listBudgetsHandler,
  createBudgetHandler,
  updateBudgetHandler,
} from './budgets.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/', listBudgetsHandler);
router.post('/', validate(createBudgetSchema), createBudgetHandler);
router.put('/:id', validate(updateBudgetSchema), updateBudgetHandler);

export default router;
