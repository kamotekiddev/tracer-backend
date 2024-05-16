import { Module } from '@nestjs/common';
import { DatabaseService } from './database/database.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ProjectsModule } from './projects/projects.module';

@Module({
    imports: [
        DatabaseModule,
        AuthModule,
        ConfigModule.forRoot(),
        ProjectsModule,
    ],
    providers: [DatabaseService],
})
export class AppModule {}
