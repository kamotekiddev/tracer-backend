import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    ParseUUIDPipe,
    ValidationPipe,
    Request,
    Headers,
} from '@nestjs/common';
import { IssuesService } from './issues.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthenticatedRequest } from 'src/projects/projects.interface';
import { JwtService } from '@nestjs/jwt';

@UseGuards(AuthGuard)
@Controller('issues')
export class IssuesController {
    constructor(
        private readonly issuesService: IssuesService,
        private jwtService: JwtService,
    ) {}

    @Post()
    create(
        @Body(ValidationPipe) createIssueDto: CreateIssueDto,
        @Request() req: AuthenticatedRequest,
    ) {
        return this.issuesService.create(req.user.userId, createIssueDto);
    }

    @Get()
    findAll() {
        return this.issuesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.issuesService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateIssueDto: UpdateIssueDto,
        @Headers() headers: any,
    ) {
        const [, token] = headers?.authorization?.split(' ') ?? [];
        const { userId }: { userId: string } = this.jwtService.decode(token);

        return this.issuesService.updateIssueByEvent(
            id,
            updateIssueDto,
            userId,
        );
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.issuesService.remove(id);
    }

    @Get(':id/history')
    getIssueHistory(@Param('id', ParseUUIDPipe) id: string) {
        return this.issuesService.getIssueHistory(id);
    }
}
