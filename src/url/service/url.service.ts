import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { nanoid } from 'nanoid';
import { Url } from '../entity/url.entity';
import { CreateUrlDto } from '../dto/create-url.dto';
import { UpdateUrlDto } from '../dto/update-url.dto';

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
    const random = Math.floor(Math.random() * 3) + 4;
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
    return { snapLink: `http://${host}/${newUrl.shortenedUrl}` };
  }

  async findByShortenedUrl(shortenedUrl: string): Promise<Url> {
    const x = await this.urlRepository.findOneBy({
      shortenedUrl: shortenedUrl,
      deletedAt: IsNull(),
    });
    return x;
  }

  async updateClick(
    id: number,
    updateData: Partial<Url>,
  ): Promise<Record<string, any>> {
    await this.urlRepository.update(id, updateData);
    return { message: 'Url updated successfully!' };
  }

  async update(
    id: number,
    updateData: UpdateUrlDto,
    host: string,
  ): Promise<Record<string, any>> {
    const existingUrl = await this.urlRepository.findOneBy({
      userId: id,
      originalUrl: updateData.newOriginalUrl,
    });
    if (existingUrl) {
      return { snapLink: `http://${host}/${existingUrl.shortenedUrl}` };
    }
    const url = await this.urlRepository.findOneBy({
      userId: id,
      originalUrl: updateData.originalUrl,
      deletedAt: IsNull(),
    });
    if (!url?.id) {
      throw new NotFoundException('Url not found!');
    }
    await this.urlRepository.update(
      { id: url.id },
      {
        originalUrl: updateData.newOriginalUrl,
      },
    );
    return { message: 'Url updated successfully!' };
  }

  async listUrls(userId: number): Promise<Partial<Url[]>> {
    const urls = await this.urlRepository.find({
      where: { user: { id: userId }, deletedAt: null },
      select: ['originalUrl', 'userId', 'clicks'],
    });
    if (!urls || urls.length === 0) {
      throw new NotFoundException('User not found!');
    }
    return urls;
  }

  async softDelete(userId: number, id: number): Promise<void> {
    const url = await this.urlRepository.findOne({
      where: { id, userId, deletedAt: IsNull() },
    });
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
