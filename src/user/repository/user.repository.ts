// src/user/user.repository.ts

import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entity/user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async findAllActive(): Promise<User[]> {
    return this.createQueryBuilder('user')
      .where('user.deletedAt IS NULL')
      .getMany();
  }

  async findOneActive(id: number): Promise<User | undefined> {
    return this.createQueryBuilder('user')
      .where('user.id = :id', { id })
      .andWhere('user.deletedAt IS NULL')
      .getOne();
  }
}
