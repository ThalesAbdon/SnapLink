import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';

export class CreateUrlDto {
  @IsNotEmpty()
  @IsUrl()
  @MinLength(5)
  @ApiProperty({
    type: URL,
    description: 'URL do site que o usuário deseja encurtar',
    example: 'https://teddydigital.io/',
  })
  originalUrl: string;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'userId deve ser um número inteiro maior ou igual a 1' })
  @ApiHideProperty()
  userId?: number;
}
