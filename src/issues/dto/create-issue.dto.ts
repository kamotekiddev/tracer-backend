import {
    IsEnum,
    IsOptional,
    IsString,
    IsUUID,
    MinLength,
} from 'class-validator';
import { IssueType } from '../entities/issue.entity';

export class CreateIssueDto {
    @IsUUID()
    projectId: string;

    @IsUUID()
    sprintId: string;

    @IsString()
    @MinLength(5)
    title: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsEnum(IssueType)
    type: IssueType;

    @IsString()
    @IsUUID()
    categoryId: string;

    @IsString()
    @IsUUID()
    @IsOptional()
    assigneeId: string;
}
