import { Router } from 'express';
import { chatMessageSchema } from '@finpal/shared';

import { authMiddleware } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { chatHandler, getInsightsHandler, getCheckinHandler } from './ai.controller.js';

const router = Router();

router.use(authMiddleware);

router.post('/chat', validate(chatMessageSchema), chatHandler);
router.get('/insights', getInsightsHandler);
router.get('/checkin', getCheckinHandler);

export default router;
