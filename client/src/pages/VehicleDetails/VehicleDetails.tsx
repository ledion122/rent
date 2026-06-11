import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Users, Fuel, Gauge, Calendar, Shield, ChevronLeft, ChevronRight, Check, X, Share2, Flag } from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { vehicleService } from '@/services/vehicleService';
import { bookingService } from '@/services/bookingService';
import { reviewService } from '@/services/reviewService';

import { formatPrice, formatDate, calculateDays, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Button, Badge, Card, CardContent, Avatar, StarRating, LoadingSpinner, Modal, Input, Select } from '@/components/ui';
import StripeCheckout from '@/components/stripe/StripeCheckout';
import { paymentService } from '@/services/paymentService';
import { IReview } from '@/types';

interface BlockedRange {
  start: string;
  end: string;
  status: string;
}

function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start);
  const last = new Date(end);
  while (current <= last) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function isDateBlocked(dateStr: string, blockedRanges: BlockedRange[]): boolean {
  const date = new Date(dateStr);
  return blockedRanges.some((range) => {
    const start = new Date(range.start);
    const end = new Date(range.end);
    return date >= start && date <= end;
  });
}

function doRangesOverlap(
  newStart: string,
  newEnd: string,
  blockedRanges: BlockedRange[]
): BlockedRange | undefined {
  const ns = new Date(newStart).getTime();
  const ne = new Date(newEnd).getTime();
  return blockedRanges.find((range) => {
    const rs = new Date(range.start).getTime();
    const re = new Date(range.end).getTime();
    return ns <= re && ne >= rs;
  });
}

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState<any>(null);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [blockedRanges, setBlockedRanges] = useState<BlockedRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [dateError, setDateError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<{ clientSecret: string | null; testMode?: boolean } | null>(null);

  useEffect(() => {
    if (id) loadVehicle();
  }, [id]);

  const loadVehicle = async () => {
    try {
      const { data } = await vehicleService.getById(id!);
      setVehicle(data.data || data.vehicle || data);
      try {
        const revData = await reviewService.getVehicleReviews(id!);
        setReviews(revData.data.data || revData.data.reviews || []);
      } catch {}
      try {
        const bRes = await bookingService.getVehicleBookings(id!);
        const bookings = bRes.data.bookings || [];
        setBlockedRanges(
          bookings
            .filter((b: any) => ['pending', 'confirmed', 'active'].includes(b.status))
            .map((b: any) => ({ start: b.startDate, end: b.endDate, status: b.status }))
        );
      } catch {}
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    setEndDate('');
    setDateError('');
    if (val && isDateBlocked(val, blockedRanges)) {
      setDateError('Kjo datë është e zënë. Zgjidhni një datë tjetër.');
    }
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    setDateError('');
    if (startDate && val) {
      const conflict = doRangesOverlap(startDate, val, blockedRanges);
      if (conflict) {
        setDateError(
          `Këto data mbivendosen me një rezervim ekzistues (${formatDate(conflict.start)} - ${formatDate(conflict.end)}). Zgjidhni data të tjera.`
        );
      }
    }
  };

  const handleBooking = async () => {
    if (!user) { navigate('/login'); return; }
    if (!startDate || !endDate || dateError) return;
    setBookingLoading(true);
    try {
      const { data } = await bookingService.create({
        vehicle: id,
        startDate,
        endDate,
        totalPrice: calculateDays(startDate, endDate) * vehicle.dailyPrice,
      });
      const bookingId = data.booking?._id || data.data?._id || data._id;
      setCurrentBookingId(bookingId);
      toast.success('Rezervimi u krijua');
      setBlockedRanges((prev) => [
        ...prev,
        { start: startDate, end: endDate, status: 'pending' },
      ]);

      const piRes = await paymentService.createPaymentIntent(bookingId);
      const pi = piRes.data;
      setPaymentIntent({ clientSecret: pi.clientSecret, testMode: pi.testMode });
      setBookingSuccess(true);
      setShowPaymentModal(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Rezervimi dështoi');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" text={t('common.loading')} /></div>;
  if (!vehicle) return <div className="min-h-screen flex items-center justify-center"><p className="text-secondary-500">{t('common.error')}</p></div>;

  const days = startDate && endDate ? calculateDays(startDate, endDate) : 0;
  const totalPrice = days * vehicle.dailyPrice;
  const canBook = startDate && endDate && !dateError && !bookingSuccess;
  const allBlockedDates = blockedRanges.flatMap((r) => getDatesInRange(r.start, r.end));
  const specs = [
    { label: t('vehicle.brand'), value: vehicle.brand },
    { label: t('vehicle.model'), value: vehicle.model },
    { label: t('vehicle.year'), value: vehicle.year },
    { label: t('vehicle.transmission'), value: vehicle.transmission },
    { label: t('vehicle.fuel'), value: vehicle.fuelType },
    { label: t('vehicle.seats'), value: vehicle.seats },
    { label: t('vehicle.doors'), value: vehicle.doors },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Gallery */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-secondary-500 hover:text-secondary-900 mb-4">
            <ChevronLeft className="w-4 h-4" /> {t('common.back')}
          </button>
          
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Main Image */}
            <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden">
              <img
                src={vehicle.images?.[currentImage] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800'}
                alt={vehicle.title}
                className="w-full h-full object-cover"
              />
              {vehicle.images?.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage(p => (p - 1 + vehicle.images.length) % vehicle.images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImage(p => (p + 1) % vehicle.images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-2 gap-4">
              {vehicle.images?.slice(1, 5).map((img: string, i: number) => (
                <div
                  key={i}
                  onClick={() => setCurrentImage(i + 1)}
                  className={`h-[240px] rounded-2xl overflow-hidden cursor-pointer transition-all ${currentImage === i + 1 ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Rating */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{vehicle.title}</h1>
                  <p className="text-secondary-500 mt-1">{vehicle.brand} {vehicle.model} {vehicle.year}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="p-2 rounded-xl hover:bg-secondary-100 transition-colors" title={t('vehicle.share')}><Share2 className="w-5 h-5" /></button>
                  <button className="p-2 rounded-xl hover:bg-secondary-100 transition-colors" title={t('vehicle.report')}><Flag className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1">
                  <StarRating rating={vehicle.rating} />
                  <span className="font-semibold ml-1">{vehicle.rating.toFixed(1)}</span>
                  <span className="text-secondary-400">({vehicle.numReviews} {t('vehicle.reviews')})</span>
                </div>
                <span className="text-secondary-300">|</span>
                <span className="flex items-center gap-1 text-sm text-secondary-500">
                  <MapPin className="w-4 h-4" /> {vehicle.location}
                </span>
                <span className="text-secondary-300">|</span>
                <Badge variant={vehicle.availability ? 'accent' : 'warning'}>
                  {vehicle.availability ? t('vehicle.available') : t('vehicle.unavailable')}
                </Badge>
              </div>
            </motion.div>

            {/* Specs Grid */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="text-xl font-semibold mb-4">{t('vehicle.specs')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {specs.map((spec) => (
                  <div key={spec.label} className="bg-secondary-50 rounded-xl p-4 text-center">
                    <p className="text-xs text-secondary-400 uppercase mb-1">{spec.label}</p>
                    <p className="font-semibold capitalize">{String(spec.value)}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Description */}
            {vehicle.description && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="text-xl font-semibold mb-4">{t('vehicle.description')}</h2>
                <p className="text-secondary-600 leading-relaxed">{vehicle.description}</p>
              </motion.div>
            )}

            {/* Features */}
            {vehicle.features?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="text-xl font-semibold mb-4">{t('vehicle.features')}</h2>
                <div className="flex flex-wrap gap-2">
                  {vehicle.features.map((f: string) => (
                    <span key={f} className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-50 text-accent-700 rounded-lg text-sm">
                      <Check className="w-3.5 h-3.5" /> {f}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Location Map */}
            {vehicle.coordinates?.lat && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <h2 className="text-xl font-semibold mb-4">{t('vehicle.location')}</h2>
                <div className="h-64 rounded-2xl overflow-hidden">
                  <MapContainer center={[vehicle.coordinates.lat, vehicle.coordinates.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[vehicle.coordinates.lat, vehicle.coordinates.lng]} />
                  </MapContainer>
                </div>
                <p className="text-sm text-secondary-500 mt-2 flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {vehicle.location}
                </p>
              </motion.div>
            )}

            {/* Reviews */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <h2 className="text-xl font-semibold mb-4">{t('vehicle.reviews')} ({reviews.length})</h2>
              {reviews.length === 0 ? (
                <p className="text-secondary-400 text-sm">{t('common.noData')}</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review: any) => (
                    <Card key={review._id} className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar src={review.user?.profilePhoto} size="md" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold">{review.user?.firstName} {review.user?.lastName}</p>
                            <span className="text-xs text-secondary-400">{formatDate(review.createdAt)}</span>
                          </div>
                          <StarRating rating={review.rating} size="sm" />
                          <p className="text-sm text-secondary-600 mt-2">{review.comment}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card className="p-6">
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold text-primary">{formatPrice(vehicle.dailyPrice)}</span>
                  <span className="text-secondary-400">/{t('vehicle.perDay')}</span>
                </div>

                {vehicle.weeklyDiscount > 0 && (
                  <p className="text-sm text-accent mb-1">{t('vehicle.weeklyDiscount')}: {vehicle.weeklyDiscount}%</p>
                )}
                {vehicle.monthlyDiscount > 0 && (
                  <p className="text-sm text-accent mb-4">{t('vehicle.monthlyDiscount')}: {vehicle.monthlyDiscount}%</p>
                )}

                {/* Blocked Dates Display */}
                {blockedRanges.length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-red-700 mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Datat e zëna / Blocked dates
                    </div>
                    <div className="space-y-1">
                      {blockedRanges.map((r, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-red-600">
                          <X className="w-3 h-3 flex-shrink-0" />
                          <span>
                            {formatDate(r.start)} — {formatDate(r.end)}
                            <span className="ml-1 opacity-60">({r.status})</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!bookingSuccess ? (
                  <>
                    <div className="space-y-3 mb-4">
                      <Input
                        type="date"
                        label={t('booking.startDate')}
                        value={startDate}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      <Input
                        type="date"
                        label={t('booking.endDate')}
                        value={endDate}
                        onChange={(e) => handleEndDateChange(e.target.value)}
                        min={startDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    {dateError && (
                      <p className="text-xs text-red-500 mb-3 flex items-center gap-1">
                        <X className="w-3 h-3" /> {dateError}
                      </p>
                    )}

                    {days > 0 && !dateError && (
                      <div className="space-y-2 mb-4 p-4 bg-secondary-50 rounded-xl">
                        <div className="flex justify-between text-sm">
                          <span>{formatPrice(vehicle.dailyPrice)} x {days} {t('booking.days')}</span>
                          <span>{formatPrice(days * vehicle.dailyPrice)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
                          <span>{t('booking.total')}</span>
                          <span className="text-primary">{formatPrice(totalPrice)}</span>
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full rounded-xl py-3"
                      size="lg"
                      onClick={handleBooking}
                      disabled={!canBook}
                      loading={bookingLoading}
                    >
                      {t('vehicle.book')}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent-100 flex items-center justify-center mx-auto mb-3">
                      <Check className="w-6 h-6 text-accent" />
                    </div>
                    <p className="font-semibold text-accent mb-1">Rezervimi u krijua</p>
                    <p className="text-xs text-secondary-500 mb-4">
                      {formatDate(startDate)} — {formatDate(endDate)}
                    </p>
                    <Button
                      variant="outline"
                      className="w-full rounded-xl"
                      size="sm"
                      onClick={() => navigate('/dashboard')}
                    >
                      Shiko Panelin
                    </Button>
                  </div>
                )}

              </Card>

              {/* Owner Card */}
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar src={vehicle.owner?.profilePhoto} size="lg" />
                  <div>
                    <p className="font-semibold">{vehicle.owner?.firstName} {vehicle.owner?.lastName}</p>
                    <p className="text-xs text-secondary-400">{t('vehicle.owner')}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Paguaj Rezervimin" size="sm">
        {paymentIntent && currentBookingId && (
          <StripeCheckout
            bookingId={currentBookingId}
            amount={totalPrice}
            clientSecret={paymentIntent.clientSecret}
            testMode={paymentIntent.testMode}
            onSuccess={() => setShowPaymentModal(false)}
            onClose={() => setShowPaymentModal(false)}
          />
        )}
      </Modal>
    </div>
  );
}
