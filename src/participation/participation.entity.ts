import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Participation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  participantId: number;

  @Column()
  participantName: string;

  @Column()
  participantPhone: string;

  @Column()
  quizId: number;

  @Column()
  quizQuestion: string;

  @Column()
  correct: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
