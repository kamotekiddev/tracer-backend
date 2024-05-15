import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user-dto';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { addDays, isBefore } from 'date-fns';
import { RefreshTokenDto } from './dto/refresh-token.dto';

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

  private isSessionExpired(expiration: Date) {
    return isBefore(new Date(expiration), new Date());
  }

  private async generateToken(
    { userId, type }: { userId: string; type: 'accessToken' | 'refreshToken' },
    options?: JwtSignOptions,
  ) {
    return await this.jwtService.signAsync({ userId, type }, options);
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

    const session = await this.prisma.session.create({
      data: {
        accessToken: await this.generateToken(
          { userId: user.id, type: 'accessToken' },
          { expiresIn: '10h' },
        ),
        refreshToken: await this.generateToken(
          { userId: user.id, type: 'refreshToken' },
          { expiresIn: '7d' },
        ),
        expires: addDays(new Date(), 6),
        userId: user.id,
      },
    });

    return {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    };
  }

  async refresh({ refreshToken }: RefreshTokenDto) {
    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
    });

    if (this.isSessionExpired(session.expires))
      throw new BadRequestException('Session already expired.');

    const { accessToken } = await this.prisma.session.update({
      where: { id: session.id },
      data: {
        accessToken: await this.generateToken(
          { userId: session.userId, type: 'accessToken' },
          { expiresIn: '10h' },
        ),
      },
    });

    return { accessToken };
  }
}
