import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { logger: console });

    app.useGlobalPipes(
        new ValidationPipe({
            exceptionFactory: (errors) => {
                const result = errors.map((error) => ({
                    property: error.property,
                    message:
                        error.constraints[Object.keys(error.constraints)[0]],
                }));

                throw new BadRequestException(result);
            },
        }),
    );

    app.enableCors({ origin: '*' });
    app.setGlobalPrefix('api');

    await app.listen(8000);
}
bootstrap();
