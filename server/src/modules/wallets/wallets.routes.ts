import { Router } from 'express';
import { createWalletSchema } from '@finpal/shared';

import { authMiddleware } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { listWalletsHandler, createWalletHandler } from './wallets.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/', listWalletsHandler);
router.post('/', validate(createWalletSchema), createWalletHandler);

export default router;
