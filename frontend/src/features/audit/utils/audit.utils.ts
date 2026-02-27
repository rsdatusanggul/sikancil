import type { AuditAction } from '../types/audit.types';

export const ACTION_CONFIG: Record<AuditAction, {
  label: string;
  color: string;
  textColor: string;
  icon: string;
  group: 'auth' | 'crud' | 'workflow' | 'security';
}> = {
  LOGIN:           { label: 'Login',              color: 'bg-emerald-100', textColor: 'text-emerald-700', icon: '🔐', group: 'auth' },
  LOGOUT:          { label: 'Logout',             color: 'bg-slate-100',   textColor: 'text-slate-600',   icon: '🚪', group: 'auth' },
  LOGIN_FAILED:    { label: 'Login Gagal',        color: 'bg-red-100',     textColor: 'text-red-700',     icon: '❌', group: 'auth' },
  TOKEN_REFRESH:   { label: 'Refresh Token',      color: 'bg-blue-100',    textColor: 'text-blue-600',    icon: '🔄', group: 'auth' },
  CREATE:          { label: 'Dibuat',             color: 'bg-green-100',   textColor: 'text-green-700',   icon: '➕', group: 'crud' },
  UPDATE:          { label: 'Diubah',             color: 'bg-amber-100',   textColor: 'text-amber-700',   icon: '✏️', group: 'crud' },
  DELETE:          { label: 'Dihapus',            color: 'bg-red-100',     textColor: 'text-red-700',     icon: '🗑️', group: 'crud' },
  VIEW:            { label: 'Dilihat',            color: 'bg-gray-100',    textColor: 'text-gray-600',    icon: '👁️', group: 'crud' },
  EXPORT:          { label: 'Diekspor',           color: 'bg-indigo-100',  textColor: 'text-indigo-700',  icon: '📤', group: 'crud' },
  APPROVE:         { label: 'Disetujui',          color: 'bg-emerald-100', textColor: 'text-emerald-700', icon: '✅', group: 'workflow' },
  REJECT:          { label: 'Ditolak',            color: 'bg-red-100',     textColor: 'text-red-700',     icon: '🚫', group: 'workflow' },
  SUBMIT:          { label: 'Diajukan',           color: 'bg-blue-100',    textColor: 'text-blue-700',    icon: '📨', group: 'workflow' },
  REVISE:          { label: 'Direvisi',           color: 'bg-orange-100',  textColor: 'text-orange-700',  icon: '🔁', group: 'workflow' },
  CANCEL:          { label: 'Dibatalkan',         color: 'bg-gray-100',    textColor: 'text-gray-700',    icon: '⛔', group: 'workflow' },
  VERIFY:          { label: 'Diverifikasi',       color: 'bg-teal-100',    textColor: 'text-teal-700',    icon: '🔍', group: 'workflow' },
  UNAUTHORIZED:    { label: 'Tidak Terotorisasi', color: 'bg-red-100',     textColor: 'text-red-700',     icon: '🔒', group: 'security' },
  FORBIDDEN:       { label: 'Akses Ditolak',      color: 'bg-red-100',     textColor: 'text-red-800',     icon: '⛔', group: 'security' },
  PASSWORD_CHANGE: { label: 'Ganti Password',     color: 'bg-purple-100',  textColor: 'text-purple-700',  icon: '🔑', group: 'security' },
  LOCK_ACCOUNT:    { label: 'Akun Dikunci',       color: 'bg-red-100',     textColor: 'text-red-900',     icon: '🔒', group: 'security' },
};

export const ENTITY_LABELS: Record<string, string> = {
  SESSION:    'Sesi',
  USER:       'Pengguna',
  SPP:        'SPP',
  SPM:        'SPM',
  SP2D:       'SP2D',
  KWI:        'Bukti Bayar',
  JURNAL:     'Jurnal',
  BKU:        'BKU',
  SPJ:        'SPJ',
  RBA:        'RBA',
  RAK:        'RAK',
  DPA:        'DPA',
  PEGAWAI:    'Pegawai',
  SUPPLIER:   'Supplier',
  COA:        'Akun',
  UNIT_KERJA: 'Unit Kerja',
  PAJAK:      'Pajak',
  LAPORAN:    'Laporan',
  SYSTEM:     'Sistem',
};

export const ACTION_GROUPS: Record<string, AuditAction[]> = {
  'Autentikasi': ['LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'TOKEN_REFRESH'],
  'Data':        ['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT'],
  'Workflow':    ['APPROVE', 'REJECT', 'SUBMIT', 'REVISE', 'CANCEL', 'VERIFY'],
  'Keamanan':    ['UNAUTHORIZED', 'FORBIDDEN', 'PASSWORD_CHANGE', 'LOCK_ACCOUNT'],
};

export const formatTimestamp = (ts: string): string => {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Makassar',
  }).format(new Date(ts));
};

export const timeAgo = (ts: string): string => {
  const diff  = Date.now() - new Date(ts).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);

  if (mins < 1)   return 'Baru saja';
  if (mins < 60)  return `${mins} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7)   return `${days} hari lalu`;
  return formatTimestamp(ts).split(',')[0];
};
