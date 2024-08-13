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
import { UrlService } from '../service/url.service';
import { OptionalJwtAuthGuard } from 'src/auth/guard/optional-jwt-auth.guard';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { AuthRequest } from 'src/auth/interfaces/auth-request.interface';
import { UpdateUrlDto } from '../dto/update-url.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('URLs')
@Controller('')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('urls')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Cria uma nova url encurtada' })
  @ApiBody({ type: CreateUrlDto })
  @ApiResponse({
    status: 201,
    description: 'A URL foi criada com sucesso.',
    schema: {
      example: {
        snapLink: 'http://example.com/shortened-url',
      },
    },
  })
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
  @ApiOperation({ summary: 'Lista todas as URLs do usuário autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Retorna as URLs associados ao usuário autenticado.',
    type: [Url],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden resource',
  })
  async getMyUrls(@Request() req: AuthRequest): Promise<Url[]> {
    try {
      console.log(req.user.id);
      return await this.urlService.findByUserId(req.user.id);
    } catch (error) {
      throw new ForbiddenException('Forbidden resource');
    }
  }

  @Get(':shortenedUrl')
  @ApiOperation({
    summary: 'Redireciona para a URL original a partir de uma URL abreviada',
  })
  @ApiParam({
    name: 'shortenedUrl',
    type: String,
    description: 'O id de URL encurtada',
  })
  @ApiResponse({
    status: 302,
    description: 'Redireciona para a URL original',
  })
  @ApiResponse({
    status: 404,
    description: 'URL não encontrada!',
  })
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

  @Patch('update-url')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualizar uma URL encurtada' })
  @ApiBody({ type: UpdateUrlDto })
  @ApiResponse({
    status: 200,
    description: 'A URL foi atualizada com sucesso.',
  })
  @ApiResponse({
    status: 403,
    description: 'Recurso proibido',
  })
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
  @ApiOperation({ summary: 'Excluir uma URL encurtada' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'O ID da URL a ser excluída',
  })
  @ApiResponse({
    status: 204,
    description: 'A URL foi excluída com sucesso.',
  })
  @ApiResponse({
    status: 403,
    description: 'Recurso proibido',
  })
  async softDelete(
    @Req() req: AuthRequest,
    @Param('id') id: number,
  ): Promise<void> {
    return this.urlService.softDelete(req.user.id, +id);
  }
}
