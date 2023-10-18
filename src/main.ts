import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { CustomValidationPipe } from './utils/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new CustomValidationPipe());
  app.useStaticAssets(join(__dirname, '..', '..', 'uploads'));
  await app.listen(5000);
}
bootstrap();
