import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Participant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column('simple-json', { default: '[]' })
  quizOrder: number[];

  @Column('simple-json', { default: '[]' })
  answeredNumbers: number[];

  @Column({ default: 0 })
  score: number;

  @CreateDateColumn()
  createdAt: Date;
}
