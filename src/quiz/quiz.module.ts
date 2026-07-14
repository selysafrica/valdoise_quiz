import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './quiz.entity.js';
import { QuizService } from './quiz.service.js';
import { QuizController } from './quiz.controller.js';
import { ParticipantModule } from '../participant/participant.module.js';
import { ParticipationModule } from '../participation/participation.module.js';
import { SettingsModule } from '../settings/settings.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz]), ParticipantModule, ParticipationModule, SettingsModule],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
