import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, MapPin, Phone, Mail, Globe, Star, Car, Users, TrendingUp, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { businessService } from '@/services/businessService';
import { vehicleService } from '@/services/vehicleService';
import { formatPrice } from '@/lib/utils';
import { Card, CardContent, Badge, Button, Avatar, LoadingSpinner, StarRating } from '@/components/ui';

export default function Business() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [business, setBusiness] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadBusiness();
  }, [id]);

  const loadBusiness = async () => {
    try {
      const { data } = await businessService.getById(id!);
      const biz = data.data || data.business || data;
      setBusiness(biz);
      if (biz._id) {
        const vRes = await vehicleService.getAll({ business: biz._id });
        setVehicles(vRes.data.data || vRes.data.vehicles || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!business) return <div className="min-h-screen flex items-center justify-center"><p>{t('common.error')}</p></div>;

  return (
    <div className="min-h-screen bg-surface">
      {/* Banner */}
      <div className="h-64 bg-gradient-to-br from-secondary-800 to-secondary-900 relative overflow-hidden">
        {business.banner && <img src={business.banner} alt="" className="w-full h-full object-cover opacity-40" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Company Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="-mt-20 relative z-10 flex flex-col sm:flex-row items-start sm:items-end gap-6"
        >
          <div className="w-32 h-32 rounded-2xl border-4 border-white overflow-hidden bg-white shadow-soft-lg">
            {business.logo ? (
              <img src={business.logo} alt={business.companyName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                <Building2 className="w-12 h-12 text-primary" />
              </div>
            )}
          </div>
          <div className="flex-1 pb-2">
            <h1 className="text-3xl font-bold text-white">{business.companyName}</h1>
            <div className="flex items-center gap-4 mt-2 text-white/70 text-sm">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {business.city || business.address}</span>
              {business.rating > 0 && (
                <>
                  <span>|</span>
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {business.rating.toFixed(1)}</span>
                </>
              )}
              <span>|</span>
              <span className="flex items-center gap-1"><Car className="w-4 h-4" /> {business.totalVehicles || vehicles.length} {t('business.vehicles')}</span>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mt-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {business.description && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-3">About</h2>
                <p className="text-secondary-600 leading-relaxed">{business.description}</p>
              </Card>
            )}

            {/* Vehicles */}
            <div>
              <h2 className="text-lg font-semibold mb-4">{t('business.vehicles')} ({vehicles.length})</h2>
              {vehicles.length === 0 ? (
                <p className="text-secondary-400 text-sm">{t('common.noData')}</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {vehicles.map((v: any) => (
                    <Card key={v._id} hover onClick={() => navigate(`/vehicles/${v._id}`)} className="overflow-hidden">
                      <div className="h-40 overflow-hidden">
                        <img src={v.images?.[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400'} alt={v.title} className="w-full h-full object-cover" />
                      </div>
                      <CardContent>
                        <h3 className="font-semibold">{v.title}</h3>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-primary font-bold">{formatPrice(v.dailyPrice)}/{t('vehicle.perDay')}</span>
                          {v.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <StarRating rating={v.rating} size="sm" />
                              <span className="text-sm">{v.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Contact Info</h3>
              <div className="space-y-3 text-sm">
                {business.address && <p className="flex items-center gap-2 text-secondary-600"><MapPin className="w-4 h-4 text-primary" /> {business.address}</p>}
                {business.phone && <p className="flex items-center gap-2 text-secondary-600"><Phone className="w-4 h-4 text-primary" /> {business.phone}</p>}
                {business.email && <p className="flex items-center gap-2 text-secondary-600"><Mail className="w-4 h-4 text-primary" /> {business.email}</p>}
                {business.website && <p className="flex items-center gap-2 text-secondary-600"><Globe className="w-4 h-4 text-primary" /> {business.website}</p>}
              </div>

            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
