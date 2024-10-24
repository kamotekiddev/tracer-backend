import { Module } from '@nestjs/common';
import { IssuesService } from './issues.service';
import { IssuesController } from './issues.controller';
import { DatabaseModule } from 'src/database/database.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
    imports: [DatabaseModule, CloudinaryModule],
    controllers: [IssuesController],
    providers: [IssuesService],
})
export class IssuesModule {}
