import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CaptchaService } from './captcha.service';
import { UsersModule } from '../users/users.module';
import { FiscalYearModule } from '../fiscal-year/fiscal-year.module';
import { RefreshToken } from './entities/refresh-token.entity';
import { getJwtConfig } from '../../config/jwt.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    UsersModule,
    FiscalYearModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, CaptchaService],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy, PassportModule, CaptchaService],
})
export class AuthModule {}