import { Telegraf, session } from 'telegraf';

// Оставляем этот единственный экспорт:
export const createBot = (token: string) => {
    const bot = new Telegraf(token);
    bot.use(session());

bot.command('start', async (ctx) => {
    await ctx.reply('Привет! Нажми на кнопку ниже, чтобы открыть приложение:', {
        reply_markup: {
            inline_keyboard: [
                [{ 
                    text: "Открыть Web App", 
                    web_app: { url: "https://zero-large-semisweet.ngrok-free.dev" } 
                }]
            ]
        }
    });
});

    return bot;
};

// СТРОКУ 17 (export { createBot };) НУЖНО УДАЛИТЬ!