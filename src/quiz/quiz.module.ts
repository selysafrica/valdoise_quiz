import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './quiz.entity.js';
import { QuizService } from './quiz.service.js';
import { QuizController } from './quiz.controller.js';
import { ParticipantModule } from '../participant/participant.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz]), ParticipantModule],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
