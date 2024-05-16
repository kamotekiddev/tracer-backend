import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: DatabaseService) {}

    async create(createCategoryDto: CreateCategoryDto) {
        const existingCategory = await this.prisma.category.findFirst({
            where: createCategoryDto,
        });

        if (existingCategory)
            throw new BadRequestException(
                'Category already exist on this project.',
            );

        return this.prisma.category.create({ data: createCategoryDto });
    }

    findAll() {
        return this.prisma.category.findMany();
    }

    findOne(id: string) {
        return this.prisma.category.findUnique({ where: { id } });
    }

    update(id: string, updateCategoryDto: UpdateCategoryDto) {
        return this.prisma.category.update({
            where: { id },
            data: updateCategoryDto,
        });
    }

    async remove(id: string) {
        const existed = await this.prisma.category.findUnique({
            where: { id },
        });

        if (!existed) throw new BadRequestException('Category does not exist.');

        return this.prisma.category.delete({ where: { id } });
    }
}
