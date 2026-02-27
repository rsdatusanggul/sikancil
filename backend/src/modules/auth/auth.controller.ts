import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Res,
  Req,
} from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { CaptchaService } from './captcha.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { User } from '../users/entities/user.entity';
import { AuditService } from '../audit/audit.service';
import { AuditAction, AuditStatus } from '../audit/entities/audit-log.entity';

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly captchaService: CaptchaService,
    private readonly auditService: AuditService,
  ) {}

  private extractIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'] as string;
    return forwarded ? forwarded.split(',')[0].trim() : (req.ip ?? req.socket?.remoteAddress ?? '');
  }

  /**
   * Generate CAPTCHA
   * MODERATE rate limit: 10 per minute per IP
   */
  @Get('captcha')
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Generate CAPTCHA' })
  @ApiResponse({ status: 200, description: 'CAPTCHA generated successfully' })
  async getCaptcha() {
    return this.captchaService.generateCaptcha();
  }

  /**
   * Register a new user
   * VERY STRICT rate limit: 3 registrations per hour per IP
   */
  @Post('register')
  @Public()
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Username or email already exists' })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // ✅ VERIFY CAPTCHA FIRST
    const isCaptchaValid = await this.captchaService.verifyCaptcha(
      registerDto.captchaId,
      registerDto.captcha,
    );

    if (!isCaptchaValid) {
      throw new BadRequestException('CAPTCHA tidak valid atau telah kadaluarsa');
    }

    const result = await this.authService.register(registerDto);

    // ✅ SET ACCESS TOKEN IN HTTPONLY COOKIE
    res.cookie('accessToken', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    // ✅ SET REFRESH TOKEN IN HTTPONLY COOKIE
    res.cookie('refreshToken', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    return {
      user: result.user,
    };
  }

  /**
   * Login user
   * STRICT rate limit: 5 attempts per minute per IP
   */
  @Post('login')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    // ✅ VERIFY CAPTCHA FIRST
    const isCaptchaValid = await this.captchaService.verifyCaptcha(
      loginDto.captchaId,
      loginDto.captcha,
    );

    if (!isCaptchaValid) {
      throw new BadRequestException('CAPTCHA tidak valid atau telah kadaluarsa');
    }

    let result: Awaited<ReturnType<typeof this.authService.login>>;
    try {
      result = await this.authService.login(loginDto);
    } catch (err) {
      // Log LOGIN_FAILED — username tersedia dari body
      this.auditService.log({
        action:       AuditAction.LOGIN_FAILED,
        entityType:   'SESSION',
        entityLabel:  loginDto.username,
        status:       AuditStatus.FAILED,
        errorMessage: err?.message,
        ipAddress:    this.extractIp(req),
        userAgent:    req.headers['user-agent'],
      });
      throw err;
    }

    // ✅ SET ACCESS TOKEN IN HTTPONLY COOKIE
    res.cookie('accessToken', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    // ✅ SET REFRESH TOKEN IN HTTPONLY COOKIE
    res.cookie('refreshToken', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Log LOGIN berhasil
    this.auditService.log({
      userId:      result.user.id,
      userName:    result.user.fullName,
      userNip:     result.user.nip,
      userRole:    result.user.role,
      action:      AuditAction.LOGIN,
      entityType:  'SESSION',
      entityLabel: `Tahun ${result.fiscalYear.tahun}`,
      status:      AuditStatus.SUCCESS,
      ipAddress:   this.extractIp(req),
      userAgent:   req.headers['user-agent'],
    });

    // ✅ RETURN USER DATA (NO TOKENS IN RESPONSE BODY)
    return {
      user: result.user,
      fiscalYear: result.fiscalYear,
    };
  }

  /**
   * Refresh access token
   * MODERATE rate limit: 20 refreshes per minute per IP
   */
  @Post('refresh')
  @Public()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new BadRequestException('No refresh token provided');
    }

    const result = await this.authService.refreshAccessToken(refreshToken);

    // ✅ SET NEW ACCESS TOKEN COOKIE
    res.cookie('accessToken', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    // Log TOKEN_REFRESH
    this.auditService.log({
      userId:     result.user.id,
      userName:   result.user.fullName,
      userNip:    result.user.nip,
      userRole:   result.user.role,
      action:     AuditAction.TOKEN_REFRESH,
      entityType: 'SESSION',
      status:     AuditStatus.SUCCESS,
      ipAddress:  this.extractIp(req),
      userAgent:  req.headers['user-agent'],
    });

    return {
      message: 'Token refreshed successfully',
      user: result.user,
      fiscalYear: result.fiscalYear,
    };
  }

  /**
   * Logout user
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: User,
  ) {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      // ✅ REVOKE REFRESH TOKEN
      await this.authService.revokeRefreshToken(refreshToken);
    }

    // Log LOGOUT
    this.auditService.log({
      userId:     user?.id,
      userName:   user?.fullName,
      userNip:    user?.nip,
      userRole:   user?.role,
      action:     AuditAction.LOGOUT,
      entityType: 'SESSION',
      status:     AuditStatus.SUCCESS,
      ipAddress:  this.extractIp(req),
      userAgent:  req.headers['user-agent'],
    });

    // ✅ CLEAR COOKIES
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return { message: 'Logged out successfully' };
  }

  /**
   * Get current user profile
   * Requires authentication
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @SkipThrottle() // Skip rate limit for authenticated profile check
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  /**
   * Change password
   * Requires authentication
   */
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password or validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @CurrentUser() user: User,
    @Req() req: Request,
  ) {
    // Validate passwords match
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('Password baru tidak cocok');
    }

    // Change password
    await this.authService.changePassword(
      user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );

    // Log PASSWORD_CHANGE
    this.auditService.log({
      userId:     user.id,
      userName:   user.fullName,
      userNip:    user.nip,
      userRole:   user.role,
      action:     AuditAction.PASSWORD_CHANGE,
      entityType: 'USER',
      entityLabel: user.username,
      status:     AuditStatus.SUCCESS,
      ipAddress:  this.extractIp(req),
      userAgent:  req.headers['user-agent'],
    });

    return { message: 'Password berhasil diubah' };
  }
}