import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Calendar, CheckCircle, Clock, AlertCircle, XCircle, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { bookingService } from '@/services/bookingService';
import { formatPrice } from '@/lib/utils';
import { Card, Badge, Button, LoadingSpinner, EmptyState } from '@/components/ui';

interface Booking {
  _id: string;
  vehicle: { _id: string; title: string; brand: string; model: string; year: number; images: string[]; dailyPrice: number };
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('sq-XK', { day: 'numeric', month: 'long', year: 'numeric' });
}

function rentalDays(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function countdown(target: Date): string {
  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) return '0 orë';
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days >= 1) return `${days} ditë`;
  return `${hours} orë`;
}

export default function RenterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const res = await bookingService.getAll({ limit: 50 });
      setBookings(res.data.data || res.data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  const confirmedActive = bookings.filter(b => b.status === 'confirmed' || b.status === 'active');
  const pending = bookings.filter(b => b.status === 'pending');
  const completed = bookings.filter(b => b.status === 'completed');

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent-100 flex items-center justify-center">
              <Car className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Paneli im</h1>
              <p className="text-secondary-500 text-sm">Mirë se vini, {user?.firstName}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid sm:grid-cols-3 gap-4 mb-8"
        >
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-secondary-500">Aktive / Të Konfirmuara</p>
              <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-green-600" /></div>
            </div>
            <p className="text-2xl font-bold">{confirmedActive.length}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-secondary-500">Në Pritje</p>
              <div className="w-8 h-8 rounded-xl bg-yellow-100 flex items-center justify-center"><Clock className="w-4 h-4 text-yellow-600" /></div>
            </div>
            <p className="text-2xl font-bold">{pending.length}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-secondary-500">Të Përfunduara</p>
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center"><Calendar className="w-4 h-4 text-blue-600" /></div>
            </div>
            <p className="text-2xl font-bold">{completed.length}</p>
          </Card>
        </motion.div>

        {/* Booking Cards */}
        {bookings.length === 0 ? (
          <Card className="p-12 text-center">
            <Car className="w-12 h-12 mx-auto text-secondary-200 mb-4" />
            <p className="font-medium text-secondary-600">Nuk keni rezervime</p>
            <p className="text-sm text-secondary-400 mt-1">Kërkoni automjete dhe filloni të rezervoni</p>
            <Button className="mt-4" onClick={() => navigate('/search')}>Kërko Automjete</Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((b, i) => {
              const start = new Date(b.startDate);
              const end = new Date(b.endDate);
              const duration = rentalDays(start, end);
              const isConfirmed = b.status === 'confirmed';
              const isActive = b.status === 'active';

              return (
                <motion.div
                  key={b._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      {/* Image */}
                      <div className="sm:w-44 h-36 sm:h-auto overflow-hidden">
                        <img
                          src={b.vehicle?.images?.[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400'}
                          alt={b.vehicle?.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 p-5 flex flex-col gap-3">
                        {/* Title + Price */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{b.vehicle?.title || 'Automjet'}</h3>
                            <p className="text-xs text-secondary-400">{b.vehicle?.brand} {b.vehicle?.model} {b.vehicle?.year}</p>
                          </div>
                          <p className="text-xl font-bold text-primary">{formatPrice(b.totalPrice)}</p>
                        </div>

                        {/* Pickup & Return */}
                        <div className="flex flex-col gap-1 text-sm text-secondary-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-accent" />
                            <span className="font-medium text-secondary-700">Marrja:</span>
                            <span>{fmtDate(start)} në orën 12:00</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="font-medium text-secondary-700">Kthimi:</span>
                            <span>{fmtDate(end)} në orën 12:00</span>
                          </div>
                        </div>

                        {/* Duration */}
                        {duration > 0 && (
                          <div className="text-sm text-secondary-500">
                            Kohëzgjatja: <span className="font-semibold text-secondary-700">{duration} ditë</span>
                          </div>
                        )}

                        {/* Status Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          {b.status === 'confirmed' && <Badge variant="accent"><CheckCircle className="w-3 h-3 mr-1" /> E Konfirmuar</Badge>}
                          {b.status === 'pending' && <Badge variant="warning"><Clock className="w-3 h-3 mr-1" /> Në Pritje</Badge>}
                          {b.status === 'active' && <Badge variant="primary"><Clock className="w-3 h-3 mr-1" /> Aktive</Badge>}
                          {b.status === 'completed' && <Badge variant="accent"><CheckCircle className="w-3 h-3 mr-1" /> E Përfunduar</Badge>}
                          {b.status === 'cancelled' && <Badge variant="danger"><XCircle className="w-3 h-3 mr-1" /> E Anuluar</Badge>}

                          {b.paymentStatus === 'paid' && <Badge variant="accent"><DollarSign className="w-3 h-3 mr-1" /> Paguar</Badge>}
                          {b.paymentStatus !== 'paid' && b.status !== 'cancelled' && (
                            <Badge variant="warning"><AlertCircle className="w-3 h-3 mr-1" /> Pagesa Në Pritje</Badge>
                          )}
                        </div>

                        {/* Countdown: pending/confirmed → time to pickup; active → time to return */}
                        {(isConfirmed || b.status === 'pending') && start > new Date() && (
                          <div className="flex items-center gap-2 p-3 bg-accent-50 rounded-xl">
                            <Clock className="w-5 h-5 text-accent" />
                            <div>
                              <p className="text-xs text-secondary-500">Koha deri në marrje</p>
                              <p className="text-lg font-bold text-accent">
                                {countdown(start)}
                              </p>
                            </div>
                          </div>
                        )}
                        {isActive && end > new Date() && (
                          <div className="flex items-center gap-2 p-3 bg-primary-50 rounded-xl">
                            <Clock className="w-5 h-5 text-primary" />
                            <div>
                              <p className="text-xs text-secondary-500">Koha deri në kthim</p>
                              <p className="text-lg font-bold text-primary">
                                {countdown(end)}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* CTA */}
                        {b.status !== 'cancelled' && b.status !== 'completed' && (
                          <div className="flex gap-2 mt-1 pt-3 border-t border-gray-100">
                            <Button size="sm" variant="outline" onClick={() => navigate(`/vehicles/${b.vehicle?._id}`)}>
                              Shiko Automjetin
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
