import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS con configuración mejorada
  app.enableCors({
    origin: ['https://tudominio.com', 'https://luxury-seaturtle.static.domains'], // Cambiar esto en producción
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    credentials: true, // Importante si usas cookies o JWT con credenciales
  });

  // Middleware de seguridad: Content-Security-Policy (CSP)
  app.use((req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; connect-src 'self' https://posback-production.up.railway.app"
    );
    next();
  });

  // Permitir grandes volúmenes de datos en request body
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  const port = process.env.PORT || 3000;
  await app.listen(port, () => {
    console.log(`Nest backend is running on port ${port}`);
  });
}
bootstrap();
