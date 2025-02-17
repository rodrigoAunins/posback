import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS correctamente
  app.enableCors({
    origin: '*', // Cambiar a ['http://localhost:4200', 'https://tu-dominio.com'] en producción
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    credentials: true, // Si usas cookies o auth con credenciales cruzadas
  });

  // Middleware de seguridad - Helmet (Desactiva CSP temporalmente si hay problemas)
  app.use(
    helmet({
      contentSecurityPolicy: false, // Deshabilita CSP para evitar bloqueos (ajustar en producción)
    })
  );

  // Permitir grandes volúmenes de datos en request body
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  const port = process.env.PORT || 3000;
  await app.listen(port, () => {
    console.log(`Nest backend is running on port ${port}`);
  });
}
bootstrap();
