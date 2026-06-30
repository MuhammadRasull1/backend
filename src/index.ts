import express from 'express';
import dotenv from 'dotenv';
import { createBot } from './bot/index'; // Твой основной бот
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 1. Раздача фронтенда
app.use(express.static(path.join(__dirname, '../dist')));

// 2. Отдача index.html для работы React Router
app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// 3. Просто запуск бота без всякого анализа заметок
const botInstance = createBot(process.env.TELEGRAM_BOT_TOKEN as string);
botInstance.launch().then(() => console.log("Бот запущен!"));

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});