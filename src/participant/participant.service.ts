import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participant } from './participant.entity.js';

@Injectable()
export class ParticipantService {
  constructor(
    @InjectRepository(Participant)
    private readonly participantRepo: Repository<Participant>,
  ) {}

  create(name: string, phone: string): Promise<Participant> {
    const participant = this.participantRepo.create({ name, phone });
    return this.participantRepo.save(participant);
  }

  findOne(id: number): Promise<Participant | null> {
    return this.participantRepo.findOneBy({ id });
  }

  async updateScore(id: number, score: number, totalQuestions: number): Promise<void> {
    await this.participantRepo.update(id, { score, totalQuestions });
  }

  findAll(): Promise<Participant[]> {
    return this.participantRepo.find({ order: { createdAt: 'DESC' } });
  }
}
