import { IsString, IsUUID, MinLength } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    @MinLength(4)
    name: string;

    @IsString()
    @IsUUID()
    projectId: string;
}
