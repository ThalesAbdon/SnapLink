import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User } from '../../entity/user.entity';
import { UrlRepository } from 'src/url/repository/url.repository';
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let urlRepository: UrlRepository;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockUrlRepository = {
    deleteMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: UrlRepository, useValue: mockUrlRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    urlRepository = module.get<UrlRepository>(UrlRepository);
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto = {
        username: 'test',
        email: 'test@example.com',
        password: 'password',
      };
      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        +process.env.SALTROUNDS,
      );
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);

      jest
        .spyOn(userRepository, 'create')
        .mockReturnValue(createUserDto as any);
      jest.spyOn(userRepository, 'save').mockResolvedValue({} as any);

      const result = await service.create(createUserDto);

      expect(result).toEqual({ message: 'User created successfully!' });
      expect(bcrypt.hash).toHaveBeenCalledWith(
        'password',
        +process.env.SALTROUNDS,
      );
      expect(userRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw an InternalServerErrorException if an error occurs', async () => {
      const createUserDto = {
        username: 'test',
        email: 'test@example.com',
        password: 'password',
      };
      jest.spyOn(bcrypt, 'hash').mockRejectedValue(new Error() as never);
      await expect(service.create(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw a ConflictException if the user already exists', async () => {
      const createUserDto = {
        username: 'test',
        email: 'test@example.com',
        password: 'password',
      };

      const existingUser = {
        id: 1,
        ...createUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(userRepository, 'findOneBy')
        .mockResolvedValue(existingUser as any);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const user = { id: 1, email: 'test@example.com' };
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user as any);

      const result = await service.findOne(1);

      expect(result).toEqual(user);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw a NotFoundException', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('should throw an unexpected error', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await expect(service.findOne(1)).rejects.toThrow(
        'An unexpected error occurred',
      );
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const id = 1;
      const updateUserDto = { password: 'newPassword', otherField: 'value' };
      const hashedPassword = 'hashedNewPassword';
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue({ id } as any);
      jest
        .spyOn(userRepository, 'update')
        .mockResolvedValue({ affected: 1 } as any);

      const result = await service.update(id, updateUserDto);

      expect(result).toEqual({ message: 'User updated successfully!' });
      expect(bcrypt.hash).toHaveBeenCalledWith(
        'newPassword',
        +process.env.SALTROUNDS,
      );
      expect(userRepository.update).toHaveBeenCalledWith(id, {
        ...updateUserDto,
        password: hashedPassword,
      });
    });

    it('should throw a NotFoundException if user is not found', async () => {
      const id = 1;
      const updateUserDto = { password: 'newPassword' };
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

      await expect(service.update(id, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw a BadRequestException if update fails', async () => {
      const id = 1;
      const updateUserDto = { password: 'newPassword' };
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue({ id } as any);
      jest
        .spyOn(userRepository, 'update')
        .mockResolvedValue({ affected: 0 } as any);

      await expect(service.update(id, updateUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw an error if an unexpected error occurs', async () => {
      const id = 1;
      const updateUserDto = { password: 'newPassword', otherField: 'value' };
      jest
        .spyOn(bcrypt, 'hash')
        .mockRejectedValue(new Error('Unexpected error') as never);
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue({ id } as any);

      await expect(service.update(id, updateUserDto)).rejects.toThrow(
        'An unexpected error occurred',
      );

      expect(bcrypt.hash).toHaveBeenCalledWith(
        'newPassword',
        +process.env.SALTROUNDS,
      );
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user by email', async () => {
      const user = { id: 1, email: 'test@example.com' };
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user as any);

      const result = await service.findOneByEmail('test@example.com');

      expect(result).toEqual(user);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        email: 'test@example.com',
        deletedAt: IsNull(),
      });
    });
  });

  describe('softDelete', () => {
    it('should soft delete a user and related URLs', async () => {
      const id = 1;
      jest
        .spyOn(userRepository, 'update')
        .mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(urlRepository, 'deleteMany').mockResolvedValue({} as any);

      await service.softDelete(id);

      expect(userRepository.update).toHaveBeenCalledWith(id, {
        deletedAt: expect.any(Date),
      });
      expect(urlRepository.deleteMany).toHaveBeenCalledWith(id);
    });

    it('should throw a NotFoundException if user is not found during soft delete', async () => {
      const id = 1;
      jest
        .spyOn(userRepository, 'update')
        .mockResolvedValue({ affected: 0 } as any);

      await expect(service.softDelete(id)).rejects.toThrow(NotFoundException);
    });
  });
});
