import { Router } from 'express';
import { createWalletSchema, updateWalletSchema } from '@finpal/shared';

import { authMiddleware } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  listWalletsHandler,
  createWalletHandler,
  updateWalletHandler,
  deleteWalletHandler,
} from './wallets.controller.js';

const router = Router();

router.use(authMiddleware);

router.get('/', listWalletsHandler);
router.post('/', validate(createWalletSchema), createWalletHandler);
router.put('/:id', validate(updateWalletSchema), updateWalletHandler);
router.delete('/:id', deleteWalletHandler);

export default router;
