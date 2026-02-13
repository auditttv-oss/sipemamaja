import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Wallet, FileWarning, CheckCircle, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';
import { CHART_DATA, MOCK_INVOICES, MOCK_USER, LOGO_URL } from '../constants';
import { useData } from '../DataContext';

interface DashboardProps {
  onViewChange: (view: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onViewChange }) => {
  const { complaints, payments, invoices, units, clusters } = useData();
  const [searchTerm, setSearchTerm] = React.useState('');
  const unpaidCount = invoices.filter(i => i.status !== 'Paid').length;
  const paidCount = invoices.filter(i => i.status === 'Paid').length;
  const unfinishedComplaints = complaints.filter(c => c.status !== 'SELESAI');
  const pendingPayments = payments.filter(p => p.status === 'pending');
  const verifiedPayments = payments.filter(p => p.status === 'verified');

  // Calculate IPL progress per cluster
  const clusterProgress = clusters.map(cluster => {
    const clusterUnits = units.filter(u => u.cluster === cluster.name);
    const totalInvoices = invoices.filter(inv => clusterUnits.some(u => u.id === inv.unitId));
    const paidInvoices = totalInvoices.filter(inv => inv.status === 'Paid');
    const progress = totalInvoices.length > 0 ? (paidInvoices.length / totalInvoices.length) * 100 : 0;
    return {
      cluster: cluster.name,
      progress: Math.round(progress),
      paid: paidInvoices.length,
      total: totalInvoices.length
    };
  });

  const pieData = [
    { name: 'Lunas', value: paidCount, color: '#10B981' },
    { name: 'Belum Lunas', value: unpaidCount, color: '#F43F5E' }
  ];

  // Filter residents by search term
  const filteredResidents = units.filter(unit =>
    unit.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <img src={LOGO_URL} alt="Logo" className="h-10 w-auto" />
          Selamat datang di Sipema Maja (Sistem Informasi Permata Mutiara Maja)
        </h2>
        <p className="text-gray-500 mt-1">Platform terdepan untuk kemudahan pembayaran IPL dan pengelolaan aduan selama masa retensi perumahan</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onViewChange('billing')}
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Tagihan Belum Lunas</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{unpaidCount}</h3>
            </div>
            <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
              <Wallet size={20} />
            </div>
          </div>
          <div className="mt-4 text-xs text-rose-600 font-medium flex items-center">
            Segera selesaikan pembayaran <ArrowRight size={12} className="ml-1"/>
          </div>
        </div>

        <div 
           onClick={() => onViewChange('complaints')}
           className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Komplain Belum Selesai</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{unfinishedComplaints.length}</h3>
            </div>
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
              <FileWarning size={20} />
            </div>
          </div>
          <div className="mt-4 text-xs text-amber-600 font-medium">
            Sedang dalam proses
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Pembayaran Lunas</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{verifiedPayments.length}</h3>
            </div>
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="mt-4 text-xs text-emerald-600 font-medium">
            Sudah diverifikasi
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Pembayaran Pending</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{pendingPayments.length}</h3>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-4 text-xs text-blue-600 font-medium">
            Menunggu verifikasi
          </div>
        </div>
      </div>

      {/* IPL Progress Infographic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Progres Pembayaran IPL Seluruh Cluster</h3>
          <div className="space-y-4">
            {clusterProgress.map((cluster) => (
              <div key={cluster.cluster} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{cluster.cluster}</span>
                    <span className="text-gray-500">{cluster.progress}% ({cluster.paid}/{cluster.total})</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${cluster.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Distribusi Status Pembayaran</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-sm text-gray-600">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resident Status Search and Display */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Status Warga</h3>
        <div className="mb-6">
          <input 
            type="text" 
            placeholder="Cari nama warga..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm" 
          />
        </div>
        <div className="space-y-4">
          {filteredResidents.map((unit) => {
            const unpaidInvoices = invoices.filter(inv => inv.unitId === unit.id && inv.status !== 'Paid');
            const unfinishedComplaints = complaints.filter(c => c.userId === unit.id && c.status !== 'SELESAI');
            const hasIssues = unpaidInvoices.length > 0 || unfinishedComplaints.length > 0;
            if (!hasIssues && searchTerm) return null; // If searching and no issues, don't show
            return (
              <div key={unit.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-800">{unit.ownerName}</h4>
                  <p className="text-sm text-gray-500">Blok {unit.block} No. {unit.number}</p>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-medium text-red-600">{unpaidInvoices.length}</p>
                    <p className="text-gray-500">IPL Belum Lunas</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-amber-600">{unfinishedComplaints.length}</p>
                    <p className="text-gray-500">Komplain Belum Selesai</p>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredResidents.length === 0 && searchTerm && (
            <div className="text-center py-10 text-gray-500">
              Tidak ada warga yang ditemukan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};