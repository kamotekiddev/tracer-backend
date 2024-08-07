import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    ValidationPipe,
    Request,
    ParseUUIDPipe,
    Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { AuthenticatedRequest, ProjectFilter } from './projects.interface';

@UseGuards(AuthGuard)
@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) {}

    @Post()
    create(
        @Body(ValidationPipe) createProjectDto: CreateProjectDto,
        @Request() req: AuthenticatedRequest,
    ) {
        return this.projectsService.create(req.user.userId, createProjectDto);
    }

    @Get()
    findAll(
        @Query('filter') filter: ProjectFilter,
        @Request() req: AuthenticatedRequest,
    ) {
        return this.projectsService.findAll(filter, req.user.userId);
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.projectsService.findOne(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body(ValidationPipe) updateProjectDto: UpdateProjectDto,
    ) {
        return this.projectsService.update(id, updateProjectDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.projectsService.remove(id);
    }

    @Get(':id/backlogs')
    getBacklogs(@Param('id', ParseUUIDPipe) id: string) {
        return this.projectsService.getProjectBacklogs(id);
    }

    @Get(':id/members')
    getProjectMembers(@Param('id', ParseUUIDPipe) id: string) {
        return this.projectsService.getProjectMembers(id);
    }

    @Get(':id/categories')
    getProjectCategories(@Param('id', ParseUUIDPipe) id: string) {
        return this.projectsService.getProjectCategories(id);
    }

    @Get(':id/sprints')
    getProjectSprints(@Param('id', ParseUUIDPipe) id: string) {
        return this.projectsService.getProjectSprints(id);
    }
}
