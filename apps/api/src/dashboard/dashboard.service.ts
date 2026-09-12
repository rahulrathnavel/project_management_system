import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getMetrics(userId: string) {
    const [
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      projectsInProgress
    ] = await Promise.all([
      this.prisma.project.count({ where: { userId } }),
      this.prisma.task.count({ where: { project: { userId } } }),
      this.prisma.task.count({ where: { project: { userId }, status: 'COMPLETED' } }),
      this.prisma.task.count({ where: { project: { userId }, status: 'PENDING' } }),
      this.prisma.project.count({ where: { userId, status: 'IN_PROGRESS' } }),
    ]);

    return {
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      projectsInProgress,
    };
  }
}

