import { IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateUrlDto {
  @IsNotEmpty()
  @IsUrl()
  originalUrl: string;

  @IsOptional()
  userId?: number;
}
