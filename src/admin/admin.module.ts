import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller.js';
import { QuizModule } from '../quiz/quiz.module.js';
import { ParticipantModule } from '../participant/participant.module.js';

@Module({
  imports: [QuizModule, ParticipantModule],
  controllers: [AdminController],
})
export class AdminModule {}
