import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module.js';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const hbs = require('hbs');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const viewsDir = join(__dirname, '..', 'views');
  app.setBaseViewsDir(viewsDir);
  app.setViewEngine('hbs');

  hbs.registerPartials(join(viewsDir, 'partials'));
  hbs.registerHelper('eq', (a: any, b: any) => a === b);
  hbs.registerHelper('includes', (arr: any[], val: any) => arr && arr.includes(val));
  hbs.registerHelper('add', (a: number, b: number) => a + b);
  hbs.registerHelper('json', (obj: any) => JSON.stringify(obj));
  hbs.registerHelper('percentage', (a: number, b: number) => b > 0 ? Math.round((a / b) * 100) : 0);

  await app.listen(process.env.PORT ?? 3002);
  console.log(`Application running on http://localhost:${process.env.PORT ?? 3002}`);
}
bootstrap();
