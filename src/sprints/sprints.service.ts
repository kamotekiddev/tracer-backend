import { differenceInDays, isBefore, isSameDay } from 'date-fns';
import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { UpdateSprintDto } from './dto/update-sprint.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class SprintService {
    constructor(private readonly prisma: DatabaseService) {}

    async create(createSprintDto: CreateSprintDto) {
        const openSprint = await this.prisma.sprint.findFirst({
            where: { completed: false, projectId: createSprintDto.projectId },
        });

        if (openSprint)
            throw new BadRequestException('There is already a ongoing sprint');

        const startDate = new Date(createSprintDto.startDate);
        const endDate = new Date(createSprintDto.endDate);

        if (
            isBefore(startDate, new Date()) &&
            !isSameDay(startDate, new Date())
        )
            throw new BadRequestException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: [
                    {
                        property: 'startDate',
                        message: 'Should atleast today or later.',
                    },
                ],
            });

        if (differenceInDays(endDate, startDate) < 2)
            throw new BadRequestException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: [
                    {
                        property: 'endDate',
                        message:
                            'Should be atleast 2 day later than start date.',
                    },
                ],
            });

        const projectSprintsCount = await this.prisma.sprint.count({
            where: { projectId: createSprintDto.projectId },
        });

        const newSprint = await this.prisma.sprint.create({
            data: { ...createSprintDto, number: projectSprintsCount + 1 },
        });

        await this.prisma.project.update({
            data: { currentSprintId: newSprint.id },
            where: { id: createSprintDto.projectId },
        });

        return {
            message: 'Sprint created successfully',
            statusCode: HttpStatus.CREATED,
        };
    }

    findAll() {
        return this.prisma.sprint.findMany();
    }

    findOne(id: number) {
        return `This action returns a #${id} sprint`;
    }

    update(id: number, updateSprintDto: UpdateSprintDto) {
        return updateSprintDto;
    }

    remove(id: number) {
        return `This action removes a #${id} sprint`;
    }

    async complete(sprintId: string) {
        const existing = await this.prisma.sprint.findUnique({
            where: { id: sprintId },
        });
        if (!existing) throw new BadRequestException('Sprint does not exist.');

        if (existing.completed)
            throw new BadRequestException('Sprint already ended.');

        await this.prisma.$transaction(async (tx) => {
            const updatedSprint = await tx.sprint.update({
                where: { id: sprintId },
                data: { completed: true },
            });

            await tx.project.update({
                where: { id: updatedSprint.projectId },
                data: {
                    currentSprint: { disconnect: { id: updatedSprint.id } },
                },
            });
        });

        return {
            message: 'Sprint ended successfully.',
            statusCode: HttpStatus.OK,
        };
    }
}
