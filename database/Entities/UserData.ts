import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserData as IUserData } from '../../interfaces/App';

@Entity('data')
export default class UserData implements IUserData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column({ type: 'jsonb' })
  data: any;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;
}
