import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search as SearchIcon, SlidersHorizontal, X, Map as MapIcon, List, ChevronDown, Star, Car } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { vehicleService } from '@/services/vehicleService';
import { formatPrice, cn } from '@/lib/utils';
import { Button, Card, CardContent, Badge, Input, Select, LoadingSpinner, EmptyState } from '@/components/ui';
import KosovoMap from '@/components/map/KosovoMap';
import { IVehicle } from '@/types';

const categoryOptions = [
  { value: '', label: 'common.all' },
  { value: 'economy', label: 'category.economy' },
  { value: 'compact', label: 'category.compact' },
  { value: 'mid-size', label: 'category.mid-size' },
  { value: 'suv', label: 'category.suv' },
  { value: 'luxury', label: 'category.luxury' },
  { value: 'van', label: 'category.van' },
  { value: 'truck', label: 'category.truck' },
];

const transmissionOptions = [
  { value: '', label: 'common.all' },
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automatic' },
];

const fuelOptions = [
  { value: '', label: 'common.all' },
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
];

const sortOptions = [
  { value: 'createdAt', label: 'Më të rejat' },
  { value: 'dailyPrice', label: 'search.sort.price_asc' },
  { value: '-dailyPrice', label: 'search.sort.price_desc' },
  { value: '-rating', label: 'search.sort.rating' },
  { value: '-year', label: 'search.sort.year' },
];

export default function Search() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    transmission: searchParams.get('transmission') || '',
    fuelType: searchParams.get('fuelType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    seats: searchParams.get('seats') || '',
    location: searchParams.get('location') || '',
    sort: searchParams.get('sort') || 'createdAt',
  });

  useEffect(() => {
    loadVehicles();
  }, [filters]);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const params: any = { ...filters };
      if (params.minPrice) params.minPrice = Number(params.minPrice);
      if (params.maxPrice) params.maxPrice = Number(params.maxPrice);
      if (params.seats) params.seats = Number(params.seats);
      Object.keys(params).forEach(k => !params[k] && delete params[k]);

      const { data } = await vehicleService.getAll({ ...params, status: 'approved', limit: 50 });
      setVehicles(data.data || data.vehicles || []);
    } catch (err) {
      console.error(err);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', transmission: '', fuelType: '', minPrice: '', maxPrice: '', seats: '', location: '', sort: 'createdAt' });
    setSearchParams(new URLSearchParams());
  };

  const hasFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="min-h-screen bg-surface">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder={t('search.placeholder')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-secondary-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && 'bg-primary text-white border-primary')}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">{t('search.filter')}</span>
            </Button>
            <Select
              options={sortOptions.map(o => ({ value: o.value, label: t(o.label as any) || o.label }))}
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="w-40"
            />
            <div className="hidden sm:flex bg-secondary-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('list')}
                className={cn('p-2 rounded-lg transition-colors', viewMode === 'list' ? 'bg-white shadow-soft' : 'hover:bg-secondary-200')}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={cn('p-2 rounded-lg transition-colors', viewMode === 'map' ? 'bg-white shadow-soft' : 'hover:bg-secondary-200')}
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <motion.aside
            initial={false}
            animate={{ width: showFilters ? 280 : 0, opacity: showFilters ? 1 : 0 }}
            className={cn('hidden lg:block flex-shrink-0 overflow-hidden', showFilters ? 'lg:block' : 'lg:hidden')}
          >
            {showFilters && (
              <div className="w-[280px] space-y-6 pr-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{t('search.filter.title')}</h3>
                  {hasFilters && (
                    <button onClick={clearFilters} className="text-xs text-primary hover:underline">
                      {t('search.filter.clear')}
                    </button>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">{t('search.city')}</label>
                  <Input
                    value={filters.location}
                    onChange={(e) => updateFilter('location', e.target.value)}
                    placeholder="Prishtinë, Prizren..."
                    icon={<MapIcon className="w-4 h-4" />}
                  />
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">{t('search.filter.price')}</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => updateFilter('minPrice', e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    />
                  </div>
                </div>

                {/* Category */}
                <Select
                  label={t('search.category')}
                  options={categoryOptions.map(o => ({ value: o.value, label: t(o.label as any) }))}
                  value={filters.category}
                  onChange={(e) => updateFilter('category', e.target.value)}
                />

                {/* Transmission */}
                <Select
                  label={t('search.transmission')}
                  options={transmissionOptions.map(o => ({ value: o.value, label: o.label }))}
                  value={filters.transmission}
                  onChange={(e) => updateFilter('transmission', e.target.value)}
                />

                {/* Fuel Type */}
                <Select
                  label={t('search.fuelType')}
                  options={fuelOptions.map(o => ({ value: o.value, label: o.label }))}
                  value={filters.fuelType}
                  onChange={(e) => updateFilter('fuelType', e.target.value)}
                />

                {/* Seats */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">{t('search.seats')}</label>
                  <div className="flex gap-2 flex-wrap">
                    {[2, 4, 5, 7, 8].map(num => (
                      <button
                        key={num}
                        onClick={() => updateFilter('seats', filters.seats === String(num) ? '' : String(num))}
                        className={cn(
                          'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                          filters.seats === String(num)
                            ? 'border-primary bg-primary-50 text-primary'
                            : 'border-gray-200 text-secondary-600 hover:border-primary/30'
                        )}
                      >
                        {num}+
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Map View */}
            {viewMode === 'map' ? (
              <div className="rounded-2xl overflow-hidden shadow-soft-md mb-6" style={{ height: '60vh' }}>
                <KosovoMap vehicles={vehicles} height="100%" />
              </div>
            ) : null}

            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-secondary-500">
                {loading ? t('common.loading') : `${vehicles.length} ${t('search.results')}`}
              </p>
            </div>

            {/* Vehicle List */}
            {loading ? (
              <LoadingSpinner size="lg" className="py-20" text={t('common.loading')} />
            ) : vehicles.length === 0 ? (
              <EmptyState
                icon={<Car className="w-12 h-12" />}
                title={t('search.noResults')}
                description={t('common.noData')}
                action={
                  hasFilters ? (
                    <Button variant="outline" onClick={clearFilters}>{t('search.filter.clear')}</Button>
                  ) : null
                }
              />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  'grid gap-4',
                  viewMode === 'map' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
                )}
              >
                {vehicles.map((vehicle) => (
                  <motion.div
                    key={vehicle._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    layout
                  >
                    <Card
                      hover
                      onClick={() => navigate(`/vehicles/${vehicle._id}`)}
                      className={cn(
                        'overflow-hidden',
                        viewMode !== 'map' && 'flex flex-col sm:flex-row'
                      )}
                    >
                      <div className={cn(
                        'relative overflow-hidden',
                        viewMode !== 'map' ? 'sm:w-72 h-48 sm:h-auto' : 'h-48'
                      )}>
                        <img
                          src={vehicle.images?.[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400'}
                          alt={vehicle.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge variant={vehicle.availability ? 'accent' : 'warning'}>
                            {vehicle.availability ? t('vehicle.available') : t('vehicle.unavailable')}
                          </Badge>
                          <Badge variant="primary">{t(`category.${vehicle.category}` as any)}</Badge>
                        </div>
                      </div>
                      <CardContent className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{vehicle.title}</h3>
                          <p className="text-sm text-secondary-500">
                            {vehicle.brand} {vehicle.model} {vehicle.year} &middot; {vehicle.transmission} &middot; {vehicle.fuelType}
                          </p>
                          <p className="text-xs text-secondary-400 mt-1 flex items-center gap-1">
                            <MapIcon className="w-3 h-3" />
                            {vehicle.location}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {vehicle.features?.slice(0, 3).map((f, i) => (
                              <span key={i} className="text-xs bg-secondary-100 text-secondary-600 px-2 py-0.5 rounded-md">{f}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                          <div>
                            <span className="text-2xl font-bold text-primary">{formatPrice(vehicle.dailyPrice)}</span>
                            <span className="text-sm text-secondary-400">/{t('vehicle.perDay')}</span>
                          </div>
                          {vehicle.rating > 0 && (
                            <div className="flex items-center gap-1.5">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{vehicle.rating.toFixed(1)}</span>
                              <span className="text-secondary-400 text-sm">({vehicle.numReviews})</span>
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
        </div>
      </div>
    </div>
  );
}
