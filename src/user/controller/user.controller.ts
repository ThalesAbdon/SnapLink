import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entity/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { AuthRequest } from 'src/auth/interfaces/auth-request.interface';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() input: CreateUserDto): Promise<Record<string, any>> {
    return this.userService.create(input);
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

  @Delete()
  @UseGuards(JwtAuthGuard)
  async softDelete(@Req() req: AuthRequest): Promise<void> {
    return this.userService.softDelete(req.user.id);
  }
}
