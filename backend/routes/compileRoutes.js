import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { compileCode } from '../controllers/compileController.js';

const router = express.Router();

router.post('/', protect, compileCode);

export default router;
