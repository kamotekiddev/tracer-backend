import { Module } from '@nestjs/common';
import { SprintService } from './sprints.service';
import { SprintController } from './sprints.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [SprintController],
    providers: [SprintService],
})
export class SprintModule {}
