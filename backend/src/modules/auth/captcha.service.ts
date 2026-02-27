import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { randomUUID } from 'crypto';

@Injectable()
export class CaptchaService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  /**
   * Generate a new Math CAPTCHA (easier for users)
   * Stored in cache with 5 minute TTL
   */
  async generateCaptcha(): Promise<{ id: string; question: string; answer?: string }> {
    // Generate simple math problem
    const num1 = Math.floor(Math.random() * 10) + 1; // 1-10
    const num2 = Math.floor(Math.random() * 10) + 1; // 1-10
    const operators = ['+', '-', '×'];
    const operator = operators[Math.floor(Math.random() * operators.length)];

    let answer: number;
    let question: string;

    switch (operator) {
      case '+':
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case '-':
        // Ensure positive result
        const larger = Math.max(num1, num2);
        const smaller = Math.min(num1, num2);
        answer = larger - smaller;
        question = `${larger} - ${smaller}`;
        break;
      case '×':
        answer = num1 * num2;
        question = `${num1} × ${num2}`;
        break;
      default:
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
    }

    const captchaId = this.generateCaptchaId();

    // ✅ Store answer in cache with TTL
    await this.cacheManager.set(
      `captcha:${captchaId}`,
      answer.toString(),
      300000 // 5 minutes in milliseconds
    );

    return {
      id: captchaId,
      question: `${question} = ?`,
    };
  }

  /**
   * Verify CAPTCHA
   * Deletes after verification (one-time use)
   */
  async verifyCaptcha(captchaId: string, userAnswer: string): Promise<boolean> {
    const text = await this.cacheManager.get<string>(`captcha:${captchaId}`);

    if (!text) {
      return false; // Not found or expired
    }

    // Delete immediately (one-time use security measure)
    await this.cacheManager.del(`captcha:${captchaId}`);

    // Compare trimmed strings (for math CAPTCHA)
    return text.trim() === userAnswer.trim();
  }

  /**
   * Generate unique CAPTCHA ID using crypto-secure random
   * ✅ FIX: Use randomUUID instead of Math.random()
   */
  private generateCaptchaId(): string {
    return `captcha_${randomUUID()}`;
  }
}