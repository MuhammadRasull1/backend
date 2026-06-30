import { Response } from 'express';
import { AuthRequest, ApiResponse } from '../types';
import { generateToken } from '../utils/jwt';

/**
 * Авторизация через Telegram WebApp
 * POST /api/auth/telegram
 */
export async function telegramAuth(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Пользователь не найден' });
      return;
    }

    // Генерируем JWT токен
    const token = generateToken({
      telegramId: req.user.telegramId,
      role: req.user.role,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      username: req.user.username,
    });

    const response: ApiResponse = {
      success: true,
      data: {
        token,
        user: req.user,
      },
      message: 'Авторизация успешна',
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ошибка авторизации' });
  }
}

/**
 * Получение информации о текущем пользователе
 * GET /api/auth/me
 */
export async function getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const response: ApiResponse = {
      success: true,
      data: req.user,
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ошибка получения данных пользователя' });
  }
}
