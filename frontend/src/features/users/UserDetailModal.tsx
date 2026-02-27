import React from 'react';
import { Modal, Badge } from '@/components/ui';
import { User, Mail, Phone, Briefcase, Shield, Clock, Calendar } from 'lucide-react';
import type { User as UserType } from './types';
import { getRoleLabel, getStatusLabel, getStatusColor } from './types';

interface UserDetailModalProps {
  user: UserType;
  onClose: () => void;
}

export function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const DetailRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
        <Icon className="h-5 w-5 text-blue-600" />
      </div>
      <div className="flex-1">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900">{value || '-'}</dd>
      </div>
    </div>
  );

  return (
    <Modal isOpen={true} onClose={onClose} title="Detail User">
      <div className="space-y-6">
        {/* Header Section with Avatar */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
          <div className="flex-shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">{user.fullName}</h3>
            <p className="text-gray-600">@{user.username}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant={getStatusColor(user.status)}>{getStatusLabel(user.status)}</Badge>
              <Badge variant="secondary">{getRoleLabel(user.role)}</Badge>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Informasi Akun</h4>

          <DetailRow icon={User} label="Username" value={user.username} />

          <DetailRow icon={Mail} label="Email" value={user.email} />

          <DetailRow icon={Phone} label="No. Telepon" value={user.phone} />

          <DetailRow
            icon={Briefcase}
            label="NIP"
            value={user.nip}
          />

          <DetailRow
            icon={Briefcase}
            label="Jabatan"
            value={user.jabatan}
          />

          <DetailRow
            icon={Shield}
            label="Role"
            value={<Badge variant="secondary">{getRoleLabel(user.role)}</Badge>}
          />
        </div>

        {/* Activity Information */}
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Informasi Aktivitas</h4>

          <DetailRow
            icon={Clock}
            label="Login Terakhir"
            value={formatDate(user.lastLogin)}
          />

          <DetailRow
            icon={Calendar}
            label="Dibuat Pada"
            value={formatDate(user.createdAt)}
          />

          <DetailRow
            icon={Calendar}
            label="Diperbarui Pada"
            value={formatDate(user.updatedAt)}
          />

          {user.createdBy && (
            <DetailRow
              icon={User}
              label="Dibuat Oleh"
              value={user.createdBy}
            />
          )}

          {user.updatedBy && (
            <DetailRow
              icon={User}
              label="Diperbarui Oleh"
              value={user.updatedBy}
            />
          )}
        </div>

        {/* Additional Information */}
        {user.blud_id && (
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Informasi Tambahan</h4>
            <DetailRow
              icon={Briefcase}
              label="BLUD ID"
              value={user.blud_id}
            />
          </div>
        )}

        {/* Close Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
}
