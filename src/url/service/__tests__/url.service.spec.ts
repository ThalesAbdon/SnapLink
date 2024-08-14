import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UrlService } from '../url.service';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Url } from '../../repository/url.repository';
import { CreateUrlDto } from '../../dto/create-url.dto';
import { UpdateUrlDto } from '../../dto/update-url.dto';

describe('UrlService', () => {
  let service: UrlService;
  let repository: Repository<Url>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        {
          provide: getRepositoryToken(Url),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    repository = module.get<Repository<Url>>(getRepositoryToken(Url));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should return existing shortened URL if it exists', async () => {
      const createUrlDto: CreateUrlDto = {
        originalUrl: 'http://example.com',
        userId: 1,
      };
      const host = 'localhost';
      const existingUrl = { shortenedUrl: 'abc123' } as Url;

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(existingUrl);

      const result = await service.create(createUrlDto, host);
      expect(result).toEqual({
        snapLink: `http://${host}/${existingUrl.shortenedUrl}`,
      });
    });

    it('should create a new shortened URL if it does not exist', async () => {
      const createUrlDto: CreateUrlDto = {
        originalUrl: 'http://example.com',
        userId: 1,
      };
      const host = 'localhost';

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);
      jest
        .spyOn(repository, 'create')
        .mockReturnValue({ shortenedUrl: 'new123' } as Url);
      jest
        .spyOn(repository, 'save')
        .mockResolvedValue({ shortenedUrl: 'new123' } as Url);

      const result = await service.create(createUrlDto, host);
      expect(result).toEqual({ snapLink: `http://${host}/new123` });
    });

    it('should handle null userId', async () => {
      const createUrlDto: CreateUrlDto = {
        originalUrl: 'http://example.com',
        userId: null as any,
      };
      const host = 'localhost';

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);
      jest
        .spyOn(repository, 'create')
        .mockReturnValue({ shortenedUrl: 'new123' } as Url);
      jest
        .spyOn(repository, 'save')
        .mockResolvedValue({ shortenedUrl: 'new123' } as Url);

      const result = await service.create(createUrlDto, host);
      expect(result).toEqual({ snapLink: `http://${host}/new123` });
    });

    it('should handle undefined userId', async () => {
      const createUrlDto: CreateUrlDto = {
        originalUrl: 'http://example.com',
        userId: undefined,
      };
      const host = 'localhost';

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);
      jest
        .spyOn(repository, 'create')
        .mockReturnValue({ shortenedUrl: 'new123' } as Url);
      jest
        .spyOn(repository, 'save')
        .mockResolvedValue({ shortenedUrl: 'new123' } as Url);

      const result = await service.create(createUrlDto, host);
      expect(result).toEqual({ snapLink: `http://${host}/new123` });
    });
  });

  describe('findByShortenedUrl', () => {
    it('should return the URL entity if found', async () => {
      const shortenedUrl = 'abc123';
      const url = { shortenedUrl } as Url;

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(url);

      const result = await service.findByShortenedUrl(shortenedUrl);
      expect(result).toEqual(url);
    });

    it('should return null if URL entity is not found', async () => {
      const shortenedUrl = 'abc123';

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      const result = await service.findByShortenedUrl(shortenedUrl);
      expect(result).toBeNull();
    });
  });

  describe('updateClick', () => {
    it('should update the URL entity', async () => {
      const id = 1;
      const updateData = { clicks: 10 };

      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as any);

      const result = await service.updateClick(id, updateData);
      expect(result).toEqual({ message: 'Url updated successfully!' });
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if URL is not found', async () => {
      const id = 1;
      const updateData: UpdateUrlDto = {
        originalUrl: 'http://example.com',
        newOriginalUrl: 'http://newexample.com',
      };
      const host = 'localhost';

      jest.spyOn(repository, 'findOneBy').mockResolvedValue(null);

      await expect(service.update(id, updateData, host)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return existing shortened URL if it exists', async () => {
      const id = 1;
      const updateData: UpdateUrlDto = {
        originalUrl: 'http://example.com',
        newOriginalUrl: 'http://newexample.com',
      };
      const host = 'localhost';
      const existingUrl = { shortenedUrl: 'abc123' } as Url;

      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(existingUrl);

      const result = await service.update(id, updateData, host);
      expect(result).toEqual({
        snapLink: `http://${host}/${existingUrl.shortenedUrl}`,
      });
    });

    it('should update the URL entity if found', async () => {
      const id = 1;
      const updateData: UpdateUrlDto = {
        originalUrl: 'http://example.com',
        newOriginalUrl: 'http://newexample.com',
      };
      const host = 'localhost';
      const url = { id: 1, shortenedUrl: 'abc123' } as Url;

      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(null);
      jest.spyOn(repository, 'findOneBy').mockResolvedValueOnce(url);
      jest
        .spyOn(repository, 'update')
        .mockResolvedValue({ affected: 1 } as any);

      const result = await service.update(id, updateData, host);
      expect(result).toEqual({ message: 'Url updated successfully!' });
    });
  });

  describe('findByUserId', () => {
    it('should return URLs for the given user ID', async () => {
      const userId = 1;
      const urls = [
        { originalUrl: 'http://example.com', clicks: 10 },
      ] as Partial<Url[]>;

      jest.spyOn(repository, 'find').mockResolvedValue(urls as Url[]);

      const result = await service.listUrls(userId);
      expect(result).toEqual(urls);
    });

    it('should throw NotFoundException if no URLs are found', async () => {
      const userId = 1;

      jest.spyOn(repository, 'find').mockResolvedValue([]);

      await expect(service.listUrls(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete', () => {
    it('should throw NotFoundException if URL is not found', async () => {
      const userId = 1;
      const id = 1;

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.softDelete(userId, id)).rejects.toThrow(
        NotFoundException,
      );
    });

    describe('softDelete', () => {
      it('should throw NotFoundException if URL is not found', async () => {
        const userId = 1;
        const id = 1;

        jest.spyOn(repository, 'findOne').mockResolvedValue(null);

        await expect(service.softDelete(userId, id)).rejects.toThrow(
          NotFoundException,
        );
      });

      it('should soft delete the URL entity if found', async () => {
        const userId = 1;
        const id = 1;
        const url = { id: 1 } as Url;

        jest.spyOn(repository, 'findOne').mockResolvedValue(url);
        jest
          .spyOn(repository, 'update')
          .mockResolvedValue({ affected: 1 } as any);

        await service.softDelete(userId, id);
        const updateCall = (repository.update as jest.Mock).mock.calls[0][1];
        expect(updateCall.deletedAt.getTime()).toBeCloseTo(
          new Date().getTime(),
          -2,
        );
      });

      it('should throw NotFoundException if update does not affect any rows', async () => {
        const userId = 1;
        const id = 1;
        const url = { id: 1 } as Url;

        jest.spyOn(repository, 'findOne').mockResolvedValue(url);
        jest
          .spyOn(repository, 'update')
          .mockResolvedValue({ affected: 0 } as any);

        await expect(service.softDelete(userId, id)).rejects.toThrow(
          NotFoundException,
        );
      });
    });
  });
});
