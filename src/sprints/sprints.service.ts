import { differenceInDays, isBefore } from 'date-fns';
import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { UpdateSprintDto } from './dto/update-sprint.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class SprintService {
    constructor(private readonly prisma: DatabaseService) {}

    async create(createSprintDto: CreateSprintDto) {
        const openSprint = await this.prisma.sprint.findFirst({
            where: { completed: false },
        });

        if (openSprint)
            throw new BadRequestException('There is already a ongoing sprint');

        const startDate = new Date(createSprintDto.startDate);
        const endDate = new Date(createSprintDto.endDate);

        if (isBefore(new Date(), startDate))
            throw new BadRequestException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: [
                    {
                        property: 'startDate',
                        message: 'Start Date should be atleast today or later.',
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
                            'End Date should be atleast 2 day later than start date.',
                    },
                ],
            });

        await this.prisma.sprint.create({ data: createSprintDto });

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

    async complete(id: string) {
        const existing = await this.prisma.sprint.findUnique({ where: { id } });
        if (!existing) throw new BadRequestException('Sprint does not exist.');

        if (existing.completed)
            throw new BadRequestException('Sprint already ended.');

        await this.prisma.sprint.update({
            where: { id },
            data: { completed: true },
        });

        return {
            message: 'Sprint ended successfully.',
            statusCode: HttpStatus.OK,
        };
    }
}
