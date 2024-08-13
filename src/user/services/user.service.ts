import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entity/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UrlRepository } from 'src/url/repository/url.repository';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UrlRepository)
    private readonly urlRepository: UrlRepository,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Record<string, any>> {
    try {
      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        +process.env.SALTROUNDS,
      );
      const user = this.userRepository.create({
        ...createUserDto,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await this.userRepository.save(user);
      return { message: 'User created successfully!' };
    } catch (error) {
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({ id });
      return user;
    } catch (error) {
      throw new NotFoundException('User not Found!');
    }
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<Record<string, any>> {
    try {
      console.log(id, updateUserDto);
      const user = await this.userRepository.findOneBy({ id });
      if (!user?.id) {
        throw new NotFoundException('User not found!');
      }
      if (updateUserDto?.password) {
        const hashedPassword = await bcrypt.hash(
          updateUserDto.password,
          +process.env.SALTROUNDS,
        );
        updateUserDto.password = hashedPassword;
      }
      await this.userRepository.update(id, {
        ...updateUserDto,
      });
      return { message: 'User updated successfully!' };
    } catch (error) {
      throw new BadRequestException('Not field to update!');
    }
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOneBy({ email, deletedAt: IsNull() });
  }

  async softDelete(id: number): Promise<void> {
    const result = await this.userRepository.update(id, {
      deletedAt: new Date(),
    });
    await this.urlRepository.deleteMany(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found!');
    }
  }
}
