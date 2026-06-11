import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Calendar, Clock, TrendingUp, Plus, DollarSign, Users, Settings, BarChart3, AlertCircle, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { vehicleService } from '@/services/vehicleService';
import { bookingService } from '@/services/bookingService';
import { formatPrice, formatDate } from '@/lib/utils';
import { Card, CardContent, Badge, Button, LoadingSpinner, Avatar, EmptyState, StarRating } from '@/components/ui';
import toast from 'react-hot-toast';

export default function OwnerDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [ownerBookings, setOwnerBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalVehicles: 0, activeRentals: 0, pendingRequests: 0, monthlyRevenue: 0, totalEarnings: 0,
  });

  useEffect(() => {
    loadOwnerData();
  }, []);

  const loadOwnerData = async () => {
    try {
      const [vRes, bRes] = await Promise.all([
        vehicleService.getAll({ owner: user?._id }),
        bookingService.getAll({ asOwner: true }),
      ]);
      const vData = vRes.data.data || vRes.data.vehicles || [];
      const bData = bRes.data.data || bRes.data.bookings || [];
      setVehicles(vData);
      setOwnerBookings(bData);

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      setStats({
        totalVehicles: vData.length,
        activeRentals: bData.filter((b: any) => b.status === 'active').length,
        pendingRequests: bData.filter((b: any) => b.status === 'pending').length,
        monthlyRevenue: bData
          .filter((b: any) => {
            const d = new Date(b.createdAt);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear && b.paymentStatus === 'paid';
          })
          .reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0),
        totalEarnings: bData
          .filter((b: any) => b.paymentStatus === 'paid')
          .reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: string) => {
    try { await bookingService.confirm(id); toast.success('Rezervimi u konfirmua'); loadOwnerData(); } catch (err: any) { toast.error(err.response?.data?.message || t('common.error')); }
  };

  const handleStartRental = async (id: string) => {
    try { await bookingService.startRental(id); toast.success('Qiraja filloi'); loadOwnerData(); } catch (err: any) { toast.error(err.response?.data?.message || t('common.error')); }
  };

  const handleComplete = async (id: string) => {
    try { await bookingService.complete(id); toast.success('Qiraja përfundoi'); loadOwnerData(); } catch (err: any) { toast.error(err.response?.data?.message || t('common.error')); }
  };

  const handleCancel = async (id: string) => {
    try { await bookingService.cancel(id); toast.success('Anuluar'); loadOwnerData(); } catch (err: any) { toast.error(err.response?.data?.message || t('common.error')); }
  };

  const handleMarkPaid = async (id: string) => {
    try { await bookingService.markAsPaid(id); toast.success('Shënuar si e paguar'); loadOwnerData(); } catch (err: any) { toast.error(err.response?.data?.message || t('common.error')); }
  };

  const handleSetPaymentMethod = async (id: string, method: string) => {
    try { await bookingService.updatePaymentMethod(id, method); loadOwnerData(); } catch (err: any) { toast.error(err.response?.data?.message || t('common.error')); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  const pendingBookings = ownerBookings.filter((b: any) => b.status === 'pending');
  const activeBookings = ownerBookings.filter((b: any) => b.status === 'active' || b.status === 'confirmed');
  const availableVehicles = vehicles.filter(v => v.availability);
  const rentedVehicles = vehicles.filter(v => !v.availability);

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-100 flex items-center justify-center">
                  <Car className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Paneli i Pronarit</h1>
                  <p className="text-secondary-500 text-sm">Menaxho automjetet dhe rezervimet e tua</p>
                </div>
              </div>
            </div>
            <Button onClick={() => navigate('/list-vehicle')}>
              <Plus className="w-4 h-4" /> Shto Automjet
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
        >
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-secondary-500">Automjetet</p>
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center"><Car className="w-4 h-4 text-blue-600" /></div>
            </div>
            <p className="text-2xl font-bold">{stats.totalVehicles}</p>
            <p className="text-[10px] text-secondary-400 mt-1">{availableVehicles.length} në dispozicion · {rentedVehicles.length} të dhëna me qira</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-secondary-500">Qira Aktive</p>
              <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center"><Calendar className="w-4 h-4 text-green-600" /></div>
            </div>
            <p className="text-2xl font-bold">{stats.activeRentals}</p>
            <p className="text-[10px] text-secondary-400 mt-1">Duke u zhvilluar tani</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-secondary-500">Në Pritje</p>
              <div className="w-8 h-8 rounded-xl bg-yellow-100 flex items-center justify-center"><Clock className="w-4 h-4 text-yellow-600" /></div>
            </div>
            <p className="text-2xl font-bold">{stats.pendingRequests}</p>
            <p className="text-[10px] text-secondary-400 mt-1">Kërkesa për konfirmim</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-secondary-500">Këtë Muaj</p>
              <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-purple-600" /></div>
            </div>
            <p className="text-2xl font-bold">{formatPrice(stats.monthlyRevenue)}</p>
            <p className="text-[10px] text-secondary-400 mt-1">Të ardhura mujore</p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-secondary-500">Gjithsej</p>
              <div className="w-8 h-8 rounded-xl bg-accent-100 flex items-center justify-center"><DollarSign className="w-4 h-4 text-accent" /></div>
            </div>
            <p className="text-2xl font-bold">{formatPrice(stats.totalEarnings)}</p>
            <p className="text-[10px] text-secondary-400 mt-1">Të ardhura totale</p>
          </Card>
        </motion.div>

        {/* Pending Requests Alert */}
        {pendingBookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800">Keni {pendingBookings.length} kërkesa të reja për rezervim</p>
                <p className="text-sm text-yellow-600">Konfirmoni ose anuloni rezervimet në pritje</p>
              </div>
              <Button size="sm" variant="outline" className="ml-auto flex-shrink-0" onClick={() => navigate('/reservations')}>
                Shiko të gjitha
              </Button>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Fleet */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fleet Overview */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Automjetet e Mia ({vehicles.length})</h2>
                <Button variant="outline" size="sm" onClick={() => navigate('/list-vehicle')}>
                  <Plus className="w-4 h-4" /> Shto
                </Button>
              </div>

              {vehicles.length === 0 ? (
                <Card className="p-12 text-center">
                  <Car className="w-12 h-12 mx-auto text-secondary-200 mb-4" />
                  <p className="font-medium text-secondary-600">Nuk keni automjete të listuara</p>
                  <p className="text-sm text-secondary-400 mt-1">Listoni automjetin tuaj të parë për të filluar</p>
                  <Button className="mt-4" onClick={() => navigate('/list-vehicle')}>
                    <Plus className="w-4 h-4" /> Listo Automjet
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {vehicles.map((v: any) => {
                    const vehicleBookings = ownerBookings.filter((b: any) => b.vehicle?._id === v._id);
                    const activeB = vehicleBookings.filter((b: any) => b.status === 'active' || b.status === 'confirmed');
                    return (
                      <Card key={v._id} hover onClick={() => navigate(`/vehicles/${v._id}`)} className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0">
                            <img src={v.images?.[0] || ''} alt={v.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold truncate">{v.title}</h3>
                              <Badge variant={v.availability ? 'accent' : 'warning'} className="ml-2 flex-shrink-0">
                                {v.availability ? 'Në dispozicion' : 'Me qira'}
                              </Badge>
                            </div>
                            <p className="text-xs text-secondary-500">{v.brand} {v.model} {v.year} · {v.transmission}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-secondary-400">
                              <span className="text-primary font-semibold">{formatPrice(v.dailyPrice)}/ditë</span>
                              {v.rating > 0 && (
                                <span className="flex items-center gap-1">
                                  ★ {v.rating.toFixed(1)} ({v.numReviews})
                                </span>
                              )}
                              {activeB.length > 0 && (
                                <span className="flex items-center gap-1 text-accent">
                                  <Calendar className="w-3 h-3" /> {activeB.length} aktive
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Recent Bookings on Owner's Vehicles */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Rezervimet e Fundit</h2>
                <Button variant="ghost" size="sm" onClick={() => navigate('/reservations')}>
                  Shiko të gjitha &rarr;
                </Button>
              </div>

              {ownerBookings.length === 0 ? (
                <Card className="p-8 text-center">
                  <Calendar className="w-10 h-10 mx-auto text-secondary-200 mb-3" />
                  <p className="text-sm text-secondary-500">Nuk ka rezervime ende</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {ownerBookings.slice(0, 5).map((b: any) => (
                    <Card key={b._id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar src={b.user?.profilePhoto} size="sm" />
                          <div>
                            <p className="text-sm font-medium">{b.user?.firstName} {b.user?.lastName}</p>
                            <p className="text-xs text-secondary-400">
                              {b.vehicle?.title} · {formatDate(b.startDate)} - {formatDate(b.endDate)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{formatPrice(b.totalPrice)}</p>
                          <Badge variant={
                            b.status === 'confirmed' ? 'accent' :
                            b.status === 'pending' ? 'warning' :
                            b.status === 'active' ? 'primary' :
                            b.status === 'completed' ? 'accent' : 'danger'
                          } className="mt-1">
                            {b.status === 'pending' && 'Në Pritje'}
                            {b.status === 'confirmed' && 'E Konfirmuar'}
                            {b.status === 'active' && 'Aktive'}
                            {b.status === 'completed' && 'E Përfunduar'}
                            {b.status === 'cancelled' && 'E Anuluar'}
                          </Badge>
                        </div>
                      </div>
                      {/* Quick actions */}
                      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                        {b.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => handleConfirm(b._id)}>
                              <Check className="w-3 h-3 mr-1" /> Konfirmo
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleCancel(b._id)}>
                              <AlertCircle className="w-3 h-3 mr-1" /> Anulo
                            </Button>
                          </>
                        )}
                        {b.status === 'confirmed' && (
                          <Button size="sm" onClick={() => handleStartRental(b._id)}>
                            <Calendar className="w-3 h-3 mr-1" /> Fillo Qiranë
                          </Button>
                        )}
                        {b.status === 'active' && (
                          <Button size="sm" onClick={() => handleComplete(b._id)}>
                            <Check className="w-3 h-3 mr-1" /> Përfundo
                          </Button>
                        )}
                        {!b.paymentMethod && ['pending', 'confirmed', 'active'].includes(b.status) && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleSetPaymentMethod(b._id, 'cash')}>
                              Para në dorë
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleSetPaymentMethod(b._id, 'card')}>
                              Kartë
                            </Button>
                          </>
                        )}
                        {b.paymentStatus !== 'paid' && ['confirmed', 'active'].includes(b.status) && (
                          <Button variant="outline" size="sm" onClick={() => handleMarkPaid(b._id)}>
                            <DollarSign className="w-3 h-3 mr-1" /> Shëno të Paguar
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card className="p-5">
                <h3 className="font-semibold mb-4">Veprime të Shpejta</h3>
                <div className="space-y-2">
                  <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/list-vehicle')}>
                    <Plus className="w-4 h-4" /> Listo Automjet të Ri
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/reservations')}>
                    <Calendar className="w-4 h-4" /> Menaxho Rezervimet
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => navigate('/business')}>
                    <BarChart3 className="w-4 h-4" /> Analizat
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Active Rentals Summary */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="p-5">
                <h3 className="font-semibold mb-4">Përmbledhje</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-500">Automjete në dispozicion</span>
                    <span className="font-semibold text-accent">{availableVehicles.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-500">Automjete me qira</span>
                    <span className="font-semibold text-primary">{rentedVehicles.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-500">Rezervime aktive</span>
                    <span className="font-semibold">{activeBookings.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-500">Në pritje</span>
                    <span className="font-semibold text-yellow-600">{pendingBookings.length}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-500">Fitimi total</span>
                      <span className="font-semibold text-lg text-primary">{formatPrice(stats.totalEarnings)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Vehicle Status */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <Card className="p-5">
                <h3 className="font-semibold mb-4">Statusi i Automjeteve</h3>
                {vehicles.length === 0 ? (
                  <p className="text-sm text-secondary-400">Nuk ka automjete</p>
                ) : (
                  <div className="space-y-2">
                    {vehicles.map((v: any) => (
                      <div key={v._id} className="flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${v.availability ? 'bg-accent' : 'bg-yellow-500'}`} />
                        <span className="truncate flex-1">{v.title}</span>
                        <span className="text-xs text-secondary-400">{formatPrice(v.dailyPrice)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
