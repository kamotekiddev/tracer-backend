import { IsDateString, IsString } from 'class-validator';

export class CreateSprintDto {
    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;

    @IsString()
    projectId: string;
}
