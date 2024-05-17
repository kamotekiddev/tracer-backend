import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateProjectDto {
    @IsString()
    @MinLength(5)
    name: string;

    @IsArray()
    @IsOptional()
    members: string[];
}
