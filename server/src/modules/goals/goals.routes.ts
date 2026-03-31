import { Router } from 'express';
import { createGoalSchema, contributeGoalSchema } from '@finpal/shared';

import { authMiddleware } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  listGoalsHandler,
  createGoalHandler,
  contributeToGoalHandler,
} from './goals.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/', listGoalsHandler);
router.post('/', validate(createGoalSchema), createGoalHandler);
router.post('/:id/contribute', validate(contributeGoalSchema), contributeToGoalHandler);

export default router;
