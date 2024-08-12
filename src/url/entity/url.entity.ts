import { User } from 'src/user/entity/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('urls')
export class Url {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  originalUrl: string;

  @Column({ unique: true })
  shortenedUrl: string;

  @ManyToOne(() => User, (user) => user.urls, { nullable: true })
  user?: User;

  @Column({ default: 0 })
  clicks: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
