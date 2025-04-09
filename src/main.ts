import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS desde todos los orígenes
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Middleware de seguridad - Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Ajustar en producción
    }),
  );

  // Permitir grandes volúmenes de datos en request body
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  const port = process.env.PORT || 8080;
  await app.listen(port, () => {
    console.log(`Nest backend is running on port ${port}`);
  });
}
bootstrap();
