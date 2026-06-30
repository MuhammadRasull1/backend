import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyToken } from '../utils/jwt';
import { validateTelegramWebAppData } from '../utils/telegram';
import prisma from '../config/database';

/**
 * Middleware для проверки JWT токена
 */
export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ success: false, error: 'Токен не предоставлен' });
      return;
    }

    const payload = verifyToken(token);
    if (!payload) {
      res.status(403).json({ success: false, error: 'Недействительный токен' });
      return;
    }

    req.user = payload;
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: 'Ошибка аутентификации' });
  }
}

/**
 * Middleware для проверки роли пользователя
 */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Не авторизован' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Недостаточно прав' });
      return;
    }

    next();
  };
}

/**
 * Middleware для валидации Telegram WebApp initData
 * Используется при первичной авторизации
 */
export async function validateTelegramAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { initData } = req.body;

    if (!initData) {
      res.status(400).json({ success: false, error: 'initData не предоставлен' });
      return;
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      res.status(500).json({ success: false, error: 'Токен бота не настроен' });
      return;
    }

    const validatedData = validateTelegramWebAppData(initData, botToken);
    if (!validatedData || !validatedData.user) {
      res.status(403).json({ success: false, error: 'Недействительные данные Telegram' });
      return;
    }

    // Получаем или создаем пользователя
    const user = await prisma.user.upsert({
      where: { telegramId: BigInt(validatedData.user.id) },
      update: {
        firstName: validatedData.user.first_name,
        lastName: validatedData.user.last_name,
        username: validatedData.user.username,
      },
      create: {
        telegramId: BigInt(validatedData.user.id),
        firstName: validatedData.user.first_name,
        lastName: validatedData.user.last_name,
        username: validatedData.user.username,
        role: 'MANAGER', // По умолчанию все новые пользователи - прорабы
      },
    });

    req.user = {
      telegramId: Number(user.telegramId),
      role: user.role,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      username: user.username || undefined,
    };

    next();
  } catch (error) {
    console.error('Telegram auth error:', error);
    res.status(500).json({ success: false, error: 'Ошибка авторизации' });
  }
}
