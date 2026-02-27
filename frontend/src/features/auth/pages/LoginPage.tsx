/**
 * Login Page - Modern UI with shadcn/radix
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  DollarSign, 
  Wallet, 
  Coins, 
  Calculator,
  TrendingUp,
  PieChart,
  Banknote,
  HeartPulse,
  Activity,
  Stethoscope,
  Microscope,
  Pill,
  Baby
} from 'lucide-react';
import { useIsAuthenticated } from '../hooks';
import { LoginForm } from '../components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export const LoginPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
      {/* Background Icons - Finance & Health */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Finance Icons - Top Section */}
        <DollarSign className="absolute top-8 left-16 w-12 h-12 text-blue-600/30" />
        <Wallet className="absolute top-16 left-40 w-10 h-10 text-blue-700/30" />
        <Coins className="absolute top-8 right-20 w-12 h-12 text-blue-600/30" />
        <Calculator className="absolute top-16 right-48 w-10 h-10 text-blue-700/30" />
        <TrendingUp className="absolute top-32 left-24 w-14 h-14 text-blue-600/30" />
        <PieChart className="absolute top-28 right-32 w-12 h-12 text-blue-700/30" />
        <Banknote className="absolute top-10 left-72 w-14 h-14 text-blue-600/30" />
        <DollarSign className="absolute top-36 right-72 w-10 h-10 text-blue-700/30" />
        
        {/* Finance Icons - Bottom Section */}
        <Coins className="absolute bottom-20 left-24 w-12 h-12 text-blue-600/30" />
        <Calculator className="absolute bottom-28 left-56 w-10 h-10 text-blue-700/30" />
        <TrendingUp className="absolute bottom-16 right-24 w-14 h-14 text-blue-600/30" />
        <PieChart className="absolute bottom-32 right-56 w-12 h-12 text-blue-700/30" />
        <Banknote className="absolute bottom-24 left-80 w-10 h-10 text-blue-600/30" />
        <DollarSign className="absolute bottom-12 right-80 w-14 h-14 text-blue-700/30" />
        <Wallet className="absolute bottom-36 left-12 w-12 h-12 text-blue-600/30" />
        <Coins className="absolute bottom-8 right-40 w-10 h-10 text-blue-700/30" />
        
        {/* Finance Icons - Middle Section */}
        <PieChart className="absolute top-1/4 left-32 w-10 h-10 text-blue-600/30" />
        <Banknote className="absolute top-1/3 right-40 w-14 h-14 text-blue-700/30" />
        <DollarSign className="absolute top-1/2 left-20 w-12 h-12 text-blue-600/30" />
        <Wallet className="absolute bottom-1/3 right-32 w-10 h-10 text-blue-700/30" />
        <Coins className="absolute bottom-1/4 left-48 w-14 h-14 text-blue-600/30" />
        <Calculator className="absolute top-2/3 right-24 w-10 h-10 text-blue-700/30" />
        <TrendingUp className="absolute top-3/4 left-16 w-12 h-12 text-blue-600/30" />
        <PieChart className="absolute bottom-2/5 right-64 w-14 h-14 text-blue-700/30" />
        
        {/* Health Icons - Top Section */}
        <HeartPulse className="absolute top-20 left-12 w-14 h-14 text-green-600/30" />
        <Activity className="absolute top-32 left-64 w-12 h-12 text-green-700/30" />
        <Stethoscope className="absolute top-24 right-40 w-10 h-10 text-green-600/30" />
        <Microscope className="absolute top-12 right-80 w-14 h-14 text-green-700/30" />
        <Pill className="absolute top-40 left-48 w-10 h-10 text-green-600/30" />
        <Baby className="absolute top-16 right-64 w-12 h-12 text-green-700/30" />
        <HeartPulse className="absolute top-8 left-96 w-10 h-10 text-green-600/30" />
        <Activity className="absolute top-28 right-96 w-14 h-14 text-green-700/30" />
        
        {/* Health Icons - Bottom Section */}
        <Pill className="absolute bottom-24 left-40 w-12 h-12 text-green-600/30" />
        <Baby className="absolute bottom-16 left-72 w-10 h-10 text-green-700/30" />
        <HeartPulse className="absolute bottom-28 right-40 w-14 h-14 text-green-600/30" />
        <Activity className="absolute bottom-32 right-72 w-10 h-10 text-green-700/30" />
        <Stethoscope className="absolute bottom-12 left-96 w-12 h-12 text-green-600/30" />
        <Microscope className="absolute bottom-20 right-96 w-10 h-10 text-green-700/30" />
        <Pill className="absolute bottom-36 left-64 w-14 h-14 text-green-600/30" />
        <Baby className="absolute bottom-8 right-64 w-12 h-12 text-green-700/30" />
        
        {/* Health Icons - Middle Section */}
        <Stethoscope className="absolute top-1/4 right-20 w-10 h-10 text-green-600/30" />
        <Microscope className="absolute top-1/3 left-16 w-14 h-14 text-green-700/30" />
        <Pill className="absolute top-1/2 right-32 w-10 h-10 text-green-600/30" />
        <Baby className="absolute bottom-1/3 left-20 w-14 h-14 text-green-700/30" />
        <HeartPulse className="absolute bottom-1/4 right-24 w-12 h-12 text-green-600/30" />
        <Activity className="absolute top-2/5 left-64 w-10 h-10 text-green-700/30" />
        <Stethoscope className="absolute bottom-2/5 right-48 w-14 h-14 text-green-600/30" />
        <Microscope className="absolute top-3/5 left-48 w-12 h-12 text-green-700/30" />
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo & Title */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 ring-4 ring-blue-100">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-4 border-white"></div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Si-Kancil
          </h1>
          <p className="text-base text-muted-foreground font-medium">
            Sistem Informasi Keuangan Cepat dan Lincah<br />
            RSUD Datu Sanggul
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">Selamat Datang Kembali</CardTitle>
            <CardDescription className="text-center">
              Masukkan kredensial Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Si-Kancil RSUD Datu Sanggul. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};