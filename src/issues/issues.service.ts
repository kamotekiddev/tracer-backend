import {
    BadRequestException,
    HttpStatus,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { DatabaseService } from 'src/database/database.service';
import { UpdateIssueEvent } from './entities/issue.entity';
import { Issue } from '@prisma/client';
import { CommentIssueDto } from './dto/comment-issue.dto';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class IssuesService {
    constructor(
        private readonly prisma: DatabaseService,
        private readonly cloudinary: CloudinaryService,
    ) {}

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

    async updateIssueByEvent(
        issueId: string,
        updateIssueDto: UpdateIssueDto,
        updaterId: string,
    ) {
        const { updateEvent, ...data } = updateIssueDto;
        console.log('event fired');

        let newData: Partial<UpdateIssueDto> = {};
        let oldData: Partial<Issue> = {};

        const existing = await this.prisma.issue.findUnique({
            where: { id: issueId },
        });
        if (!existing) throw new BadRequestException('Issue does not exist.');

        if (updateEvent === UpdateIssueEvent.DESCRIPTION_CHANGE) {
            oldData = { description: existing.description };
            newData = { description: data.description };
        }

        if (updateEvent === UpdateIssueEvent.CATEGORY_CHANGE) {
            oldData = { categoryId: existing.categoryId };
            newData = { categoryId: data.categoryId };
        }

        if (updateEvent === UpdateIssueEvent.SUMMARY_CHANGE) {
            oldData = { summary: existing.summary };
            newData = { summary: data.summary };
        }

        if (updateEvent === UpdateIssueEvent.TYPE_CHANGE) {
            oldData = { type: existing.type };
            newData = { type: data.type };
        }

        if (updateEvent === UpdateIssueEvent.ASSIGNEE_CHANGE) {
            oldData = { assigneeId: existing.assigneeId };
            newData = { assigneeId: data.assigneeId };
        }

        await this.prisma.$transaction(async (tx) => {
            await tx.issueHistory.create({
                data: {
                    issueId,
                    changes: JSON.stringify(newData),
                    event: updateEvent,
                    oldData: JSON.stringify(oldData),
                    userId: updaterId,
                },
            });

            if (
                updateEvent === UpdateIssueEvent.ASSIGNEE_CHANGE &&
                !data.assigneeId
            )
                return await tx.issue.update({
                    where: { id: issueId },
                    data: {
                        assignee: { disconnect: { id: existing.assigneeId } },
                    },
                });

            await tx.issue.update({ where: { id: issueId }, data: newData });
        });

        return {
            message: 'Issue successfully been updated.',
            statusCode: HttpStatus.OK,
        };
    }

    async remove(id: string) {
        const existing = await this.prisma.issue.findUnique({ where: { id } });

        if (!existing) throw new BadRequestException('Issue does not exist.');

        return this.prisma.issue.delete({ where: { id } });
    }

    async getIssueHistory(issueId: string) {
        const existing = await this.prisma.issue.findUnique({
            where: { id: issueId },
        });

        if (!existing)
            throw new BadRequestException('This issue does not exist.');

        const issueHistory = await this.prisma.issueHistory.findMany({
            where: { issueId },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
        });

        const sanitizedIssueHistory = issueHistory.map(({ user, ...issue }) => {
            const sanitizedUser = this.prisma.excludeProperties(user, [
                'password',
            ]);

            return {
                ...issue,
                user: sanitizedUser,
            };
        });

        return sanitizedIssueHistory;
    }

    async comment(
        issueId: string,
        commentIssueDto: CommentIssueDto,
        photos: Express.Multer.File[],
    ) {
        const { authorId, text } = commentIssueDto;
        const notPhotosAttached = !photos || !photos.length;

        const issueExists = await this.prisma.issue.findUnique({
            where: { id: issueId },
        });

        if (!issueExists) throw new BadRequestException('Issue does not exist');

        if (notPhotosAttached) {
            return this.prisma.issueComment.create({
                data: {
                    text,
                    issueId,
                    authorId,
                },
            });
        }

        const uploadResponse = await this.cloudinary.uploadFiles(photos);

        return this.prisma.issueComment.create({
            data: {
                text,
                issueId,
                authorId,
                photos: uploadResponse.map(({ url }) => url),
            },
        });
    }
}
