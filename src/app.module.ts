import { Module } from '@nestjs/common';
import { DatabaseService } from './database/database.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [DatabaseModule, AuthModule, ConfigModule.forRoot()],
    providers: [DatabaseService],
})
export class AppModule {}
