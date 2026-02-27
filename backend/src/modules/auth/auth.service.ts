import { Injectable, UnauthorizedException, NotFoundException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { FiscalYearService } from '../fiscal-year/fiscal-year.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';
import { FiscalYear } from '../../database/entities/fiscal-year.entity';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly fiscalYearService: FiscalYearService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: User; access_token: string; refresh_token: string; fiscalYear: FiscalYear }> {
    const user = await this.usersService.create(registerDto);

    // Get current active fiscal year
    const fiscalYear = await this.fiscalYearService.getActiveFiscalYear();

    const access_token = this.generateAccessToken(user, fiscalYear);
    const refresh_token = await this.generateRefreshToken(user);

    return {
      user,
      access_token,
      refresh_token,
      fiscalYear,
    };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; access_token: string; refresh_token: string; fiscalYear: FiscalYear }> {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    if (!user) {
      // ✅ Generic error message for all failure cases
      throw new UnauthorizedException('Username atau password salah');
    }

    // Determine fiscal year to use
    let fiscalYear: FiscalYear;
    
    if (loginDto.fiscalYearId) {
      // Use = fiscal year provided in login
      fiscalYear = await this.fiscalYearService.findOne(loginDto.fiscalYearId);
      
      // Update user's active fiscal year preference
      await this.usersService.updateActiveFiscalYear(user.id, loginDto.fiscalYearId);
      this.logger.log(`User ${user.username} logged in with fiscal year: ${fiscalYear.tahun}`);
    } else if (user.activeFiscalYearId) {
      // Use user's previously saved fiscal year preference
      fiscalYear = await this.fiscalYearService.findOne(user.activeFiscalYearId);
      this.logger.log(`User ${user.username} logged in with saved fiscal year: ${fiscalYear.tahun}`);
    } else {
      // Default to current active fiscal year
      fiscalYear = await this.fiscalYearService.getActiveFiscalYear();
      
      // Save this as user's preference
      await this.usersService.updateActiveFiscalYear(user.id, fiscalYear.id);
      this.logger.log(`User ${user.username} logged in with default fiscal year: ${fiscalYear.tahun}`);
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    const access_token = this.generateAccessToken(user, fiscalYear);
    const refresh_token = await this.generateRefreshToken(user);

    return {
      user,
      access_token,
      refresh_token,
      fiscalYear,
    };
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      // ✅ Run dummy bcrypt to maintain constant time
      // This prevents timing attack to detect if username exists
      await bcrypt.compare(
        password,
        '$2b$10$dummyhashXYZ1234567890abcdefghijklmnopqrstuv' // Fake hash
      );
      return null;
    }

    // ✅ CHECK STATUS BEFORE PASSWORD
    // This prevents leaking account status via timing
    if (user.status !== 'active') {
      // ✅ Still run bcrypt to maintain constant time
      await bcrypt.compare(password, user.password);
      // ✅ Return null instead of throwing specific exception
      // Generic error message will be shown by caller
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Generate JWT access token
   * Short-lived (15 minutes)
   */
  private generateAccessToken(user: User, fiscalYear: FiscalYear): string {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      fiscalYearId: fiscalYear.id,
      fiscalYear: fiscalYear.tahun,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Generate refresh token
   * Long-lived (7 days), stored in database
   */
  private async generateRefreshToken(user: User, ipAddress?: string, userAgent?: string): Promise<string> {
    const token = Buffer.from(await bcrypt.hash(`${user.id}:${Date.now()}:${Math.random()}`, 10)).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.refreshTokenRepository.save({
      token,
      userId: user.id,
      expiresAt,
      ipAddress,
      userAgent,
    });

    return token;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string) {
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken, revoked: false },
      relations: ['user'],
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedException('Refresh token expired');
    }

    if (tokenRecord.user.status !== 'active') {
      throw new UnauthorizedException('User account is not active');
    }

    // Get user's fiscal year
    const fiscalYear = tokenRecord.user.activeFiscalYearId
      ? await this.fiscalYearService.findOne(tokenRecord.user.activeFiscalYearId)
      : await this.fiscalYearService.getActiveFiscalYear();

    // Generate new access token
    const access_token = this.generateAccessToken(tokenRecord.user, fiscalYear);

    return {
      access_token,
      user: tokenRecord.user,
      fiscalYear,
    };
  }

  /**
   * Revoke a specific refresh token
   */
  async revokeRefreshToken(token: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { token },
      { revoked: true }
    );
  }

  /**
   * Revoke all refresh tokens for a user
   * Used when user changes password or on security events
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, revoked: false },
      { revoked: true }
    );
  }

  /**
   * Clean up expired refresh tokens
   * Should be run periodically (cron job)
   */
  async cleanExpiredTokens(): Promise<void> {
    await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }

  async getProfile(userId: string): Promise<User> {
    return this.usersService.findOne(userId);
  }

  /**
   * Change user password
   * Also revokes all refresh tokens for security
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    // Change password in users service
    await this.usersService.changePassword(userId, currentPassword, newPassword);

    // Revoke all refresh tokens for this user for security
    await this.revokeAllUserTokens(userId);
  }
}