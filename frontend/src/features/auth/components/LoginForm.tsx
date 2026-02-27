/**
 * Login Form Component - Modern UI with shadcn/radix
 */

import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, RefreshCw, Calendar, User, Lock, Shield } from 'lucide-react';
import { useLogin } from '../hooks';
import { loginSchema, type LoginFormData } from '../schemas';
import { Button, Input, Label, Alert } from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface FiscalYear {
  id: string;
  tahun: number;
  status: string;
  isCurrent: boolean;
}

interface CaptchaResponse {
  id: string;
  question: string; // Math question like "3 + 5 = ?"
}

// Helper function to generate SVG captcha with distortion
const generateCaptchaSVG = (text: string): string => {
  const width = 200;
  const height = 60;
  const fontSize = 24;
  
  // Generate random parameters for distortion
  const rotation = (Math.random() - 0.5) * 10; // -5 to 5 degrees
  const offsetX = (Math.random() - 0.5) * 10; // -5 to 5 pixels
  const offsetY = (Math.random() - 0.5) * 10; // -5 to 5 pixels
  
  // Generate noise lines
  const lines = Array.from({ length: 5 }, () => {
    const y1 = Math.random() * height;
    const y2 = Math.random() * height;
    const opacity = 0.1 + Math.random() * 0.2;
    return `<line x1="0" y1="${y1}" x2="${width}" y2="${y2}" stroke="#000" stroke-width="1" opacity="${opacity}"/>`;
  }).join('');
  
  // Generate noise dots
  const dots = Array.from({ length: 30 }, () => {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 2;
    const opacity = 0.1 + Math.random() * 0.3;
    return `<circle cx="${x}" cy="${y}" r="${size}" fill="#000" opacity="${opacity}"/>`;
  }).join('');
  
  // Generate background circles
  const circles = Array.from({ length: 3 }, () => {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const r = 10 + Math.random() * 20;
    const opacity = 0.05 + Math.random() * 0.1;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#3b82f6" opacity="${opacity}"/>`;
  }).join('');
  
  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="100%" height="100%" fill="#f8fafc"/>
      
      <!-- Decorative circles -->
      ${circles}
      
      <!-- Noise lines -->
      ${lines}
      
      <!-- Text with rotation and offset -->
      <text
        x="50%"
        y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        font-family="'Fira Mono', monospace"
        font-size="${fontSize}"
        font-weight="900"
        fill="#2563eb"
        transform="translate(${offsetX}, ${offsetY}) rotate(${rotation}, ${width/2}, ${height/2})"
        letter-spacing="0.5"
      >
        ${text}
      </text>
      
      <!-- Noise dots -->
      ${dots}
    </svg>
  `.trim();
};

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [captchaData, setCaptchaData] = useState<CaptchaResponse | null>(null);
  const [isLoadingCaptcha, setIsLoadingCaptcha] = useState(false);
  const loginMutation = useLogin();

  // Fetch fiscal years from public endpoint (no authentication required)
  const { data: fiscalYears = [], isLoading: isLoadingFiscalYears } = useQuery({
    queryKey: ['fiscal-years'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: FiscalYear[] }>('/fiscal-year/public');
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch CAPTCHA
  const fetchCaptcha = async () => {
    setIsLoadingCaptcha(true);
    try {
      const response = await apiClient.get<CaptchaResponse>('/auth/captcha');
      setCaptchaData(response.data);
      setValue('captchaId', response.data.id);
      setValue('captcha', '');
    } catch (error) {
      console.error('Failed to fetch CAPTCHA:', error);
    } finally {
      setIsLoadingCaptcha(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      fiscalYearId: undefined,
      captchaId: '',
      captcha: '',
    },
  });

  // Set default fiscal year to current year if available
  useEffect(() => {
    if (fiscalYears.length > 0) {
      const currentFiscalYear = fiscalYears.find((fy) => fy.isCurrent);
      if (currentFiscalYear) {
        setValue('fiscalYearId', currentFiscalYear.id);
      }
    }
  }, [fiscalYears, setValue]);

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  // Auto-refresh CAPTCHA on login failure
  useEffect(() => {
    if (loginMutation.isError) {
      fetchCaptcha();
    }
  }, [loginMutation.isError]);

  // Generate SVG captcha
  const captchaSVG = useMemo(() => {
    if (!captchaData) return null;
    return generateCaptchaSVG(captchaData.question);
  }, [captchaData]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Error Alert */}
      {loginMutation.isError && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-300">
          {(loginMutation.error as any)?.response?.data?.message ||
            'Login gagal. Periksa kembali username dan password Anda.'}
        </Alert>
      )}

      {/* Username Field */}
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm font-medium flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          Username
        </Label>
        <Input
          {...register('username')}
          type="text"
          id="username"
          autoComplete="username"
          placeholder="username"
          error={!!errors.username}
          className="h-11 bg-slate-50 text-slate-900"
          aria-invalid={!!errors.username}
        />
        {errors.username && (
          <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
            {errors.username.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          Password
        </Label>
        <div className="relative">
          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            placeholder="password"
            error={!!errors.password}
            className="h-11 pr-11 bg-slate-50 text-slate-900"
            aria-invalid={!!errors.password}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Fiscal Year Dropdown - Using shadcn Select */}
      <div className="space-y-2">
        <Label htmlFor="fiscalYearId" className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          Tahun Anggaran
        </Label>
        <Controller
          name="fiscalYearId"
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={isLoadingFiscalYears}
            >
              <SelectTrigger className={`h-11 bg-slate-50 text-slate-900 ${errors.fiscalYearId ? 'border-destructive' : ''}`}>
                {/* Render label explicitly with correct color — bypasses Radix SelectValue display bug */}
                <span className={`text-sm truncate ${field.value ? 'text-slate-900 font-semibold' : 'text-slate-900'}`}>
                  {field.value
                    ? (() => {
                        const fy = fiscalYears.find((y) => y.id === field.value);
                        return fy?.tahun || 'Pilih Tahun Anggaran';
                      })()
                    : 'Pilih Tahun Anggaran'}
                </span>
                {/* SelectValue hidden but kept for Radix internals (ref/positioning) */}
                <span style={{ display: 'none' }}>
                  <SelectValue />
                </span>
              </SelectTrigger>
              <SelectContent className="bg-slate-50">
                {isLoadingFiscalYears ? (
                  <SelectItem value="loading" disabled className="text-slate-900">
                    Memuat tahun anggaran...
                  </SelectItem>
                ) : fiscalYears.length === 0 ? (
                  <SelectItem value="empty" disabled className="text-slate-900">
                    Tidak ada tahun anggaran
                  </SelectItem>
                ) : (
                  fiscalYears.map((fy) => (
                    <SelectItem key={fy.id} value={fy.id} className="text-slate-900">
                      {fy.tahun}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        />
        {errors.fiscalYearId && (
          <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
            {errors.fiscalYearId.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
        </p>
      </div>

      {/* CAPTCHA Field */}
      <div className="space-y-2">
        <Label htmlFor="captcha" className="text-sm font-medium flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          Verifikasi CAPTCHA
        </Label>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-[60px] border rounded-lg overflow-hidden">
            {isLoadingCaptcha ? (
              <div className="w-full h-full flex items-center justify-center bg-slate-50">
                <RefreshCw className="animate-spin h-5 w-5 text-muted-foreground" />
              </div>
            ) : captchaSVG ? (
              <div 
                dangerouslySetInnerHTML={{ __html: captchaSVG }}
                className="w-full h-full flex items-center justify-center"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-50">
                <span className="text-sm text-muted-foreground">Memuat soal...</span>
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={fetchCaptcha}
            disabled={isLoadingCaptcha}
            className="h-[60px] w-10 flex-shrink-0 text-muted-foreground hover:text-foreground"
            title="Ganti soal baru"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingCaptcha ? 'animate-spin' : ''}`} />
          </Button>
          <Input
            {...register('captcha')}
            type="text"
            id="captcha"
            autoComplete="off"
            placeholder=" "
            error={!!errors.captcha}
            className="w-2/5 h-[60px] text-center text-lg font-semibold shadow-none bg-slate-50 text-slate-900"
            aria-invalid={!!errors.captcha}
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>
        {errors.captcha && (
          <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
            {errors.captcha.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full h-11 text-base font-semibold bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
        isLoading={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'Memproses...' : 'Masuk'}
      </Button>

      {/* Helper Text */}
      <p className="text-center text-xs text-muted-foreground pt-2">
        Butuh bantuan? Hubungi administrator sistem
      </p>
    </form>
  );
};