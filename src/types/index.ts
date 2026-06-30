import bot from '../bot/index';
import express from 'express';

const app = express();
const PORT = 3000;

app.get('/', (_req, res) => {
    res.send('Бригадир-бэкенд работает');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

bot.launch().then(() => {
    console.log("Bot is running...");
}).catch((err) => {
    console.error("Ошибка запуска бота:", err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));