import { Router } from 'express';
import { login, getSession } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.post('/login', login);
router.get('/me', authenticate, getSession);

export default router;

