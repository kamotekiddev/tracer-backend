import { Module } from '@nestjs/common';
import { DatabaseService } from './database/database.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ProjectsModule } from './projects/projects.module';
import { CategoriesModule } from './categories/categories.module';
import { IssuesModule } from './issues/issues.module';
import { SprintModule } from './sprints/sprints.module';
import { UsersModule } from './users/users.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CloudinaryService } from './cloudinary/cloudinary.service';

@Module({
    imports: [
        DatabaseModule,
        AuthModule,
        ConfigModule.forRoot(),
        ProjectsModule,
        CategoriesModule,
        IssuesModule,
        SprintModule,
        UsersModule,
        CloudinaryModule,
    ],
    providers: [DatabaseService, CloudinaryService],
})
export class AppModule {}
