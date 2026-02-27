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
import { Plus, Edit, Trash2, TrendingUp, TrendingDown, Search } from 'lucide-react';
import { anggaranKasApi } from './rencana-anggaran-kas.api';
import RencanaAnggaranKasForm from './RencanaAnggaranKasForm';
import CashFlowChart from './components/CashFlowChart';
import type { AnggaranKas, JenisAnggaranKas } from './rencana-anggaran-kas.types';
import { useFiscalYear } from '@/contexts/FiscalYearContext';

const BULAN_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function AnggaranKasPage() {
  const queryClient = useQueryClient();
  const { activeFiscalYear } = useFiscalYear();
  const currentMonth = new Date().getMonth() + 1;

  const selectedYear = activeFiscalYear?.tahun || new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = React.useState<number | 'all'>('all');
  const [selectedJenis, setSelectedJenis] = React.useState<JenisAnggaranKas | 'all'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<AnggaranKas | null>(null);
  const [showChart, setShowChart] = React.useState(true);

  // Fetch anggaran kas list
  const { data: anggaranList, isLoading } = useQuery({
    queryKey: ['anggaran-kas', selectedYear, selectedMonth, selectedJenis],
    queryFn: () => {
      if (selectedMonth === 'all') {
        return anggaranKasApi.getByYear(selectedYear);
      }
      return anggaranKasApi.getByMonth(selectedYear, selectedMonth as number);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => anggaranKasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anggaran-kas'] });
      queryClient.invalidateQueries({ queryKey: ['cash-flow-projection'] });
    },
  });

  const handleDelete = (id: string, uraian: string) => {
    if (window.confirm(`Hapus anggaran kas "${uraian}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (item: AnggaranKas) => {
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

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredList = React.useMemo(() => {
    if (!anggaranList) return [];

    let filtered = anggaranList;

    // Filter by jenis
    if (selectedJenis !== 'all') {
      filtered = filtered.filter((item) => item.jenisAnggaran === selectedJenis);
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.uraian.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.kodeRekening.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [anggaranList, selectedJenis, searchQuery]);

  // Calculate totals
  const totals = React.useMemo(() => {
    if (!filteredList) return { penerimaan: 0, pengeluaran: 0, saldo: 0 };

    const penerimaan = filteredList
      .filter((item) => item.jenisAnggaran === 'PENERIMAAN')
      .reduce((sum, item) => sum + item.jumlahAnggaran, 0);

    const pengeluaran = filteredList
      .filter((item) => item.jenisAnggaran === 'PENGELUARAN')
      .reduce((sum, item) => sum + item.jumlahAnggaran, 0);

    return {
      penerimaan,
      pengeluaran,
      saldo: penerimaan - pengeluaran,
    };
  }, [filteredList]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Anggaran Kas</h1>
          <p className="text-gray-600">Kelola anggaran kas penerimaan dan pengeluaran (12 bulan)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowChart(!showChart)}>
            {showChart ? 'Sembunyikan Chart' : 'Tampilkan Chart'}
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Anggaran Kas
          </Button>
        </div>
      </div>

      {/* Cash Flow Chart */}
      {showChart && (
        <CashFlowChart tahun={selectedYear} />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Penerimaan</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.penerimaan)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pengeluaran</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.pengeluaran)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Saldo</p>
                <p className={`text-2xl font-bold ${totals.saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(totals.saldo)}
                </p>
              </div>
              {totals.saldo < 0 && (
                <Badge variant="destructive">Cash Flow Negatif!</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            {/* Month Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Bulan:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="h-9 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Bulan</option>
                {BULAN_NAMES.map((name, index) => (
                  <option key={index + 1} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Jenis Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Jenis:</label>
              <select
                value={selectedJenis}
                onChange={(e) => setSelectedJenis(e.target.value as any)}
                className="h-9 rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua</option>
                <option value="PENERIMAAN">Penerimaan</option>
                <option value="PENGELUARAN">Pengeluaran</option>
              </select>
            </div>

            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari kode rekening atau uraian..."
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
          <CardTitle>Daftar Anggaran Kas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Memuat data...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-100 dark:bg-gray-950">
                  <TableRow className="hover:bg-gray-100 dark:hover:bg-gray-950">
                    <TableHead className="w-[80px] text-base dark:text-gray-300">Bulan</TableHead>
                    <TableHead className="w-[100px] text-base dark:text-gray-300">Jenis</TableHead>
                    <TableHead className="w-[120px] text-base dark:text-gray-300">Kode Rek.</TableHead>
                    <TableHead className="text-base dark:text-gray-300">Uraian</TableHead>
                    <TableHead className="w-[150px] text-right text-base dark:text-gray-300">Jumlah Anggaran</TableHead>
                    <TableHead className="w-[150px] text-right text-base dark:text-gray-300">Realisasi</TableHead>
                    <TableHead className="w-[100px] text-right text-base dark:text-gray-300">Sisa</TableHead>
                    <TableHead className="w-[120px] text-center text-base dark:text-gray-300">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredList && filteredList.length > 0 ? (
                    filteredList.map((item) => (
                      <TableRow key={item.id} className="bg-background hover:bg-gray-100 dark:hover:bg-gray-800">
                        <TableCell className="font-medium">{BULAN_NAMES[item.bulan - 1]}</TableCell>
                        <TableCell>
                          <Badge variant={item.jenisAnggaran === 'PENERIMAAN' ? 'default' : 'secondary'}>
                            {item.jenisAnggaran === 'PENERIMAAN' ? 'Penerimaan' : 'Pengeluaran'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{item.kodeRekening}</TableCell>
                        <TableCell>{item.uraian}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.jumlahAnggaran)}
                        </TableCell>
                        <TableCell className="text-right text-gray-600 dark:text-gray-400">
                          {formatCurrency(item.realisasi)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={item.jumlahAnggaran - item.realisasi < 0 ? 'text-red-600' : 'text-gray-900 dark:text-gray-50'}>
                            {formatCurrency(item.jumlahAnggaran - item.realisasi)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(item)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(item.id, item.uraian)}
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                        {searchQuery
                          ? 'Tidak ada data yang sesuai dengan pencarian'
                          : `Tidak ada data anggaran kas untuk ${selectedMonth === 'all' ? `tahun ${selectedYear}` : `${BULAN_NAMES[(selectedMonth as number) - 1]} ${selectedYear}`}`}
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
      {isFormOpen && (
        <RencanaAnggaranKasForm
          anggaranKas={editingItem}
          onClose={handleFormClose}
          defaultTahun={selectedYear}
          defaultBulan={selectedMonth === 'all' ? currentMonth : (selectedMonth as number)}
        />
      )}
    </div>
  );
}
