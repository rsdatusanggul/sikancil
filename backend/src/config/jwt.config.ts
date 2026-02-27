import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const getJwtConfig = (configService: ConfigService): JwtModuleOptions => {
  const secret = configService.get<string>('JWT_SECRET');

  // ✅ VALIDATE SECRET
  if (!secret) {
    throw new Error(
      '❌ JWT_SECRET is not defined in environment variables. ' +
      'Please set JWT_SECRET in your .env file.',
    );
  }

  // ✅ WARN IF DEFAULT SECRET
  const defaultSecrets = [
    'your-secret-key-change-this-in-production',
    'default-secret',
    'secret',
    'change-me',
  ];

  if (defaultSecrets.includes(secret.toLowerCase())) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        '❌ JWT_SECRET is set to a default/weak value in production. ' +
        'Please use a strong, random secret.',
      );
    }
    console.warn(
      '⚠️  WARNING: JWT_SECRET is set to a default value. ' +
      'This is insecure for production. Please change it in .env',
    );
  }

  // ✅ VALIDATE LENGTH
  if (secret.length < 32) {
    console.warn(
      `⚠️  WARNING: JWT_SECRET is only ${secret.length} characters. ` +
      'For better security, use at least 32 characters.',
    );
  }

  const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '15m';

  return {
    secret,
    signOptions: {
      expiresIn: expiresIn as any, // Type assertion for compatibility
    },
  };
};