import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CommentIssueDto {
    @IsOptional()
    @IsString()
    text: string;

    @IsString()
    @IsUUID()
    authorId: string;
}
