import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import path from 'path';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app: Express = express();

// Настройка CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Безопасность
app.use(
  helmet({
    frameguard: false,
    contentSecurityPolicy: false,
  })
);
// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP
  message: 'Слишком много запросов с этого IP, попробуйте позже',
});
app.use('/api/', limiter);

// Парсинг JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static frontend files
const publicPath = path.join(process.cwd(), 'public');
app.use(express.static(publicPath));
app.use('/assets', express.static(path.join(publicPath, 'assets')));

// Serve Web App index.html
app.get('/app', (_req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// Обработка несуществующих маршрутов
app.use(notFoundHandler);

// Глобальный обработчик ошибок
app.use(errorHandler);

app.use((err: any, req: any, res: any, next: any) => {
  console.error('❌ Express Error Stack:', err);
  res.status(500).send('Internal Server Error');
});

export default app;