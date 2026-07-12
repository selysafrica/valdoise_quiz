import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Participant } from './participant.entity.js';
import { ParticipantService } from './participant.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Participant])],
  providers: [ParticipantService],
  exports: [ParticipantService],
})
export class ParticipantModule {}
