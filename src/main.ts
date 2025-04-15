import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from './utils/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(env.PORT);
}
bootstrap();
