import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: DatabaseService) {}

    create(createUserDto: CreateUserDto) {
        return createUserDto;
    }

    findAll() {
        return `This action returns all users`;
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        const sanitizedUser = this.prisma.excludeProperties(user, ['password']);

        return sanitizedUser;
    }

    update(id: number, updateUserDto: UpdateUserDto) {
        return { id, ...updateUserDto };
    }

    remove(id: number) {
        return `This action removes a #${id} user`;
    }
}
