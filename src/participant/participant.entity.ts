import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Participant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ default: 0 })
  score: number;

  @Column({ default: 0 })
  totalQuestions: number;

  @CreateDateColumn()
  createdAt: Date;
}
