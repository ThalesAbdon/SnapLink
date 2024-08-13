import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { config } from './typeorm.config';
import { User } from './user/entity/user.entity';
import { Url } from './url/entity/url.entity';
import { AuthModule } from './auth/auth.module';
import { UrlModule } from './url/url.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(config),
    TypeOrmModule.forFeature([User, Url]),
    UserModule,
    UrlModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
