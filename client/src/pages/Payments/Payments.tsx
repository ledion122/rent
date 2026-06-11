import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Plus, Trash2, Check, Calendar, DollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { bookingService } from '@/services/bookingService';
import { formatPrice, formatDate } from '@/lib/utils';
import { Card, CardContent, Badge, Button, Input, Modal, LoadingSpinner, EmptyState } from '@/components/ui';

export default function Payments() {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data } = await bookingService.getAll();
      setBookings(data.data || data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const savedMethods = [
    { id: '1', type: 'visa', last4: '4242', expiry: '12/26', name: 'John Doe' },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-2">{t('booking.payment')}</h1>
          <p className="text-secondary-500 mb-8">{t('booking.payment')}</p>
        </motion.div>

        {/* Saved Methods */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Saved Payment Methods</h2>
            <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4" /> Add New
            </Button>
          </div>
          {savedMethods.length === 0 ? (
            <Card className="p-6 text-center text-secondary-400 text-sm">{t('common.noData')}</Card>
          ) : (
            <div className="space-y-3">
              {savedMethods.map(method => (
                <Card key={method.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">•••• {method.last4}</p>
                      <p className="text-xs text-secondary-400">Expires {method.expiry}</p>
                    </div>
                  </div>
                  <button className="p-2 text-secondary-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Card>
              ))}
            </div>
          )}
        </motion.div>

        {/* Payment History */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-semibold mb-4">Payment History</h2>
          {bookings.length === 0 ? (
            <EmptyState icon={<DollarSign className="w-12 h-12" />} title={t('common.noData')} />
          ) : (
            <div className="space-y-3">
              {bookings.map((booking, i) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary-100 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-secondary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{booking.vehicle?.title || 'Vehicle'}</p>
                        <p className="text-xs text-secondary-400">{formatDate(booking.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(booking.totalPrice)}</p>
                      <Badge variant={booking.paymentStatus === 'paid' ? 'accent' : 'warning'}>
                        {booking.paymentStatus}
                      </Badge>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Payment Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Payment Method" size="sm">
        <div className="space-y-4">
          <Input label="Card Number" placeholder="4242 4242 4242 4242" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Expiry" placeholder="MM/YY" />
            <Input label="CVC" placeholder="123" />
          </div>
          <Input label="Cardholder Name" placeholder="John Doe" />
          <Button className="w-full"><Check className="w-4 h-4" /> Save Card</Button>
        </div>
      </Modal>
    </div>
  );
}
