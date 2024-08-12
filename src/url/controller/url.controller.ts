import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  Res,
  HttpStatus,
  Delete,
  Req,
} from '@nestjs/common';
import { Url } from '../entity/url.entity';
import { CreateUrlDto } from '../dto/create-url.dto';
import { UrlService } from '../services/url.service';
import { OptionalJwtAuthGuard } from 'src/auth/guard/optional-jwt-auth.guard';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { AuthRequest } from 'src/auth/interfaces/auth-request.interface';

@Controller('')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('urls')
  @UseGuards(OptionalJwtAuthGuard)
  async create(
    @Body() createUrlDto: CreateUrlDto,
    @Request() req,
  ): Promise<any> {
    if (req.user) {
      createUrlDto.userId = req.user.id;
    }
    const url = await this.urlService.create(createUrlDto, req.headers.host);
    return url;
  }

  @Get('all-urls')
  @UseGuards(JwtAuthGuard)
  async getMyUrls(@Request() req): Promise<Url[]> {
    console.log(req);
    return await this.urlService.findByUserId(req.user.userId);
  }

  @Get(':shortenedUrl')
  async redirect(
    @Param('shortenedUrl') shortenedUrl: string,
    @Res() res: Response,
  ): Promise<void> {
    const url = await this.urlService.findByShortenedUrl(shortenedUrl);
    if (!url || url.deletedAt) {
      res.status(HttpStatus.NOT_FOUND).send('URL not found');
      return;
    }
    url.clicks++;
    await this.urlService.update(url.id, url);
    res.redirect(url.originalUrl);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthGuard)
  async softDelete(
    @Req() req: AuthRequest,
    @Param('id') id: number,
  ): Promise<void> {
    return this.urlService.softDelete(req.user.id, +id);
  }
}
