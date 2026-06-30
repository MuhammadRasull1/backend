import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { createBot } from './bot/index';

const PORT = process.env.PORT || 3000;
const botToken = process.env.TELEGRAM_BOT_TOKEN;

if (!botToken) {
  console.error("Ошибка: TELEGRAM_BOT_TOKEN не задан в переменных окружения!");
  process.exit(1);
}

const bot = createBot(botToken);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

bot.launch().then(() => {
  console.log("Bot is running...");
}).catch((err: any) => {
  console.error("Ошибка запуска бота:", err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));