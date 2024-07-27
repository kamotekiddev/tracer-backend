import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { DatabaseService } from 'src/database/database.service';
import { ProjectFilter, ProjectListItem } from './projects.interface';

@Injectable()
export class ProjectsService {
    constructor(private readonly prisma: DatabaseService) {}

    async create(ownerId: string, createProjectDto: CreateProjectDto) {
        const { name, ...rest } = createProjectDto;

        const projectExisted = await this.prisma.project.findFirst({
            where: {
                name: {
                    contains: name,
                    mode: 'insensitive',
                },
            },
        });

        if (projectExisted)
            throw new BadRequestException(
                'The project name is already been taken.',
            );

        const createdProject = await this.prisma.project.create({
            data: {
                ...rest,
                name,
                ownerId: ownerId,
                members: {
                    connect: [{ id: ownerId }],
                },
            },
        });

        await this.prisma.category.createMany({
            data: [
                { projectId: createdProject.id, name: 'TODO' },
                { projectId: createdProject.id, name: 'IN PROGRESS' },
                { projectId: createdProject.id, name: 'DONE' },
            ],
        });

        return {
            message: 'Project successfully created',
            statusCode: HttpStatus.CREATED,
        };
    }

    async findAll(filter: ProjectFilter, userId: string) {
        let projects: ProjectListItem[] = [];

        if (!filter || filter === 'ALL')
            projects = await this.prisma.project.findMany({
                include: {
                    members: true,
                    owner: true,
                    categories: { include: { issues: true } },
                },
            });

        if ((filter = 'I_AM_MEMBER'))
            projects = await this.prisma.project.findMany({
                where: { members: { some: { id: userId } } },
                include: {
                    members: true,
                    owner: true,
                    categories: { include: { issues: true } },
                },
            });

        if ((filter = 'MY_PROJECTS'))
            projects = await this.prisma.project.findMany({
                where: { owner: { id: userId } },
                include: {
                    members: true,
                    owner: true,
                    categories: { include: { issues: true } },
                },
            });

        const formattedProjects = projects.map(
            ({ categories, members, ...project }) => {
                const issues = categories.map((category) => category.issues);
                const issuesCount = issues.reduce(
                    (total, curr) => total + curr.length,
                    0,
                );

                const owner = this.prisma.excludeProperties(project.owner, [
                    'password',
                ]);

                return {
                    ...project,
                    categories: categories.length,
                    members: members.length,
                    issues: issuesCount,
                    owner,
                };
            },
        );

        return formattedProjects;
    }

    async findOne(id: string) {
        const project = await this.prisma.project.findUnique({
            where: { id },
            include: {
                owner: true,
                members: true,
                categories: {
                    include: {
                        issues: { include: { reporter: true, assignee: true } },
                    },
                },
                currentSprint: true,
            },
        });

        const ownerWithoutPassword = this.prisma.excludeProperties(
            project.owner,
            ['password'],
        );

        const membersWithoutPassword = project.members.map((member) =>
            this.prisma.excludeProperties(member, ['password']),
        );

        const sanitizedCategory = project.categories.map((category) => {
            const issues = category.issues.map(
                ({ assignee, reporter, ...issue }) => {
                    const sanitizedAssignee =
                        assignee &&
                        this.prisma.excludeProperties(assignee, ['password']);

                    const sanitizedReporter = this.prisma.excludeProperties(
                        reporter,
                        ['password'],
                    );

                    return {
                        ...issue,
                        assignee: sanitizedAssignee,
                        reporter: sanitizedReporter,
                    };
                },
            );

            return {
                ...category,
                issues,
            };
        });

        return {
            ...project,
            owner: ownerWithoutPassword,
            members: membersWithoutPassword,
            categories: sanitizedCategory,
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

    async getProjectBacklogs(id: string) {
        return this.prisma.sprint.findMany({
            where: { projectId: id },
            include: {
                issues: { include: { category: true } },
            },
        });
    }
}
