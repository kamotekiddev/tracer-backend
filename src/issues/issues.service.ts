import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class IssuesService {
    constructor(private readonly prisma: DatabaseService) {}

    async create(userId: string, createIssueDto: CreateIssueDto) {
        const { categoryId, assigneeId, projectId, sprintId, ...rest } =
            createIssueDto;

        return this.prisma.issue.create({
            data: {
                ...rest,
                project: { connect: { id: projectId } },
                sprint: { connect: { id: sprintId } },
                category: { connect: { id: categoryId } },
                reporter: { connect: { id: userId } },
                ...(assigneeId && {
                    assignee: { connect: { id: assigneeId } },
                }),
            },
        });
    }

    async findAll() {
        const issues = await this.prisma.issue.findMany({
            include: { category: true, reporter: true, assignee: true },
        });

        const sanitizeIssues = issues.map((issue) => {
            const assignee =
                issue.assigneeId &&
                this.prisma.excludeProperties(issue.assignee, ['password']);

            const reporter = this.prisma.excludeProperties(issue.reporter, [
                'password',
            ]);

            return {
                ...issue,
                assignee,
                reporter,
            };
        });

        return sanitizeIssues;
    }

    async findOne(id: string) {
        const issue = await this.prisma.issue.findUnique({
            where: { id },
            include: { assignee: true, category: true, reporter: true },
        });
        if (!issue) throw new NotFoundException('Issue does not exist.');

        return issue;
    }

    async update(id: string, updateIssueDto: UpdateIssueDto) {
        const { categoryId, assigneeId, projectId, sprintId, ...rest } =
            updateIssueDto;

        const existing = await this.prisma.issue.findUnique({ where: { id } });
        if (!existing) throw new BadRequestException('Issue does not exist.');

        return this.prisma.issue.update({
            where: { id },
            data: {
                ...rest,
                ...(projectId && {
                    project: { connect: { id: projectId } },
                }),
                ...(sprintId && {
                    sprint: { connect: { id: sprintId } },
                }),
                ...(categoryId && {
                    category: { connect: { id: categoryId } },
                }),
                ...(assigneeId && {
                    assignee: { connect: { id: assigneeId } },
                }),
            },
        });
    }

    async remove(id: string) {
        const existing = await this.prisma.issue.findUnique({ where: { id } });

        if (!existing) throw new BadRequestException('Issue does not exist.');

        return this.prisma.issue.delete({ where: { id } });
    }
}
