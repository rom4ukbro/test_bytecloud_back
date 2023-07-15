import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { morganLogger } from './common/morgan.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(morganLogger);
  app.enableCors();
  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Appointments backend')
    .setDescription('Appointments REST API')
    .setVersion(process.env.npm_package_version)
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
    },
  });

  await app.listen(configService.get('PORT'));
}
bootstrap();
