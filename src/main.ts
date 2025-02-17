import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as bodyParser from 'body-parser';
import * as nodeCrypto from 'crypto';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService = app.get(ConfigService);
  const port = process.env.PORT || 3000;

    // 2) Aumentar límite de JSON y URL-encoded
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  await app.listen(port, () => {
    console.log(`Nest backend is running on http://localhost:${port}`);
  });
}


bootstrap();
