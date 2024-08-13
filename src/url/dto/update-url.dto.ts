import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, MinLength } from 'class-validator';

export class UpdateUrlDto {
  @IsNotEmpty()
  @IsString()
  @IsUrl()
  @MinLength(5)
  @ApiProperty({
    type: URL,
    description: 'URL do site que o usuário deseja encurtar',
    example: 'https://teddydigital.io/',
  })
  originalUrl: string;

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  @MinLength(5)
  @ApiProperty({
    type: URL,
    description: 'URL do site que o usuário deseja encurtar',
    example: 'https://teddydigital.io/',
  })
  newOriginalUrl: string;
}
