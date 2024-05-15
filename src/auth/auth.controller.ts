import {
    Body,
    Controller,
    Delete,
    Headers,
    Patch,
    Post,
    ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user-dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    login(@Body(ValidationPipe) loginUserDto: LoginUserDto) {
        return this.authService.login(loginUserDto);
    }

    @Post('register')
    register(@Body(ValidationPipe) registerUserDto: RegisterUserDto) {
        return this.authService.register(registerUserDto);
    }

    @Patch('refresh')
    refresh(@Body(ValidationPipe) refreshTokenDto: RefreshTokenDto) {
        return this.authService.refresh(refreshTokenDto);
    }

    @Delete('logout')
    logout(@Headers() headers: any) {
        const [, token] = headers?.authorization?.split(' ') ?? [];

        return this.authService.logout(token);
    }
}
