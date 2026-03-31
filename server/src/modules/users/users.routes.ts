import { Router } from 'express';
import { updateProfileSchema, updateFcmTokenSchema } from '@finpal/shared';

import { authMiddleware } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  getProfileHandler,
  updateProfileHandler,
  updateFcmTokenHandler,
} from './users.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/profile', getProfileHandler);
router.put('/profile', validate(updateProfileSchema), updateProfileHandler);
router.put('/fcm-token', validate(updateFcmTokenSchema), updateFcmTokenHandler);

export default router;
