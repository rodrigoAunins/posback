import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS con varias opciones explícitas
  app.enableCors({
    origin: '*', // Permitir desde cualquier origen
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    // credentials: true, // si quieres enviar cookies o auth con cross-site
  });

  // Aumentar límite de payload
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  const port = process.env.PORT || 3000;
  await app.listen(port, () => {
    console.log(`Nest backend is running on port ${port}`);
  });
}
bootstrap();
