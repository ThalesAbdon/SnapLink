import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entity/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() input: CreateUserDto): Promise<User> {
    return this.userService.create(input);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: number): Promise<User> {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async softDelete(@Param('id') id: number): Promise<void> {
    return this.userService.softDelete(id);
  }
}
