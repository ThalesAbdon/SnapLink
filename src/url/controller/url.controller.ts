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
  Patch,
  ForbiddenException,
} from '@nestjs/common';
import { Url } from '../entity/url.entity';
import { CreateUrlDto } from '../dto/create-url.dto';
import { UrlService } from '../services/url.service';
import { OptionalJwtAuthGuard } from 'src/auth/guard/optional-jwt-auth.guard';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { AuthRequest } from 'src/auth/interfaces/auth-request.interface';
import { UpdateUrlDto } from '../dto/update-url.dto';

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
  async getMyUrls(@Request() req: AuthRequest): Promise<Url[]> {
    try {
      console.log(req.user.id);
      return await this.urlService.findByUserId(req.user.id);
    } catch (error) {
      throw new ForbiddenException('Forbidden resource');
    }
  }

  @Get(':shortenedUrl')
  async redirect(
    @Param('shortenedUrl') shortenedUrl: string,
    @Res() res: Response,
  ): Promise<Record<string, any>> {
    const url = await this.urlService.findByShortenedUrl(shortenedUrl);
    if (!url || url.deletedAt) {
      return res.status(HttpStatus.NOT_FOUND).send('URL not found');
    }
    url.clicks++;
    await this.urlService.updateClick(url.id, url);
    res.redirect(url.originalUrl);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  async update(
    @Req() req: AuthRequest,
    @Body() updateUrlDto: UpdateUrlDto,
  ): Promise<Record<string, any>> {
    try {
      console.log(req.headers.host);
      return this.urlService.update(
        req.user.id,
        updateUrlDto,
        req.headers.host,
      );
    } catch (error) {
      throw new ForbiddenException('Forbidden resource');
    }
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
