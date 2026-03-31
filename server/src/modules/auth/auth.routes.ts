import { Router } from 'express';
import { registerSchema, loginSchema } from '@finpal/shared';

import { validate } from '../../middleware/validate.js';
import { authMiddleware } from '../../middleware/auth.js';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
} from './auth.controller.js';

const router = Router();

router.post('/register', validate(registerSchema), registerHandler);
router.post('/login', validate(loginSchema), loginHandler);
router.post('/refresh', refreshHandler);
router.post('/logout', authMiddleware, logoutHandler);

export default router;
