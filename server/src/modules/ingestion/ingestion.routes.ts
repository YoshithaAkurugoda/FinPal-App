import { Router } from 'express';
import multer from 'multer';
import { submitSmsSchema } from '@finpal/shared';

import { authMiddleware } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { submitSmsHandler, submitStatementHandler } from './ingestion.controller.js';

const router = Router();

const statementUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/x-pdf' ||
      file.originalname.toLowerCase().endsWith('.pdf');
    if (ok) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

router.use(authMiddleware);

router.post('/sms', validate(submitSmsSchema), submitSmsHandler);
router.post('/statement', (req, res, next) => {
  statementUpload.single('file')(req, res, (err) => {
    if (err) {
      res.status(400).json({ success: false, error: err.message });
      return;
    }
    next();
  });
}, submitStatementHandler);

export default router;
