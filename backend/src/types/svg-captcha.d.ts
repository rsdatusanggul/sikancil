declare module 'svg-captcha' {
  interface CaptchaOptions {
    size?: number;
    ignoreChars?: string;
    noise?: number;
    color?: boolean;
    background?: string;
    width?: number;
    height?: number;
    fontSize?: number;
    charPreset?: string;
  }

  interface CaptchaResult {
    text: string;
    data: string;
  }

  const svgCaptcha: {
    create(options?: CaptchaOptions): CaptchaResult;
    createMathExpr(options?: CaptchaOptions): CaptchaResult;
    createRandomText(size?: number): string;
  };

  export default svgCaptcha;
  export const create: (options?: CaptchaOptions) => CaptchaResult;
  export const createMathExpr: (options?: CaptchaOptions) => CaptchaResult;
  export const createRandomText: (size?: number) => string;
}
