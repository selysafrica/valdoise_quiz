import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller.js';
import { QuizModule } from '../quiz/quiz.module.js';
import { ParticipantModule } from '../participant/participant.module.js';
import { ParticipationModule } from '../participation/participation.module.js';
import { SettingsModule } from '../settings/settings.module.js';

@Module({
  imports: [QuizModule, ParticipantModule, ParticipationModule, SettingsModule],
  controllers: [AdminController],
})
export class AdminModule {}
