import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { DatabaseService } from 'src/database/database.service';
import { UpdateIssueEvent } from './entities/issue.entity';

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
            include: {
                assignee: true,
                category: true,
                reporter: true,
                project: true,
            },
        });
        const sanitizedReporterObj = this.prisma.excludeProperties(
            issue.reporter,
            ['password'],
        );

        if (!issue) throw new NotFoundException('Issue does not exist.');

        return { ...issue, reporter: sanitizedReporterObj };
    }

    async updateIssueByEvent(id: string, updateIssueDto: UpdateIssueDto) {
        const { updateEvent, ...data } = updateIssueDto;

        let updateData: Partial<UpdateIssueDto> = {};

        const existing = await this.prisma.issue.findUnique({ where: { id } });
        if (!existing) throw new BadRequestException('Issue does not exist.');

        if (updateEvent === UpdateIssueEvent.DESCRIPTION_CHANGE)
            updateData = { description: data.description };

        if (updateEvent === UpdateIssueEvent.CATEGORY_CHANGE)
            updateData = { categoryId: data.categoryId };

        if (updateEvent === UpdateIssueEvent.SUMMARY_CHANGE)
            updateData = { summary: data.summary };

        if (updateEvent === UpdateIssueEvent.TYPE_CHANGE)
            updateData = { type: data.type };

        if (updateEvent === UpdateIssueEvent.ASSIGNEE_CHANGE)
            updateData = { assigneeId: data.assigneeId };

        return this.prisma.issue.update({ where: { id }, data: updateData });
    }

    async remove(id: string) {
        const existing = await this.prisma.issue.findUnique({ where: { id } });

        if (!existing) throw new BadRequestException('Issue does not exist.');

        return this.prisma.issue.delete({ where: { id } });
    }
}
