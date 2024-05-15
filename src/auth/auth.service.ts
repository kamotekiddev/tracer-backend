import * as bcrypt from 'bcrypt';
import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { RegisterUserDto } from './register-user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: DatabaseService) {}

  private encryptPassword(password: string) {
    const saltOrRounds = 10;
    return bcrypt.hash(password, saltOrRounds);
  }

  private isPasswordMatch(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
  }

  async register(registerUserDto: RegisterUserDto) {
    const userExist = await this.prisma.user.findUnique({
      where: { email: registerUserDto.email },
    });

    if (userExist)
      throw new BadRequestException('Email has already been taken');

    const hashPassword = await this.encryptPassword(registerUserDto.password);

    const createdUser = await this.prisma.user.create({
      data: { ...registerUserDto, password: hashPassword },
    });

    return this.prisma.excludeProperties(createdUser, ['password']);
  }
}
