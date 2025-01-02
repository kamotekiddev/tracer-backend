import { IsOptional, IsString } from 'class-validator';

export class CommentIssueDto {
    @IsOptional()
    @IsString()
    text: string;
}
