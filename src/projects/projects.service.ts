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

        return this.prisma.project.create({
            data: {
                name,
                ownerId: ownerId,
                members: {
                    connect: [
                        { id: ownerId },
                        ...members.map((id) => ({ id })),
                    ],
                },
            },
        });
    }

    findAll() {
        return this.prisma.project.findMany();
    }

    findOne(id: number) {
        return `This action returns a #${id} project`;
    }

    update(id: number, updateProjectDto: UpdateProjectDto) {
        return updateProjectDto;
    }

    remove(id: number) {
        return `This action removes a #${id} project`;
    }
}
