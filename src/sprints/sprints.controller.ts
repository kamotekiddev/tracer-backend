import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { SprintService } from './sprints.service';
import { CreateSprintDto } from './dto/create-sprint.dto';
import { UpdateSprintDto } from './dto/update-sprint.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('sprints')
export class SprintController {
    constructor(private readonly sprintService: SprintService) {}

    @Post()
    create(@Body() createSprintDto: CreateSprintDto) {
        return this.sprintService.create(createSprintDto);
    }

    @Get()
    findAll() {
        return this.sprintService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.sprintService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateSprintDto: UpdateSprintDto) {
        return this.sprintService.update(+id, updateSprintDto);
    }

    @Patch(':id/complete')
    complete(@Param('id') id: string) {
        return this.sprintService.complete(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.sprintService.remove(+id);
    }
}
