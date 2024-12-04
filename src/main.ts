import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      'origin': '*',
    },
  });

  await app.listen(process.env.PORT);

  Logger.log(`Server is running on http://localhost:${ process.env.PORT }`, 'Bootstrap');
}

bootstrap().then((r) => r);
