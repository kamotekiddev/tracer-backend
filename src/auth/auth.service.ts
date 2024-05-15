import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user-dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: DatabaseService,
    private jwtService: JwtService,
  ) {}

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
      throw new BadRequestException('Email has already been taken.');

    const hashPassword = await this.encryptPassword(registerUserDto.password);

    const createdUser = await this.prisma.user.create({
      data: { ...registerUserDto, password: hashPassword },
    });

    return this.prisma.excludeProperties(createdUser, ['password']);
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginUserDto.email },
    });

    if (!user) throw new NotFoundException('User does not exist.');

    const passwordMatch = await this.isPasswordMatch(
      loginUserDto.password,
      user.password,
    );

    if (!passwordMatch)
      throw new BadRequestException('Invalid Email or Password');

    const payload = {
      id: user.id,
      email: user.email,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
    };
  }
}
