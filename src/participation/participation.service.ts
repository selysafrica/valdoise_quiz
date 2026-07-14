import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Participation } from './participation.entity.js';

@Injectable()
export class ParticipationService {
  constructor(
    @InjectRepository(Participation)
    private readonly repo: Repository<Participation>,
  ) {}

  create(data: Partial<Participation>): Promise<Participation> {
    return this.repo.save(this.repo.create(data));
  }

  async countToday(participantId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.repo.count({
      where: { participantId, createdAt: MoreThanOrEqual(today) },
    });
  }

  findAll(): Promise<Participation[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  findByParticipant(participantId: number): Promise<Participation[]> {
    return this.repo.find({
      where: { participantId },
      order: { createdAt: 'DESC' },
    });
  }

  findWinners(): Promise<Participation[]> {
    return this.repo.find({
      where: { correct: true },
      order: { createdAt: 'DESC' },
    });
  }
}
