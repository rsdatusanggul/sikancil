import { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useDetailAccounts } from '@/features/chart-of-accounts/hooks';
import type { ChartOfAccount } from '@/features/chart-of-accounts/types';
import { Search } from 'lucide-react';

interface AddAccountCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (account: ChartOfAccount) => void;
  excludeIds?: string[]; // IDs of accounts already added (optional, kept for backward compatibility)
  excludeKodeRekenings?: string[]; // Kode rekenings already added (new prop)
}

export function AddAccountCodeModal({
  isOpen,
  onClose,
  onSelect,
  excludeIds = [],
  excludeKodeRekenings = [],
}: AddAccountCodeModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: accounts = [], isLoading, error } = useDetailAccounts();

  // Filter accounts based on search and exclude already-added ones
  const filteredAccounts = useMemo(() => {
    return accounts
      .filter((account) => !excludeIds.includes(account.id))
      .filter((account) => !excludeKodeRekenings.includes(account.kodeRekening))
      .filter((account) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          account.kodeRekening.toLowerCase().includes(query) ||
          account.namaRekening.toLowerCase().includes(query)
        );
      });
  }, [accounts, excludeIds, excludeKodeRekenings, searchQuery]);

  const handleAccountClick = (account: ChartOfAccount) => {
    onSelect(account);
    setSearchQuery('');
    onClose();
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Pilih Kode Rekening"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Batal
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Cari kode atau nama rekening..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Memuat kode rekening...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">
              Error memuat kode rekening. Silakan coba lagi.
            </p>
          </div>
        )}

        {/* Accounts List */}
        {!isLoading && !error && (
          <div className="border rounded-md max-h-96 overflow-y-auto">
            {filteredAccounts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {excludeIds.length > 0 && accounts.length === excludeIds.length
                    ? 'Semua kode rekening sudah ditambahkan'
                    : 'Tidak ada kode rekening ditemukan'}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredAccounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => handleAccountClick(account)}
                    className="w-full text-left px-4 py-3 hover:bg-muted transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <div className="font-medium">{account.kodeRekening}</div>
                      <div className="text-sm text-muted-foreground">
                        {account.namaRekening}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {account.jenisAkun} • Level {account.level}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info Text */}
        {!isLoading && !error && filteredAccounts.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Menampilkan {filteredAccounts.length} dari {accounts.length - excludeIds.length - excludeKodeRekenings.length} kode
            rekening yang tersedia
          </p>
        )}
      </div>
    </Modal>
  );
}
