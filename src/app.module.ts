import { Module } from '@nestjs/common';
import { DatabaseService } from './database/database.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ProjectsModule } from './projects/projects.module';
import { CategoriesModule } from './categories/categories.module';
import { IssuesModule } from './issues/issues.module';

@Module({
    imports: [
        DatabaseModule,
        AuthModule,
        ConfigModule.forRoot(),
        ProjectsModule,
        CategoriesModule,
        IssuesModule,
    ],
    providers: [DatabaseService],
})
export class AppModule {}
