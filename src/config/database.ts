import { PrismaClient } from '@prisma/client';

// Создаем единственный экземпляр Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Обработка завершения процесса
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
