import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { ProtectedRoute } from '@/features/auth';

// Auth pages (not lazy loaded for immediate access)
import { LoginPage } from '@/features/auth';

// Lazy load pages
const Dashboard = React.lazy(() => import('@/features/dashboard'));
const ProgramRBA = React.lazy(() => import('@/features/program-rba').then(m => ({ default: m.ProgramRBA })));
const ProgramRBADetail = React.lazy(() => import('@/features/program-rba').then(m => ({ default: m.ProgramRBADetail })));
const KegiatanRBA = React.lazy(() => import('@/features/kegiatan-rba'));
const KegiatanRBADetail = React.lazy(() => import('@/features/kegiatan-rba/KegiatanRBADetail'));
const SubKegiatanRBA = React.lazy(() => import('@/features/subkegiatan-rba'));
const SubKegiatanRBADetail = React.lazy(() => import('@/features/subkegiatan-rba/SubKegiatanRBADetail'));
const AktivitasRBA = React.lazy(() => import('@/features/aktivitas-rba'));
const AktivitasRBADetail = React.lazy(() => import('@/features/aktivitas-rba/AktivitasRBADetail'));
const RakList = React.lazy(() => import('@/features/rak/pages/RakList').then(m => ({ default: m.RakList })));
const RakCreate = React.lazy(() => import('@/features/rak/pages/RakCreate').then(m => ({ default: m.RakCreate })));
const RakDetail = React.lazy(() => import('@/features/rak/pages/RakDetail').then(m => ({ default: m.RakDetail })));
const RevisiRBA = React.lazy(() => import('@/features/revisi-rba'));
const DPA = React.lazy(() => import('@/features/dpa'));
const DPADetail = React.lazy(() => import('@/features/dpa/DPADetail'));
const DPAForm = React.lazy(() => import('@/features/dpa/DPAForm'));
const BuktiBayarList = React.lazy(() => import('@/features/bukti-bayar/BuktiBayarList').then(m => ({ default: m.default })));
const BuktiBayarCreate = React.lazy(() => import('@/features/bukti-bayar/BuktiBayarCreate').then(m => ({ default: m.default })));
const BuktiBayarDetail = React.lazy(() => import('@/features/bukti-bayar/BuktiBayarDetail').then(m => ({ default: m.default })));
const UserList = React.lazy(() => import('@/features/users'));
const RolesPermissions = React.lazy(() => import('@/features/roles-permissions'));
const MasterData = React.lazy(() => import('@/features/master-data'));
const ProfilePage = React.lazy(() => import('@/features/profile').then(m => ({ default: m.ProfilePage })));
const ActivityLog = React.lazy(() =>
  import('@/features/audit/pages/ActivityLogPage').then(m => ({ default: m.ActivityLogPage }))
);
const ChartOfAccounts = React.lazy(() => import('@/features/chart-of-accounts').then(m => ({ default: m.default })));

// Placeholder component for routes under development
const UnderDevelopment = () => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Under Development</h2>
      <p className="text-gray-600">This page is currently being developed.</p>
    </div>
  </div>
);

export const router = createBrowserRouter([
  // Auth routes (outside MainLayout)
  {
    path: '/login',
    element: <LoginPage />,
  },
  // Main app routes (protected)
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <Dashboard />
          </React.Suspense>
        ),
      },
      // RBA & Perencanaan
      {
        path: 'program-rba',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <ProgramRBA />
          </React.Suspense>
        ),
      },
      {
        path: 'program-rba/:id',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <ProgramRBADetail />
          </React.Suspense>
        ),
      },
      {
        path: 'kegiatan-rba',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <KegiatanRBA />
          </React.Suspense>
        ),
      },
      {
        path: 'kegiatan-rba/:id',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <KegiatanRBADetail />
          </React.Suspense>
        ),
      },
      // Sub Kegiatan RBA (primary routes)
      {
        path: 'subkegiatan-rba',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <SubKegiatanRBA />
          </React.Suspense>
        ),
      },
      {
        path: 'subkegiatan-rba/:id',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <SubKegiatanRBADetail />
          </React.Suspense>
        ),
      },
      // Aktivitas RBA (primary routes)
      {
        path: 'aktivitas-rba',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <AktivitasRBA />
          </React.Suspense>
        ),
      },
      {
        path: 'aktivitas-rba/:id',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <AktivitasRBADetail />
          </React.Suspense>
        ),
      },
      // Legacy redirects for backward compatibility
      {
        path: 'output-rba',
        element: <Navigate to="/subkegiatan-rba" replace />,
      },
      {
        path: 'output-rba/:id',
        element: <Navigate to="/subkegiatan-rba/:id" replace />,
      },
      {
        path: 'rencana-anggaran-kas',
        element: <Navigate to="/rak" replace />,
      },
      // RAK Routes
      {
        path: 'rak',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <RakList />
          </React.Suspense>
        ),
      },
      {
        path: 'rak/create',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <RakCreate />
          </React.Suspense>
        ),
      },
      {
        path: 'rak/:id',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <RakDetail />
          </React.Suspense>
        ),
      },
      {
        path: 'revisi-rba',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <RevisiRBA />
          </React.Suspense>
        ),
      },
      // Pendapatan
      {
        path: 'pendapatan-operasional',
        element: <UnderDevelopment />,
      },
      {
        path: 'penerimaan-apbd',
        element: <UnderDevelopment />,
      },
      {
        path: 'hibah',
        element: <UnderDevelopment />,
      },
      {
        path: 'piutang',
        element: <UnderDevelopment />,
      },
      {
        path: 'simrs-integration',
        element: <UnderDevelopment />,
      },
      // Belanja
      {
        path: 'bukti-bayar',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <BuktiBayarList />
          </React.Suspense>
        ),
      },
      {
        path: 'bukti-bayar/create',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <BuktiBayarCreate />
          </React.Suspense>
        ),
      },
      {
        path: 'bukti-bayar/:id',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <BuktiBayarDetail />
          </React.Suspense>
        ),
      },
      {
        path: 'spp',
        element: <UnderDevelopment />,
      },
      {
        path: 'spm',
        element: <UnderDevelopment />,
      },
      {
        path: 'sp2d',
        element: <UnderDevelopment />,
      },
      {
        path: 'dpa',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <DPA />
          </React.Suspense>
        ),
      },
      {
        path: 'dpa/:id',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <DPADetail />
          </React.Suspense>
        ),
      },
      {
        path: 'dpa/create',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <DPAForm />
          </React.Suspense>
        ),
      },
      {
        path: 'dpa/:id/edit',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <DPAForm />
          </React.Suspense>
        ),
      },
      {
        path: 'realisasi-belanja',
        element: <UnderDevelopment />,
      },
      {
        path: 'pajak',
        element: <UnderDevelopment />,
      },
      // Penatausahaan
      {
        path: 'bku-penerimaan',
        element: <UnderDevelopment />,
      },
      {
        path: 'bku-pengeluaran',
        element: <UnderDevelopment />,
      },
      {
        path: 'buku-pembantu',
        element: <UnderDevelopment />,
      },
      {
        path: 'spj-up',
        element: <UnderDevelopment />,
      },
      {
        path: 'spj-gu',
        element: <UnderDevelopment />,
      },
      {
        path: 'spj-tu',
        element: <UnderDevelopment />,
      },
      {
        path: 'sts',
        element: <UnderDevelopment />,
      },
      {
        path: 'penutupan-kas',
        element: <UnderDevelopment />,
      },
      // Akuntansi
      {
        path: 'jurnal',
        element: <UnderDevelopment />,
      },
      {
        path: 'buku-besar',
        element: <UnderDevelopment />,
      },
      {
        path: 'neraca-saldo',
        element: <UnderDevelopment />,
      },
      // Laporan Keuangan
      {
        path: 'lra',
        element: <UnderDevelopment />,
      },
      {
        path: 'lpsal',
        element: <UnderDevelopment />,
      },
      {
        path: 'neraca',
        element: <UnderDevelopment />,
      },
      {
        path: 'laporan-operasional',
        element: <UnderDevelopment />,
      },
      {
        path: 'laporan-arus-kas',
        element: <UnderDevelopment />,
      },
      {
        path: 'laporan-perubahan-ekuitas',
        element: <UnderDevelopment />,
      },
      {
        path: 'calk',
        element: <UnderDevelopment />,
      },
      // Laporan Penatausahaan
      {
        path: 'laporan-pendapatan-blud',
        element: <UnderDevelopment />,
      },
      {
        path: 'laporan-pengeluaran-blud',
        element: <UnderDevelopment />,
      },
      {
        path: 'spj-fungsional',
        element: <UnderDevelopment />,
      },
      // Supporting Modules
      {
        path: 'aset',
        element: <UnderDevelopment />,
      },
      {
        path: 'gaji',
        element: <UnderDevelopment />,
      },
      {
        path: 'kontrak',
        element: <UnderDevelopment />,
      },
      // Master Data
      {
        path: 'master-data',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <MasterData />
          </React.Suspense>
        ),
      },
      {
        path: 'master-data/chart-of-accounts',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <ChartOfAccounts />
          </React.Suspense>
        ),
      },
      {
        path: 'master-data/unit-kerja',
        element: <UnderDevelopment />,
      },
      {
        path: 'master-data/pegawai',
        element: <UnderDevelopment />,
      },
      {
        path: 'master-data/supplier',
        element: <UnderDevelopment />,
      },
      {
        path: 'master-data/bank-account',
        element: <UnderDevelopment />,
      },
      {
        path: 'master-data/fiscal-year',
        element: <UnderDevelopment />,
      },
      // System / Admin
      {
        path: 'profile',
        element: (
          <React.Suspense fallback={<div>Loading...</div>}>
            <ProfilePage />
          </React.Suspense>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute requiredRoles={['super_admin', 'admin']}>
            <React.Suspense fallback={<div>Loading...</div>}>
              <UserList />
            </React.Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'roles',
        element: (
          <ProtectedRoute requiredRoles={['super_admin', 'admin']}>
            <React.Suspense fallback={<div>Loading...</div>}>
              <RolesPermissions />
            </React.Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: <UnderDevelopment />,
      },
      // Audit Log — hanya super_admin, admin, kepala_blud
      {
        path: 'audit/activity-log',
        element: (
          <ProtectedRoute requiredRoles={['super_admin', 'admin', 'kepala_blud']}>
            <React.Suspense fallback={<div>Loading...</div>}>
              <ActivityLog />
            </React.Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },
]);