import { IsString, MinLength } from 'class-validator';

export class CreateProjectDto {
    @IsString()
    @MinLength(5)
    name: string;

    @IsString()
    @MinLength(3)
    key: string;

    description: string;
}
