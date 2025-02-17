import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
// import * as nodeCrypto from 'crypto'; // si no lo usas, no hace falta

async function bootstrap() {
  // Si usaras randomUUID, harías:
  // if (!globalThis.crypto) {
  //   globalThis.crypto = nodeCrypto;
  // }

  const app = await NestFactory.create(AppModule, { cors: true });

  // Ya no pedimos el ConfigService
  // const configService = app.get(ConfigService); // ← quítalo

  // Puedes usar el process.env.PORT o un fallback
  const port = process.env.PORT || 3000;

  // Aumentar límite de payload
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  await app.listen(port, () => {
    console.log(`Nest backend is running on port ${port}`);
  });
}

bootstrap();
