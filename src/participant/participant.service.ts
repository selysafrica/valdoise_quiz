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

  findByPhone(phone: string): Promise<Participant | null> {
    return this.participantRepo.findOneBy({ phone });
  }

  async save(participant: Participant): Promise<Participant> {
    return this.participantRepo.save(participant);
  }

  async markAnswered(id: number, number: number, correct: boolean): Promise<void> {
    const participant = await this.findOne(id);
    if (!participant) return;
    if (!participant.answeredNumbers.includes(number)) {
      participant.answeredNumbers.push(number);
    }
    if (correct) {
      participant.score += 1;
    }
    await this.participantRepo.save(participant);
  }

  findAll(): Promise<Participant[]> {
    return this.participantRepo.find({ order: { createdAt: 'DESC' } });
  }
}
