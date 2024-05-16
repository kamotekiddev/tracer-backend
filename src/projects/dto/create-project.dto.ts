import { ArrayMinSize, IsArray, IsString, MinLength } from 'class-validator';

export class CreateProjectDto {
    @IsString()
    @MinLength(5)
    name: string;

    @IsArray()
    @ArrayMinSize(1)
    members: string[];
}
