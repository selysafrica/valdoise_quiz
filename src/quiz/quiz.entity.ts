import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Quiz {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  question: string;

  @Column('simple-json')
  options: string[];

  @Column('simple-json')
  answers: number[];

  @Column({ default: 30 })
  times: number;
}
