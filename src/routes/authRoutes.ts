import { Router } from 'express';
import { telegramAuth, getCurrentUser } from '../controllers/authController';
import { validateTelegramAuth, authenticateToken } from '../middleware/auth';

const router = Router();

// POST /api/auth/telegram - Авторизация через Telegram WebApp
router.post('/telegram', validateTelegramAuth, telegramAuth);

// GET /api/auth/me - Получить информацию о текущем пользователе
router.get('/me', authenticateToken, getCurrentUser);

export default router;
