import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsEmail, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty({
    type: String,
    description: 'O nome do usuário',
    example: 'teste',
  })
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @ApiProperty({
    type: String,
    description: 'A senha do usuário',
    example: '123456',
  })
  password?: string;

  @IsOptional()
  @IsEmail()
  @MinLength(5)
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty({
    type: String,
    description: 'O email do usuário',
    example: '123456',
  })
  email?: string;
}
