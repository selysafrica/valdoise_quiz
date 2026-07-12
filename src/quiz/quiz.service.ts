import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './quiz.entity.js';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepo: Repository<Quiz>,
  ) {}

  findAll(): Promise<Quiz[]> {
    return this.quizRepo.find();
  }

  findOne(id: number): Promise<Quiz | null> {
    return this.quizRepo.findOneBy({ id });
  }

  create(data: Partial<Quiz>): Promise<Quiz> {
    const quiz = this.quizRepo.create(data);
    return this.quizRepo.save(quiz);
  }

  async update(id: number, data: Partial<Quiz>): Promise<Quiz | null> {
    await this.quizRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.quizRepo.delete(id);
  }
}
