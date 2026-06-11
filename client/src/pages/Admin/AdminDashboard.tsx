import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Car, Building2, BarChart3, Flag, Check, X, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { adminService } from '@/services/adminService';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import { Card, CardContent, Badge, Button, Avatar, LoadingSpinner, EmptyState } from '@/components/ui';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const { t } = useLanguage();
  const location = useLocation();
  const activeTab = location.pathname.split('/')[2] || 'dashboard';
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [aRes, uRes, vRes, bRes] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getUsers().catch(() => ({ data: { data: [] } })),
        adminService.getVehicles().catch(() => ({ data: { data: [] } })),
        adminService.getBusinesses().catch(() => ({ data: { data: [] } })),
      ]);
      setAnalytics(aRes.data.data || aRes.data || {});
      setUsers(uRes.data.data || uRes.data.users || []);
      setVehicles(vRes.data.data || vRes.data.vehicles || []);
      setBusinesses(bRes.data.data || bRes.data.businesses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (id: string) => {
    try { await adminService.verifyUser(id); toast.success('User verified'); loadAll(); } catch {}
  };
  const handleRejectUser = async (id: string) => {
    try { await adminService.rejectUser(id); toast.success('User rejected'); loadAll(); } catch {}
  };
  const handleApproveVehicle = async (id: string) => {
    try { await adminService.approveVehicle(id); toast.success('Vehicle approved'); loadAll(); } catch {}
  };
  const handleRejectVehicle = async (id: string) => {
    try { await adminService.rejectVehicle(id); toast.success('Vehicle rejected'); loadAll(); } catch {}
  };

  const tabs = [
    { id: 'dashboard', label: t('admin.title'), icon: BarChart3 },
    { id: 'users', label: t('admin.users'), icon: Users },
    { id: 'vehicles', label: t('admin.vehicles'), icon: Car },
    { id: 'businesses', label: t('admin.businesses'), icon: Building2 },
    { id: 'analytics', label: t('admin.analytics'), icon: TrendingUp },
    { id: 'reports', label: t('admin.reports'), icon: Flag },
  ];

  if (loading) return <LoadingSpinner size="lg" className="h-96" text={t('common.loading')} />;

  const statCards = [
    { label: t('admin.totalUsers'), value: analytics.totalUsers || 0, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: t('admin.totalVehicles' as any), value: analytics.totalVehicles || 0, icon: Car, color: 'bg-green-100 text-green-600' },
    { label: t('admin.totalBookings'), value: analytics.totalBookings || 0, icon: Calendar, color: 'bg-purple-100 text-purple-600' },
    { label: t('admin.totalRevenue'), value: `€${(analytics.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-yellow-100 text-yellow-600' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map(stat => (
                <Card key={stat.label} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-secondary-500">{stat.label}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Revenue Overview</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.revenueData || [{ date: 'Jan', amount: 0 }]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="amount" fill="#2563EB" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-4">User Growth</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.userGrowth || [{ date: 'Jan', count: 0 }]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-3">
            {users.length === 0 ? <EmptyState icon={<Users className="w-12 h-12" />} title={t('common.noData')} /> : users.map((u: any) => (
              <Card key={u._id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar src={u.profilePhoto} size="md" />
                  <div>
                    <p className="font-medium">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-secondary-400">{u.email} · {u.role} · {u.verificationStatus}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {u.verificationStatus === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => handleVerifyUser(u._id)}><Check className="w-3 h-3" /></Button>
                      <Button variant="danger" size="sm" onClick={() => handleRejectUser(u._id)}><X className="w-3 h-3" /></Button>
                    </>
                  )}
                  <Badge variant={u.verificationStatus === 'verified' ? 'accent' : u.verificationStatus === 'pending' ? 'warning' : 'danger'}>{u.verificationStatus}</Badge>
                </div>
              </Card>
            ))}
          </div>
        );

      case 'vehicles':
        return (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.length === 0 ? <div className="col-span-full"><EmptyState icon={<Car className="w-12 h-12" />} title={t('common.noData')} /></div> : vehicles.map((v: any) => (
              <Card key={v._id} className="overflow-hidden">
                <div className="h-40 overflow-hidden">
                  <img src={v.images?.[0] || ''} alt={v.title} className="w-full h-full object-cover" />
                </div>
                <CardContent>
                  <h3 className="font-semibold">{v.title}</h3>
                  <p className="text-xs text-secondary-400">{v.brand} {v.model} {v.year}</p>
                  <div className="flex items-center justify-between mt-3">
                    <Badge variant={v.status === 'approved' ? 'accent' : v.status === 'pending' ? 'warning' : 'danger'}>{v.status}</Badge>
                    <div className="flex gap-1">
                      {v.status === 'pending' && (
                        <>
                          <button onClick={() => handleApproveVehicle(v._id)} className="w-7 h-7 rounded-lg bg-accent-100 text-accent flex items-center justify-center hover:bg-accent-200"><Check className="w-3 h-3" /></button>
                          <button onClick={() => handleRejectVehicle(v._id)} className="w-7 h-7 rounded-lg bg-red-100 text-red-500 flex items-center justify-center hover:bg-red-200"><X className="w-3 h-3" /></button>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-primary font-bold mt-2">{formatPrice(v.dailyPrice)}/ditë</p>
                </CardContent>
              </Card>
            ))}
          </div>
        );

      case 'businesses':
        return (
          <div className="space-y-3">
            {businesses.length === 0 ? <EmptyState icon={<Building2 className="w-12 h-12" />} title={t('common.noData')} /> : businesses.map((b: any) => (
              <Card key={b._id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{b.companyName}</p>
                    <p className="text-xs text-secondary-400">{b.city} · {b.totalVehicles || 0} vehicles</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {b.verificationStatus === 'pending' && (
                    <Button size="sm" onClick={() => adminService.verifyBusiness(b._id).then(loadAll)}><Check className="w-3 h-3" /> {t('admin.approve')}</Button>
                  )}
                  <Badge variant={b.verificationStatus === 'verified' ? 'accent' : b.verificationStatus === 'pending' ? 'warning' : 'danger'}>{b.verificationStatus}</Badge>
                </div>
              </Card>
            ))}
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Booking Statistics</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.bookingStats || [{ date: 'Jan', count: 0 }]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10B981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Vehicle Categories</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={analytics.vehicleCategories || [{ _id: 'economy', count: 1 }]} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label>
                        {(analytics.vehicleCategories || []).map((_: any, i: number) => (
                          <Cell key={i} fill={['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][i]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Most Rented Vehicles</h3>
              <div className="space-y-2">
                {(analytics.mostRentedVehicles || []).map((v: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-secondary-50 rounded-xl">
                    <span className="font-medium text-sm">{i + 1}. {v.title}</span>
                    <span className="text-sm text-primary font-semibold">{v.count} rentals</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'reports':
        return <EmptyState icon={<Flag className="w-12 h-12" />} title={t('common.noData')} description={t('admin.reports')} />;

      default:
        return null;
    }
  };

  return (
    <div>
      <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {renderContent()}
      </motion.div>
    </div>
  );
}
