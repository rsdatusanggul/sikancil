/**
 * Auth Form Validation Schemas
 */

import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username wajib diisi')
    .min(3, 'Username minimal 3 karakter'),
  password: z
    .string()
    .min(1, 'Password wajib diisi')
    .min(6, 'Password minimal 6 karakter'),
  fiscalYearId: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === '' || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),
      { message: 'Pilih tahun anggaran yang valid' }
    )
    .transform((val) => (val === '' ? undefined : val)),
  captchaId: z.string().min(1, 'CAPTCHA ID wajib diisi'),
  captcha: z.string().min(1, 'CAPTCHA wajib diisi'),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, 'Username wajib diisi')
      .min(3, 'Username minimal 3 karakter')
      .max(50, 'Username maksimal 50 karakter')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username hanya boleh huruf, angka, dan underscore'
      ),
    email: z
      .string()
      .min(1, 'Email wajib diisi')
      .email('Format email tidak valid'),
    fullName: z
      .string()
      .min(1, 'Nama lengkap wajib diisi')
      .min(3, 'Nama lengkap minimal 3 karakter')
      .max(100, 'Nama lengkap maksimal 100 karakter'),
    password: z
      .string()
      .min(1, 'Password wajib diisi')
      .min(6, 'Password minimal 6 karakter')
      .max(100, 'Password maksimal 100 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
