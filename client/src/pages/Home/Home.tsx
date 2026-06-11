import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Calendar, MapPin, ArrowRight, Star, Car, Shield, Users, ChevronRight, Sparkles, TrendingUp, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { vehicleService } from '@/services/vehicleService';
import { formatPrice, cn } from '@/lib/utils';
import KosovoMap from '@/components/map/KosovoMap';
import { Button, Card, CardContent, Badge, LoadingSpinner, StarRating } from '@/components/ui';
import { IVehicle } from '@/types';

const kosovoCities = [
  { name: 'Prishtinë', lat: 42.6629, lng: 21.1655 },
  { name: 'Prizren', lat: 42.2139, lng: 20.7397 },
  { name: 'Pejë', lat: 42.6593, lng: 20.2886 },
  { name: 'Gjakovë', lat: 42.3803, lng: 20.4308 },
  { name: 'Ferizaj', lat: 42.3703, lng: 21.1553 },
  { name: 'Gjilan', lat: 42.4635, lng: 21.4694 },
  { name: 'Mitrovicë', lat: 42.8838, lng: 20.8662 },
];

const categories = [
  { key: 'economy', icon: Car, color: 'bg-green-100 text-green-600' },
  { key: 'compact', icon: Car, color: 'bg-blue-100 text-blue-600' },
  { key: 'mid-size', icon: Car, color: 'bg-purple-100 text-purple-600' },
  { key: 'suv', icon: Shield, color: 'bg-orange-100 text-orange-600' },
  { key: 'luxury', icon: Star, color: 'bg-yellow-100 text-yellow-600' },
  { key: 'van', icon: Users, color: 'bg-teal-100 text-teal-600' },
  { key: 'truck', icon: BarChart3, color: 'bg-red-100 text-red-600' },
];

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-100px' },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true },
  transition: { staggerChildren: 0.1 },
};

export default function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const { data } = await vehicleService.getAll({ limit: 8, status: 'approved' });
      setVehicles(data.data || data.vehicles || []);
    } catch (err) {
      console.error('Error loading vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-900 via-secondary-800 to-primary-900" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white/80 text-sm mb-6"
              >
                <Sparkles className="w-4 h-4" />
                {t('home.hero.subtitle')}
              </motion.div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
                {t('home.hero.title')}
              </h1>

              <p className="text-lg text-white/60 mb-8 max-w-lg">
                {t('home.hero.subtitle')}
              </p>

              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('search.placeholder')}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <Button type="submit" size="lg" className="rounded-2xl">
                  <Search className="w-5 h-5" />
                  {t('home.hero.search')}
                </Button>
              </form>

              <div className="flex flex-wrap gap-2">
                {kosovoCities.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => navigate(`/search?city=${encodeURIComponent(city.name)}`)}
                    className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs hover:bg-white/10 hover:text-white transition-all"
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/80 via-transparent to-transparent z-10 rounded-3xl" />
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-4">
                  <div className="rounded-2xl overflow-hidden h-[400px]">
                    <KosovoMap height="400px" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="section-title">{t('home.how.title')}</h2>
          </motion.div>

          <motion.div className="grid md:grid-cols-3 gap-8" {...staggerContainer}>
            {[
              { step: '01', icon: Search, title: t('home.how.step1'), desc: t('home.how.desc1') },
              { step: '02', icon: Calendar, title: t('home.how.step2'), desc: t('home.how.desc2') },
              { step: '03', icon: Car, title: t('home.how.step3'), desc: t('home.how.desc3') },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                variants={{
                  initial: { opacity: 0, y: 30 },
                  whileInView: { opacity: 1, y: 0 },
                }}
                className="text-center p-8 rounded-2xl hover:bg-secondary-50 transition-colors"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-6">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-6xl font-black text-primary/10 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-secondary-500">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="flex items-center justify-between mb-12" {...fadeInUp}>
            <div>
              <h2 className="section-title">{t('home.featured')}</h2>
              <p className="section-subtitle">{t('home.popular')}</p>
            </div>
            <Link to="/search" className="btn-ghost text-primary gap-1">
              {t('common.viewAll')} <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {loading ? (
            <LoadingSpinner size="lg" className="py-20" text={t('common.loading')} />
          ) : vehicles.length === 0 ? (
            <div className="text-center py-20 text-secondary-400">
              <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('search.noResults')}</p>
            </div>
          ) : (
            <motion.div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6" {...staggerContainer}>
              {vehicles.map((vehicle) => (
                <motion.div
                  key={vehicle._id}
                  variants={{
                    initial: { opacity: 0, y: 20 },
                    whileInView: { opacity: 1, y: 0 },
                  }}
                >
                  <Card hover onClick={() => navigate(`/vehicles/${vehicle._id}`)} className="overflow-hidden group">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={vehicle.images?.[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400'}
                        alt={vehicle.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge variant={vehicle.availability ? 'accent' : 'warning'}>
                          {vehicle.availability ? t('vehicle.available') : t('vehicle.unavailable')}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant="primary">{t(`category.${vehicle.category}` as any)}</Badge>
                      </div>
                    </div>
                    <CardContent>
                      <h3 className="font-semibold text-lg mb-1 truncate">{vehicle.title}</h3>
                      <p className="text-sm text-secondary-500 mb-3">
                        {vehicle.brand} {vehicle.model} {vehicle.year}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-primary">{formatPrice(vehicle.dailyPrice)}</span>
                          <span className="text-sm text-secondary-400">/{t('vehicle.perDay')}</span>
                        </div>
                        {vehicle.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{vehicle.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-16" {...fadeInUp}>
            <h2 className="section-title">{t('home.categories')}</h2>
          </motion.div>

          <motion.div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4" {...staggerContainer}>
            {categories.map((cat) => (
              <motion.div
                key={cat.key}
                variants={{
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                }}
              >
                <Link
                  to={`/search?category=${cat.key}`}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-gray-100 hover:border-primary/20 hover:shadow-soft-md hover:-translate-y-1 transition-all group"
                >
                  <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <cat.icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-secondary-700 text-center">
                    {t(`category.${cat.key}` as any)}
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Map Preview */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <h2 className="section-title">{t('search.map.explore')}</h2>
            <p className="section-subtitle">{t('home.hero.subtitle')}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden shadow-soft-lg"
          >
            <KosovoMap height="500px" />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-700 to-primary-900 p-12 md:p-20 text-center text-white"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">{t('home.cta.title')}</h2>
              <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">{t('home.cta.subtitle')}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 rounded-2xl"
                  onClick={() => navigate('/search')}
                >
                  {t('home.hero.search')}
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 rounded-2xl"
                  onClick={() => navigate('/register')}
                >
                  {t('home.cta.button')}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
