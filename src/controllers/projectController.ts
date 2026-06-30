import { Response } from 'express';
import { AuthRequest, ApiResponse, CreateProjectDto, UpdateProjectDto } from '../types';
import prisma from '../config/database';
import { Prisma } from '@prisma/client';

/**
 * Получить все проекты текущего пользователя
 * GET /api/projects
 */
export async function getProjects(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Не авторизован' });
      return;
    }

    const { status } = req.query;

    const where: Prisma.ProjectWhereInput = {
      managerId: BigInt(req.user.telegramId),
      ...(status && { status: status as any }),
    };

    const projects = await prisma.project.findMany({
      where,
      include: {
        materials: true,
        workers: true,
        volumes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Конвертируем BigInt в Number для JSON
    const serializedProjects = projects.map((project) => ({
      ...project,
      managerId: Number(project.managerId),
      area: Number(project.area),
      ceilingHeight: Number(project.ceilingHeight),
      commissionValue: Number(project.commissionValue),
      finalQuote: project.finalQuote ? Number(project.finalQuote) : null,
      materials: project.materials.map((m) => ({
        ...m,
        quantity: Number(m.quantity),
        pricePerUnit: Number(m.pricePerUnit),
      })),
      workers: project.workers.map((w) => ({
        ...w,
        ratePerSqM: Number(w.ratePerSqM),
      })),
      volumes: project.volumes.map((v) => ({
        ...v,
        quantity: Number(v.quantity),
      })),
    }));

    const response: ApiResponse = {
      success: true,
      data: serializedProjects,
    };

    res.json(response);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ success: false, error: 'Ошибка получения проектов' });
  }
}

/**
 * Получить проект по ID
 * GET /api/projects/:id
 */
export async function getProjectById(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Не авторизован' });
      return;
    }

    const { id } = req.params;

    const project = await prisma.project.findFirst({
      where: {
        id,
        managerId: BigInt(req.user.telegramId),
      },
      include: {
        materials: true,
        workers: true,
        volumes: true,
      },
    });

    if (!project) {
      res.status(404).json({ success: false, error: 'Проект не найден' });
      return;
    }

    // Конвертируем BigInt в Number для JSON
    const serializedProject = {
      ...project,
      managerId: Number(project.managerId),
      area: Number(project.area),
      ceilingHeight: Number(project.ceilingHeight),
      commissionValue: Number(project.commissionValue),
      finalQuote: project.finalQuote ? Number(project.finalQuote) : null,
      materials: project.materials.map((m) => ({
        ...m,
        quantity: Number(m.quantity),
        pricePerUnit: Number(m.pricePerUnit),
      })),
      workers: project.workers.map((w) => ({
        ...w,
        ratePerSqM: Number(w.ratePerSqM),
      })),
      volumes: project.volumes.map((v) => ({
        ...v,
        quantity: Number(v.quantity),
      })),
    };

    const response: ApiResponse = {
      success: true,
      data: serializedProject,
    };

    res.json(response);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ success: false, error: 'Ошибка получения проекта' });
  }
}

/**
 * Создать новый проект
 * POST /api/projects
 */
export async function createProject(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Не авторизован' });
      return;
    }

    const data: CreateProjectDto = req.body;

    const project = await prisma.project.create({
      data: {
        managerId: BigInt(req.user.telegramId),
        name: data.name,
        address: data.address,
        area: new Prisma.Decimal(data.area),
        ceilingHeight: new Prisma.Decimal(data.ceilingHeight),
        currency: data.currency,
        commissionType: data.commissionType,
        commissionValue: new Prisma.Decimal(data.commissionValue),
        materials: data.materials
          ? {
              create: data.materials.map((m) => ({
                materialId: m.materialId,
                name: m.name,
                unit: m.unit,
                quantity: new Prisma.Decimal(m.quantity),
                pricePerUnit: new Prisma.Decimal(m.pricePerUnit),
              })),
            }
          : undefined,
        workers: data.workers
          ? {
              create: data.workers.map((w) => ({
                workerLabel: w.workerLabel,
                ratePerSqM: new Prisma.Decimal(w.ratePerSqM),
              })),
            }
          : undefined,
        volumes: data.volumes
          ? {
              create: data.volumes.map((v) => ({
                volumeType: v.volumeType,
                quantity: new Prisma.Decimal(v.quantity),
                unit: v.unit,
                isManual: v.isManual || false,
              })),
            }
          : undefined,
      },
      include: {
        materials: true,
        workers: true,
        volumes: true,
      },
    });

    // Конвертируем BigInt в Number для JSON
    const serializedProject = {
      ...project,
      managerId: Number(project.managerId),
      area: Number(project.area),
      ceilingHeight: Number(project.ceilingHeight),
      commissionValue: Number(project.commissionValue),
      finalQuote: project.finalQuote ? Number(project.finalQuote) : null,
      materials: project.materials.map((m) => ({
        ...m,
        quantity: Number(m.quantity),
        pricePerUnit: Number(m.pricePerUnit),
      })),
      workers: project.workers.map((w) => ({
        ...w,
        ratePerSqM: Number(w.ratePerSqM),
      })),
      volumes: project.volumes.map((v) => ({
        ...v,
        quantity: Number(v.quantity),
      })),
    };

    const response: ApiResponse = {
      success: true,
      data: serializedProject,
      message: 'Проект успешно создан',
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ success: false, error: 'Ошибка создания проекта' });
  }
}

/**
 * Обновить проект
 * PUT /api/projects/:id
 */
export async function updateProject(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Не авторизован' });
      return;
    }

    const { id } = req.params;
    const data: UpdateProjectDto = req.body;

    // Проверяем существование проекта и права доступа
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        managerId: BigInt(req.user.telegramId),
      },
    });

    if (!existingProject) {
      res.status(404).json({ success: false, error: 'Проект не найден' });
      return;
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.status && { status: data.status }),
        ...(data.area && { area: new Prisma.Decimal(data.area) }),
        ...(data.ceilingHeight && { ceilingHeight: new Prisma.Decimal(data.ceilingHeight) }),
        ...(data.currency && { currency: data.currency }),
        ...(data.commissionType && { commissionType: data.commissionType }),
        ...(data.commissionValue && { commissionValue: new Prisma.Decimal(data.commissionValue) }),
        ...(data.finalQuote !== undefined && {
          finalQuote: data.finalQuote ? new Prisma.Decimal(data.finalQuote) : null,
        }),
      },
      include: {
        materials: true,
        workers: true,
        volumes: true,
      },
    });

    // Конвертируем BigInt в Number для JSON
    const serializedProject = {
      ...project,
      managerId: Number(project.managerId),
      area: Number(project.area),
      ceilingHeight: Number(project.ceilingHeight),
      commissionValue: Number(project.commissionValue),
      finalQuote: project.finalQuote ? Number(project.finalQuote) : null,
      materials: project.materials.map((m) => ({
        ...m,
        quantity: Number(m.quantity),
        pricePerUnit: Number(m.pricePerUnit),
      })),
      workers: project.workers.map((w) => ({
        ...w,
        ratePerSqM: Number(w.ratePerSqM),
      })),
      volumes: project.volumes.map((v) => ({
        ...v,
        quantity: Number(v.quantity),
      })),
    };

    const response: ApiResponse = {
      success: true,
      data: serializedProject,
      message: 'Проект успешно обновлен',
    };

    res.json(response);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ success: false, error: 'Ошибка обновления проекта' });
  }
}

/**
 * Удалить проект
 * DELETE /api/projects/:id
 */
export async function deleteProject(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Не авторизован' });
      return;
    }

    const { id } = req.params;

    // Проверяем существование проекта и права доступа
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        managerId: BigInt(req.user.telegramId),
      },
    });

    if (!existingProject) {
      res.status(404).json({ success: false, error: 'Проект не найден' });
      return;
    }

    await prisma.project.delete({
      where: { id },
    });

    const response: ApiResponse = {
      success: true,
      message: 'Проект успешно удален',
    };

    res.json(response);
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ success: false, error: 'Ошибка удаления проекта' });
  }
}
