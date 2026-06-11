import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Upload, X, Car, MapPin, DollarSign, Image as ImageIcon, FileText, Crosshair } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useLanguage } from '@/contexts/LanguageContext';
import { vehicleService } from '@/services/vehicleService';
import { Button, Input, Select, Card, CardContent, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const steps = [
  { id: 1, title: 'Basic Info', icon: FileText },
  { id: 2, title: 'Details', icon: Car },
  { id: 3, title: 'Location', icon: MapPin },
  { id: 4, title: 'Photos', icon: ImageIcon },
  { id: 5, title: 'Pricing', icon: DollarSign },
  { id: 6, title: 'Review', icon: Check },
];

const categoryOptions = [
  { value: 'economy', label: 'Economy' },
  { value: 'compact', label: 'Compact' },
  { value: 'mid-size', label: 'Mid-size' },
  { value: 'suv', label: 'SUV' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'van', label: 'Van' },
  { value: 'truck', label: 'Truck' },
];

const fuelOptions = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
];

const transmissionOptions = [
  { value: 'manual', label: 'Manual' },
  { value: 'automatic', label: 'Automatic' },
];

const featureOptions = ['AC', 'GPS', 'Bluetooth', 'USB', 'Heated Seats', 'Sunroof', 'Cruise Control', 'Parking Sensors', 'Backup Camera', 'Leather Seats'];

function LocationClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function VehicleListing() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '', brand: '', model: '', year: new Date().getFullYear(), category: '',
    transmission: '', fuelType: '', seats: 5, doors: 4, features: [] as string[],
    location: '', lat: '', lng: '',
    images: [] as string[],
    dailyPrice: '', weeklyDiscount: 0, monthlyDiscount: 0,
    description: '',
  });

  const updateField = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature) ? prev.features.filter(f => f !== feature) : [...prev.features, feature],
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setFormData(prev => ({ ...prev, images: [...prev.images, event.target!.result as string] }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 1: return !!formData.title && !!formData.brand && !!formData.model && !!formData.category;
      case 2: return !!formData.transmission && !!formData.fuelType;
      case 3: return !!formData.location;
      case 4: return formData.images.length > 0;
      case 5: return !!formData.dailyPrice;
      default: return true;
    }
  };

  const handleNext = () => {
    if (!validateStep()) { toast.error('Ju lutem plotësoni të gjitha fushat'); return; }
    setStep(prev => Math.min(prev + 1, 6));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const vehicleData = {
        ...formData,
        year: Number(formData.year),
        seats: Number(formData.seats),
        doors: Number(formData.doors),
        dailyPrice: Number(formData.dailyPrice),
        weeklyDiscount: Number(formData.weeklyDiscount),
        monthlyDiscount: Number(formData.monthlyDiscount),
        coordinates: { lat: Number(formData.lat) || 42.6026, lng: Number(formData.lng) || 20.9029 },
      };
      await vehicleService.create(vehicleData);
      toast.success('Makina u listua me sukses!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
          <Input label="Title *" placeholder="e.g. Mercedes-Benz C-Class 2024" value={formData.title} onChange={e => updateField('title', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Brand *" placeholder="Mercedes-Benz" value={formData.brand} onChange={e => updateField('brand', e.target.value)} />
            <Input label="Model *" placeholder="C-Class" value={formData.model} onChange={e => updateField('model', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Year" type="number" value={formData.year} onChange={e => updateField('year', e.target.value)} />
            <Select label="Category *" options={categoryOptions} value={formData.category} onChange={e => updateField('category', e.target.value)} placeholder="Select category" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1.5">Description</label>
            <textarea className="input-field min-h-[100px] resize-none" placeholder="Describe your vehicle..." value={formData.description} onChange={e => updateField('description', e.target.value)} />
          </div>
        </div>
      );

      case 2: return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">Vehicle Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Transmission *" options={transmissionOptions} value={formData.transmission} onChange={e => updateField('transmission', e.target.value)} placeholder="Select" />
            <Select label="Fuel Type *" options={fuelOptions} value={formData.fuelType} onChange={e => updateField('fuelType', e.target.value)} placeholder="Select" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Seats" type="number" value={formData.seats} onChange={e => updateField('seats', e.target.value)} />
            <Input label="Doors" type="number" value={formData.doors} onChange={e => updateField('doors', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Features</label>
            <div className="flex flex-wrap gap-2">
              {featureOptions.map(f => (
                <button key={f} onClick={() => toggleFeature(f)} className={cn(
                  'px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
                  formData.features.includes(f) ? 'border-primary bg-primary-50 text-primary' : 'border-gray-200 text-secondary-600 hover:border-primary/30'
                )}>{f}</button>
              ))}
            </div>
          </div>
        </div>
      );

      case 3: return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">Location</h3>
          <p className="text-sm text-secondary-500 mb-2">Enter the city and coordinates manually, or click on the map to set the exact location:</p>
          <Input label="City/Location *" placeholder="Prishtinë, Kosovë" value={formData.location} onChange={e => updateField('location', e.target.value)} icon={<MapPin className="w-4 h-4" />} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Latitude" type="number" step="any" placeholder="42.6026" value={formData.lat} onChange={e => updateField('lat', e.target.value)} />
            <Input label="Longitude" type="number" step="any" placeholder="20.9029" value={formData.lng} onChange={e => updateField('lng', e.target.value)} />
          </div>
          <div className="flex items-center gap-2 text-xs text-primary">
            <Crosshair className="w-3 h-3" />
            Click anywhere on the map below to set coordinates
          </div>
          <div className="h-64 rounded-xl overflow-hidden border border-gray-200">
            <MapContainer
              center={[
                formData.lat ? parseFloat(formData.lat) : 42.6026,
                formData.lng ? parseFloat(formData.lng) : 20.9029,
              ]}
              zoom={10}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationClickHandler onMapClick={(lat, lng) => {
                updateField('lat', lat.toString());
                updateField('lng', lng.toString());
              }} />
              {formData.lat && formData.lng && (
                <Marker position={[parseFloat(formData.lat), parseFloat(formData.lng)]} />
              )}
            </MapContainer>
          </div>
          <p className="text-xs text-secondary-400">
            {formData.lat && formData.lng
              ? `Selected: ${formData.lat}, ${formData.lng}`
              : 'Coordinates will appear on the Kosovo map for discovery'}
          </p>
        </div>
      );

      case 4: return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">Photos</h3>
          <div className="grid grid-cols-3 gap-4">
            {formData.images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-secondary-100">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button onClick={() => removeImage(i)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"><X className="w-3 h-3" /></button>
              </div>
            ))}
            {formData.images.length < 8 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-secondary-50">
                <Upload className="w-8 h-8 text-secondary-400 mb-2" />
                <span className="text-xs text-secondary-500">Upload</span>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>
          <p className="text-xs text-secondary-400">Upload up to 8 photos. First image will be the cover.</p>
        </div>
      );

      case 5: return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">Pricing</h3>
          <Input label="Daily Price (€) *" type="number" placeholder="50" value={formData.dailyPrice} onChange={e => updateField('dailyPrice', e.target.value)} icon={<DollarSign className="w-4 h-4" />} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Weekly Discount (%)" type="number" placeholder="10" value={formData.weeklyDiscount} onChange={e => updateField('weeklyDiscount', e.target.value)} />
            <Input label="Monthly Discount (%)" type="number" placeholder="20" value={formData.monthlyDiscount} onChange={e => updateField('monthlyDiscount', e.target.value)} />
          </div>
        </div>
      );

      case 6: return (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold mb-4">Review & Submit</h3>
          <Card className="p-6 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-secondary-400">Title:</span> <span className="font-medium">{formData.title}</span></div>
              <div><span className="text-secondary-400">Brand/Model:</span> <span className="font-medium">{formData.brand} {formData.model}</span></div>
              <div><span className="text-secondary-400">Category:</span> <span className="font-medium capitalize">{formData.category}</span></div>
              <div><span className="text-secondary-400">Transmission:</span> <span className="font-medium">{formData.transmission}</span></div>
              <div><span className="text-secondary-400">Location:</span> <span className="font-medium">{formData.location}</span></div>
              <div><span className="text-secondary-400">Price:</span> <span className="font-medium">€{formData.dailyPrice}/day</span></div>
            </div>
            {formData.images.length > 0 && (
              <div className="flex gap-2 mt-4">
                {formData.images.slice(0, 4).map((img, i) => (
                  <div key={i} className="w-16 h-16 rounded-lg overflow-hidden"><img src={img} alt="" className="w-full h-full object-cover" /></div>
                ))}
                {formData.images.length > 4 && <div className="w-16 h-16 rounded-lg bg-secondary-100 flex items-center justify-center text-sm text-secondary-500">+{formData.images.length - 4}</div>}
              </div>
            )}
          </Card>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  step > s.id ? 'bg-accent text-white' : step === s.id ? 'bg-primary text-white' : 'bg-secondary-200 text-secondary-400'
                )}>
                  {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                </div>
                {i < steps.length - 1 && (
                  <div className={cn('h-1 w-12 sm:w-20 mx-1 rounded-full', step > s.id ? 'bg-accent' : 'bg-secondary-200')} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map(s => (
              <span key={s.id} className={cn('text-[10px] font-medium hidden sm:block', step === s.id ? 'text-primary' : 'text-secondary-400')}>{s.title}</span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <Button variant="outline" onClick={() => setStep(prev => Math.max(prev - 1, 1))} disabled={step === 1}>
              <ChevronLeft className="w-4 h-4" /> {t('common.back')}
            </Button>
            {step < 6 ? (
              <Button onClick={handleNext}>
                {t('common.next')} <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} loading={submitting}>
                <Check className="w-4 h-4" /> {t('common.submit')}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
