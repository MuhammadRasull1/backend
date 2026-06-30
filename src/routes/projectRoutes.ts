import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Все маршруты требуют авторизации
router.use(authenticateToken);

// GET /api/projects - Получить все проекты
router.get('/', getProjects);

// POST /api/projects - Создать новый проект
router.post('/', createProject);

// GET /api/projects/:id - Получить проект по ID
router.get('/:id', getProjectById);

// PUT /api/projects/:id - Обновить проект
router.put('/:id', updateProject);

// DELETE /api/projects/:id - Удалить проект
router.delete('/:id', deleteProject);

export default router;
