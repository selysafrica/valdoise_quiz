import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Participation } from './participation.entity.js';
import { ParticipationService } from './participation.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Participation])],
  providers: [ParticipationService],
  exports: [ParticipationService],
})
export class ParticipationModule {}
