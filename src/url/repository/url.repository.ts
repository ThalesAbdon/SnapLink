import { Repository } from 'typeorm';
import { Url } from '../entity/url.entity';
import { InjectRepository } from '@nestjs/typeorm';

export class UrlRepository extends Repository<Url> {
  constructor(
    @InjectRepository(Url)
    repository: Repository<Url>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }
  async deleteMany(userId: number): Promise<void> {
    this.createQueryBuilder()
      .update(Url)
      .set({ deletedAt: new Date() })
      .where(`userId = :userId`, { userId: userId })
      .execute();
  }
}

export { Url };
