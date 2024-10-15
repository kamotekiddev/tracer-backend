import { PartialType } from '@nestjs/mapped-types';
import { CreateIssueDto } from './create-issue.dto';
import { UpdateIssueEvent } from '../entities/issue.entity';
import { IsEnum } from 'class-validator';

export class UpdateIssueDto extends PartialType(CreateIssueDto) {
    @IsEnum(UpdateIssueEvent)
    updateEvent: UpdateIssueEvent;
}
