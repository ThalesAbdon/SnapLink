import { IsNotEmpty, IsString, IsEmail, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty({
    type: String,
    description: 'O nome do usuário',
    example: 'teste',
  })
  username: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @ApiProperty({
    type: String,
    description: 'A senha do usuário',
    example: '123456',
  })
  password: string;

  @IsNotEmpty()
  @IsEmail()
  @MinLength(5)
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty({
    type: String,
    description: 'O email do usuário',
    example: 'teste@gmail.com',
  })
  email: string;
}
