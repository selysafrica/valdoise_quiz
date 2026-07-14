import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Settings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  key: string;

  @Column()
  value: string;
}
