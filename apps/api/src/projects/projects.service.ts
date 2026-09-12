import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { AuditService } from '../audit/audit.service.js';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  private validateDates(startDate?: string, endDate?: string) {
    if (startDate && endDate) {
      if (new Date(endDate) < new Date(startDate)) {
        throw new BadRequestException('endDate must be greater than or equal to startDate');
      }
    }
  }

  async create(userId: string, createProjectDto: CreateProjectDto) {
    this.validateDates(createProjectDto.startDate, createProjectDto.endDate);

    const project = await this.prisma.project.create({
      data: {
        ...createProjectDto,
        userId,
        startDate: createProjectDto.startDate ? new Date(createProjectDto.startDate) : null,
        endDate: createProjectDto.endDate ? new Date(createProjectDto.endDate) : null,
      },
    });
    
    this.audit.logEvent(userId, 'PROJECT_CREATED', 'Project', project.id);
    return project;
  }

  async findAll(userId: string, query: any) {
    const { search, status, page = 1, limit = 10, sortBy, sortDir = 'asc' } = query;
    const skip = (page - 1) * limit;
    const take = Number(limit);

    const where: any = { userId };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (status) {
      where.status = status;
    }

    const validSortFields = ['createdAt', 'name', 'startDate', 'endDate', 'status'];
    const orderBy: any = sortBy && validSortFields.includes(sortBy) 
      ? { [sortBy]: sortDir === 'desc' ? 'desc' : 'asc' } 
      : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take,
        orderBy,
      }),
      this.prisma.project.count({ where }),
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
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) throw new NotFoundException('Project not found');
    if (project.userId !== userId) throw new ForbiddenException('Access denied');

    return project;
  }

  async update(userId: string, id: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.findOne(userId, id);

    // Validate new dates combined with existing dates
    const startDate = updateProjectDto.startDate !== undefined ? updateProjectDto.startDate : project.startDate?.toISOString();
    const endDate = updateProjectDto.endDate !== undefined ? updateProjectDto.endDate : project.endDate?.toISOString();
    this.validateDates(startDate, endDate);

    const dataToUpdate: any = { ...updateProjectDto };
    if (updateProjectDto.startDate !== undefined) {
      dataToUpdate.startDate = updateProjectDto.startDate ? new Date(updateProjectDto.startDate) : null;
    }
    if (updateProjectDto.endDate !== undefined) {
      dataToUpdate.endDate = updateProjectDto.endDate ? new Date(updateProjectDto.endDate) : null;
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data: dataToUpdate,
    });
    
    this.audit.logEvent(userId, 'PROJECT_UPDATED', 'Project', updated.id);
    return updated;
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id); // validates ownership and existence

    const deleted = await this.prisma.project.delete({
      where: { id },
    });
    
    this.audit.logEvent(userId, 'PROJECT_DELETED', 'Project', deleted.id);
    return deleted;
  }
}
