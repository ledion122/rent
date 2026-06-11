import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, Shield, Calendar, Car, Star, Clock, BadgeCheck, Edit3 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { vehicleService } from '@/services/vehicleService';
import { reviewService } from '@/services/reviewService';
import { formatPrice, formatDate } from '@/lib/utils';
import { Avatar, Button, Card, CardContent, Badge, Input, Modal, StarRating, LoadingSpinner, EmptyState } from '@/components/ui';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { t } = useLanguage();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('listings');
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: vData } = await vehicleService.getAll({ owner: user?._id });
      setListings(vData.data || vData.vehicles || []);
    } catch {}
    setLoading(false);
  };

  if (!user) return null;

  const tabs = [
    { id: 'listings', label: t('profile.listings'), icon: Car },
    { id: 'reviews', label: t('profile.reviews'), icon: Star },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Cover */}
      <div className="h-48 bg-gradient-to-br from-primary via-primary-700 to-primary-900 relative">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-20 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-5 left-10 w-24 h-24 bg-accent rounded-full blur-3xl" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="-mt-20 relative z-10"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            <div className="relative">
              <Avatar src={user.profilePhoto} alt={`${user.firstName} ${user.lastName}`} size="xl" className="ring-4 ring-white" />
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-soft-md hover:bg-primary-700 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 pt-4 sm:pt-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>
                {user.verificationStatus === 'verified' && (
                  <BadgeCheck className="w-6 h-6 text-primary" />
                )}
                <Badge variant={user.verificationStatus === 'verified' ? 'accent' : user.verificationStatus === 'pending' ? 'warning' : 'danger'}>
                  {user.verificationStatus}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-secondary-500">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {t('profile.title')}</span>
                <span>|</span>
                <span>{user.email}</span>
                {user.phone && <><span>|</span><span>{user.phone}</span></>}
              </div>
            </div>
            <Button variant="outline" onClick={() => setShowEditModal(true)}>
              <Edit3 className="w-4 h-4" /> {t('profile.edit')}
            </Button>
          </div>
        </motion.div>

        {/* Verification Status */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-semibold">{t('profile.verify')}</p>
                  <p className="text-sm text-secondary-500 capitalize">{user.verificationStatus}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">{t('profile.uploadLicense')}</Button>
            </div>
          </Card>
        </motion.div>

        {/* Tabs */}
        <div className="mt-8">
          <div className="flex gap-1 bg-secondary-100 rounded-xl p-1 w-fit">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id ? 'bg-white shadow-soft text-secondary-900' : 'text-secondary-500 hover:text-secondary-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-6">
            {activeTab === 'listings' && (
              listings.length === 0 ? (
                <EmptyState icon={<Car className="w-12 h-12" />} title={t('common.noData')} description={t('profile.listings')} action={<Button onClick={() => navigate('/list-vehicle')}>{t('nav.list')}</Button>} />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {listings.map((v: any) => (
                    <Card key={v._id} hover onClick={() => navigate(`/vehicles/${v._id}`)} className="overflow-hidden">
                      <div className="h-40 overflow-hidden">
                        <img src={v.images?.[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400'} alt={v.title} className="w-full h-full object-cover" />
                      </div>
                      <CardContent>
                        <h3 className="font-semibold">{v.title}</h3>
                        <p className="text-sm text-secondary-500">{v.brand} {v.model} {v.year}</p>
                        <p className="text-primary font-bold mt-2">{formatPrice(v.dailyPrice)}/{t('vehicle.perDay')}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            )}

            {activeTab === 'reviews' && (
              <EmptyState icon={<Star className="w-12 h-12" />} title={t('common.noData')} description={t('profile.reviews')} />
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title={t('profile.edit')} size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('auth.firstName')} defaultValue={user.firstName} />
            <Input label={t('auth.lastName')} defaultValue={user.lastName} />
          </div>
          <Input label={t('auth.phone')} defaultValue={user.phone} />
          <Button className="w-full">{t('common.save')}</Button>
        </div>
      </Modal>
    </div>
  );
}
