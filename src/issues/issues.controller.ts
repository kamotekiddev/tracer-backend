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
} from '@nestjs/common';
import { IssuesService } from './issues.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthenticatedRequest } from 'src/projects/projects.interface';

@UseGuards(AuthGuard)
@Controller('issues')
export class IssuesController {
    constructor(private readonly issuesService: IssuesService) {}

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
    ) {
        return this.issuesService.update(id, updateIssueDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.issuesService.remove(id);
    }
}
