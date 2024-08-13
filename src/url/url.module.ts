import { Module } from '@nestjs/common';
import { UrlService } from './service/url.service';
import { UrlController } from './controller/url.controller';
import { Url } from './entity/url.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UrlRepository } from './repository/url.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Url])],
  providers: [UrlService, JwtService, UrlRepository],
  controllers: [UrlController],
  exports: [UrlService],
})
export class UrlModule {}
