import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ProjectsService {
    constructor(private readonly prisma: DatabaseService) {}

    async create(ownerId: string, createProjectDto: CreateProjectDto) {
        const { members, name } = createProjectDto;

        const projectExisted = await this.prisma.project.findUnique({
            where: { name: name },
        });

        if (projectExisted)
            throw new BadRequestException(
                'The project name is already been taken.',
            );

        const memberIdsToConnect = (members || [])
            .filter((memberId) => memberId !== ownerId)
            .map((id) => ({ id }));

        return this.prisma.project.create({
            data: {
                name,
                ownerId: ownerId,
                members: {
                    connect: [{ id: ownerId }],
                    ...memberIdsToConnect,
                },
            },
        });
    }

    findAll() {
        return this.prisma.project.findMany();
    }

    async findOne(id: string) {
        const project = await this.prisma.project.findUnique({
            where: { id },
            include: { owner: true, members: true },
        });

        const ownerWithoutPassword = this.prisma.excludeProperties(
            project.owner,
            ['password'],
        );

        const membersWithoutPassword = project.members.map((member) =>
            this.prisma.excludeProperties(member, ['password']),
        );

        return {
            ...project,
            owner: ownerWithoutPassword,
            members: membersWithoutPassword,
        };
    }

    async update(id: string, updateProjectDto: UpdateProjectDto) {
        const { members, name } = updateProjectDto;

        const existingProject = await this.prisma.project.findUnique({
            where: { id },
            include: { members: true },
        });

        if (!existingProject)
            throw new BadRequestException('This project does not exist.');

        const memberIdsToAdd = members.filter(
            (memberId) =>
                !existingProject.members.some(
                    (member) => member.id === memberId,
                ),
        );

        const membersToRemove = existingProject.members.filter(
            (member) => !members.includes(member.id),
        );

        const updatedProject = await this.prisma.project.update({
            where: { id },
            data: {
                name,
                members: {
                    connect: memberIdsToAdd.map((id) => ({ id })),
                    disconnect: membersToRemove.map(({ id }) => ({ id })),
                },
            },
            include: { members: true },
        });

        const membersWithoutPassword = updatedProject.members.map((member) =>
            this.prisma.excludeProperties(member, ['password']),
        );

        return { ...updatedProject, members: membersWithoutPassword };
    }

    async remove(id: string) {
        const existed = await this.prisma.project.findUnique({ where: { id } });

        if (!existed) throw new BadRequestException('Project does not exist.');

        return this.prisma.project.delete({ where: { id } });
    }
}
