import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUrlDto {
  @IsNotEmpty()
  @IsString()
  originalUrl: string;

  @IsNotEmpty()
  @IsString()
  newOriginalUrl: string;
}
