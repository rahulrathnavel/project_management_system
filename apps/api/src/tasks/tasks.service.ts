import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { AuditService } from '../audit/audit.service.js';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  private async verifyProjectOwnership(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    if (project.userId !== userId) {
      throw new ForbiddenException('Access denied to this project');
    }
    return project;
  }

  async create(userId: string, createTaskDto: CreateTaskDto) {
    await this.verifyProjectOwnership(userId, createTaskDto.projectId);

    const task = await this.prisma.task.create({
      data: {
        ...createTaskDto,
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      },
    });
    
    this.audit.logEvent(userId, 'TASK_CREATED', 'Task', task.id);
    return task;
  }

  async findAll(userId: string, query: any) {
    const { projectId, search, status, priority, page = 1, limit = 10, sortBy, sortDir = 'asc' } = query;
    const skip = (page - 1) * limit;
    const take = Number(limit);

    // If projectId is provided, verify it first to avoid returning empty array for unauthorized access
    if (projectId) {
      await this.verifyProjectOwnership(userId, projectId);
    }

    const where: any = {
      project: { userId }, // Ensure the parent project belongs to the user
    };

    if (projectId) where.projectId = projectId;
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const validSortFields = ['createdAt', 'name', 'dueDate', 'priority', 'status'];
    const orderBy: any = sortBy && validSortFields.includes(sortBy)
      ? { [sortBy]: sortDir === 'desc' ? 'desc' : 'asc' }
      : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take,
        orderBy,
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(userId: string, id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!task) throw new NotFoundException('Task not found');
    if (task.project.userId !== userId) throw new ForbiddenException('Access denied');

    const { project, ...taskData } = task; // hide nested project object if needed
    return taskData;
  }

  async update(userId: string, id: string, updateTaskDto: UpdateTaskDto) {
    // This implicitly verifies ownership through findOne
    await this.findOne(userId, id);

    const dataToUpdate: any = { ...updateTaskDto };
    if (updateTaskDto.dueDate !== undefined) {
      dataToUpdate.dueDate = updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : null;
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: dataToUpdate,
    });
    
    this.audit.logEvent(userId, 'TASK_UPDATED', 'Task', updated.id);
    return updated;
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id); // Verify ownership

    const deleted = await this.prisma.task.delete({
      where: { id },
    });
    
    this.audit.logEvent(userId, 'TASK_DELETED', 'Task', deleted.id);
    return deleted;
  }
}
