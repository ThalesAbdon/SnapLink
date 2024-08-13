// src/user/user.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { JwtService } from '@nestjs/jwt';
import { UrlRepository } from 'src/url/repository/url.repository';
import { Url } from 'src/url/entity/url.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Url])],
  providers: [UserService, JwtService, UrlRepository],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
