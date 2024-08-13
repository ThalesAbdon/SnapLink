import {
  Controller,
  Post,
  Delete,
  Body,
  Patch,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
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

  @Patch()
  @UseGuards(JwtAuthGuard)
  async update(
    @Req() req: AuthRequest,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Record<string, any>> {
    try {
      return this.userService.update(req.user.id, updateUserDto);
    } catch (error) {
      throw new ForbiddenException('Forbidden resource');
    }
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async softDelete(@Req() req: AuthRequest): Promise<void> {
    try {
      return this.userService.softDelete(req.user.id);
    } catch (error) {
      throw new ForbiddenException('Forbidden resource');
    }
  }
}
