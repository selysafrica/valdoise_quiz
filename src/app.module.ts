import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller.js';
import { QuizModule } from './quiz/quiz.module.js';
import { AdminModule } from './admin/admin.module.js';
import { ParticipantModule } from './participant/participant.module.js';
import { Quiz } from './quiz/quiz.entity.js';
import { Participant } from './participant/participant.entity.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'data/quiz.db',
      entities: [Quiz, Participant],
      synchronize: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
      exclude: ['/'],
    }),
    QuizModule,
    AdminModule,
    ParticipantModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
