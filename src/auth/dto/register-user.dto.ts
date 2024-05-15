import {
    IsEmail,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class RegisterUserDto {
    @IsString()
    firstName: string;

    @IsString()
    @IsOptional()
    middleName: string;

    @IsString()
    lastName: string;

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    password: string;
}
