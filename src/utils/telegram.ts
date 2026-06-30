import crypto from 'crypto';
import { TelegramWebAppInitData } from '../types';

/**
 * Валидация initData от Telegram WebApp
 * Проверяет подпись HMAC-SHA256 для защиты от подделки данных
 */
export function validateTelegramWebAppData(
  initData: string,
  botToken: string
): TelegramWebAppInitData | null {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      return null;
    }

    // Удаляем hash из параметров для проверки
    urlParams.delete('hash');

    // Сортируем параметры и создаем строку для проверки
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Создаем секретный ключ из токена бота
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Вычисляем hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Проверяем совпадение hash
    if (calculatedHash !== hash) {
      return null;
    }

    // Проверяем время (данные не должны быть старше 24 часов)
    const authDate = parseInt(urlParams.get('auth_date') || '0');
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - authDate > 86400) {
      return null;
    }

    // Парсим данные пользователя
    const userParam = urlParams.get('user');
    const user = userParam ? JSON.parse(userParam) : undefined;

    return {
      query_id: urlParams.get('query_id') || undefined,
      user,
      auth_date: authDate,
      hash,
    };
  } catch (error) {
    console.error('Error validating Telegram WebApp data:', error);
    return null;
  }
}

/**
 * Извлечение Telegram ID из initData
 */
export function extractTelegramId(initData: string, botToken: string): number | null {
  const validatedData = validateTelegramWebAppData(initData, botToken);
  return validatedData?.user?.id || null;
}
