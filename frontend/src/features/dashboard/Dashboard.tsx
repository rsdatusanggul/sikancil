import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { BarChart3, DollarSign, ShoppingCart, Wallet } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: string;
}

function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-2 text-foreground">{value}</h3>
            {trend && (
              <p className="text-sm text-green-600 mt-1">{trend}</p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Ringkasan Keuangan BLUD</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pendapatan Tahun Ini"
          value="Rp 12,5 M"
          icon={DollarSign}
          trend="+12% dari bulan lalu"
        />
        <StatCard
          title="Realisasi Belanja"
          value="Rp 8,2 M"
          icon={ShoppingCart}
          trend="65% dari pagu"
        />
        <StatCard
          title="Saldo Kas"
          value="Rp 4,3 M"
          icon={Wallet}
        />
        <StatCard
          title="Outstanding Piutang"
          value="Rp 1,2 M"
          icon={BarChart3}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Realisasi Pendapatan vs Target</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Chart Placeholder - Implementasi dengan Recharts
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Realisasi Belanja per Program</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Chart Placeholder - Implementasi dengan Recharts
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-center py-8">
            Tabel transaksi terbaru akan ditampilkan di sini
          </div>
        </CardContent>
      </Card>
    </div>
  );
}