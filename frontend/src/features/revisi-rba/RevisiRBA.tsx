import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Badge,
} from '@/components/ui';
import { Plus, Edit, Trash2, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import { revisiRBAApi } from './api';
import { programRBAApi } from '../program-rba/api';
import RevisiRBAForm from './RevisiRBAForm';
import ApprovalWorkflow from './components/ApprovalWorkflow';
import type { RevisiRBA, StatusRevisiRBA } from './types';
import { useFiscalYear } from '@/contexts/FiscalYearContext';

const JENIS_REVISI_LABELS: Record<string, string> = {
  PERUBAHAN_PAGU: 'Perubahan Pagu',
  PERUBAHAN_VOLUME: 'Perubahan Volume',
  PERUBAHAN_WAKTU: 'Perubahan Waktu',
  PERGESERAN_ANGGARAN: 'Pergeseran Anggaran',
  LAIN_LAIN: 'Lain-lain',
};

const STATUS_COLORS: Record<StatusRevisiRBA, string> = {
  DRAFT: 'secondary',
  PENDING: 'default',
  APPROVED: 'default',
  REJECTED: 'destructive',
};

export default function RevisiRBAPage() {
  const queryClient = useQueryClient();
  const { activeFiscalYear } = useFiscalYear();

  const selectedYear = activeFiscalYear?.tahun || new Date().getFullYear();
  const [selectedStatus, setSelectedStatus] = React.useState<StatusRevisiRBA | 'all'>('all');
  const [selectedRBA, setSelectedRBA] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<RevisiRBA | null>(null);
  const [approvalItem, setApprovalItem] = React.useState<RevisiRBA | null>(null);

  // Fetch revisi list
  const { data: revisiList, isLoading } = useQuery({
    queryKey: ['revisi-rba', { status: selectedStatus, rbaId: selectedRBA }],
    queryFn: () => {
      if (selectedStatus === 'all') {
        return revisiRBAApi.getAll({ rbaId: selectedRBA || undefined });
      }
      return revisiRBAApi.getAll({ status: selectedStatus, rbaId: selectedRBA || undefined });
    },
  });

  // Fetch RBA list for filter
  const { data: rbaList } = useQuery({
    queryKey: ['program-rba', selectedYear],
    queryFn: () => programRBAApi.getAll(selectedYear),
  });

  // Fetch pending count
  const { data: pendingList } = useQuery({
    queryKey: ['revisi-rba-pending'],
    queryFn: () => revisiRBAApi.getPending(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => revisiRBAApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revisi-rba'] });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Hapus revisi ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (item: RevisiRBA) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleApprovalClose = () => {
    setApprovalItem(null);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusIcon = (status: StatusRevisiRBA) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const filteredList = React.useMemo(() => {
    if (!revisiList) return [];

    let filtered = revisiList;

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.alasanRevisi.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.perubahanData.kodeRekening?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [revisiList, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revisi RBA</h1>
          <p className="text-gray-600">Kelola revisi dan perubahan RBA dengan workflow approval</p>
        </div>
        <div className="flex gap-2">
          {pendingList && pendingList.length > 0 && (
            <Badge variant="default" className="mr-2">
              {pendingList.length} Pending Approval
            </Badge>
          )}
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Revisi
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            {/* RBA Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">RBA:</label>
              <select
                value={selectedRBA}
                onChange={(e) => setSelectedRBA(e.target.value)}
                className="h-9 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
              >
                <option value="">Semua RBA</option>
                {rbaList?.map((rba) => (
                  <option key={rba.id} value={rba.id}>
                    [{rba.kodeProgram}] {rba.namaProgram}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="h-9 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari alasan atau kode rekening..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-10 pr-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Revisi RBA</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Memuat data...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-100 dark:bg-gray-950">
                  <TableRow className="hover:bg-gray-100 dark:hover:bg-gray-950">
                    <TableHead className="w-[100px] text-base dark:text-gray-300">Tanggal</TableHead>
                    <TableHead className="w-[120px] text-base dark:text-gray-300">Jenis Revisi</TableHead>
                    <TableHead className="text-base dark:text-gray-300">Alasan Revisi</TableHead>
                    <TableHead className="w-[120px] text-base dark:text-gray-300">Kode Rek.</TableHead>
                    <TableHead className="w-[100px] text-base dark:text-gray-300">Status</TableHead>
                    <TableHead className="w-[100px] text-base dark:text-gray-300">Approved By</TableHead>
                    <TableHead className="w-[150px] text-center text-base dark:text-gray-300">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredList && filteredList.length > 0 ? (
                    filteredList.map((item) => (
                      <TableRow key={item.id} className="bg-background hover:bg-gray-100 dark:hover:bg-gray-800">
                        <TableCell className="text-sm">{formatDate(item.tanggalRevisi)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {JENIS_REVISI_LABELS[item.perubahanData.type]}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">{item.alasanRevisi}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {item.perubahanData.kodeRekening || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(item.status)}
                            <Badge variant={STATUS_COLORS[item.status] as any}>
                              {item.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {item.approver ? item.approver.username : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-center">
                            {item.status === 'PENDING' && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => setApprovalItem(item)}
                                title="Proses Approval"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(item)}
                              title="Edit"
                              disabled={item.status === 'APPROVED'}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(item.id)}
                              title="Hapus"
                              disabled={item.status === 'APPROVED'}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        {searchQuery ? 'Tidak ada revisi yang sesuai dengan pencarian' : 'Tidak ada data revisi RBA'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      {isFormOpen && <RevisiRBAForm revisi={editingItem} onClose={handleFormClose} defaultRBAId={selectedRBA} />}

      {/* Approval Modal */}
      {approvalItem && <ApprovalWorkflow revisi={approvalItem} onClose={handleApprovalClose} />}
    </div>
  );
}
