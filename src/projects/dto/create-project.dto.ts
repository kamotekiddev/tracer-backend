import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class CreateProjectDto {
    @IsString()
    name: string;

    @IsArray()
    @ArrayMinSize(1)
    members: string[];
}
