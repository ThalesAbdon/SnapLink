import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { nanoid } from 'nanoid';
import { Url } from '../entity/url.entity';
import { CreateUrlDto } from '../dto/create-url.dto';

@Injectable()
export class UrlService {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
  ) {}

  async create(createUrlDto: CreateUrlDto, host: string): Promise<any> {
    const { originalUrl, userId } = createUrlDto;
    const query = userId
      ? { originalUrl, userId }
      : { originalUrl, userId: IsNull() };

    const existingUrl = await this.urlRepository.findOneBy(query);
    if (existingUrl) {
      return { snapLink: `http://${host}/${existingUrl.shortenedUrl}` };
    }

    let shortenedUrl: string;
    let unique = false;
    const random = Math.floor(Math.random() * 6) + 1;
    while (!unique) {
      shortenedUrl = nanoid(random);
      const existingShortenedUrl = await this.urlRepository.findOneBy({
        shortenedUrl,
      });
      if (!existingShortenedUrl) {
        unique = true;
      }
    }

    const newUrl = this.urlRepository.create({
      shortenedUrl,
      originalUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: userId ? { id: userId } : null,
    });

    await this.urlRepository.save(newUrl);
    return { snapLink: `http://${host}${existingUrl.shortenedUrl}` };
  }

  async findByShortenedUrl(shortenedUrl: string): Promise<Url> {
    const x = await this.urlRepository.findOneBy({
      shortenedUrl: shortenedUrl,
    });
    return x;
  }

  async update(id: number, updateData: Partial<Url>): Promise<Url> {
    await this.urlRepository.update(id, updateData);
    return this.urlRepository.findOneBy({ id });
  }

  async findByUserId(userId: number): Promise<any> {
    console.log({ id: userId });
    const user = await this.urlRepository.findOneBy({ user: { id: userId } });
    console.log(user);
    if (!user) {
      throw new NotFoundException('User not found!');
    }
    return { originalUrl: user.originalUrl, clicksQuantity: user.clicks };
  }

  async softDelete(userId: number, id: number): Promise<void> {
    const url = await this.urlRepository.findOne({ where: { id, userId } });
    if (!url?.id) {
      throw new NotFoundException('Url not found!');
    }
    const result = await this.urlRepository.update(id, {
      deletedAt: new Date(),
    });
    if (result.affected === 0) {
      throw new NotFoundException('User not found!');
    }
  }
}
