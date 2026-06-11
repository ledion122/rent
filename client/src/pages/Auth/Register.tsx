import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, UserCircle, Building2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function Register() {
  const { t } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', role: 'individual',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const updateField = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwordet nuk përputhen');
      return;
    }
    if (!acceptTerms) {
      toast.error('Ju lutem pranoni kushtet');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...data } = formData;
      await register(data);
      toast.success(t('auth.registerSuccess'));
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Brand Side */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hidden lg:flex w-1/2 bg-gradient-to-br from-accent via-accent-600 to-accent-900 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-primary rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
              <Car className="w-6 h-6 text-accent" />
            </div>
            <span className="text-2xl font-bold text-white">RentKosova</span>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">Bashkohu me ne!</h1>
            <p className="text-white/60 text-lg">{t('home.cta.subtitle')}</p>
          </div>
          <div className="flex gap-6 text-white/40 text-sm">
            <span>&copy; 2024 RentKosova</span>
            <a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a>
          </div>
        </div>
      </motion.div>

      {/* Right - Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Rent<span className="text-accent">Kosova</span></span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-secondary-900">{t('auth.register')}</h1>
            <p className="text-secondary-500 mt-2">
              {t('auth.haveAccount')}{' '}
              <Link to="/login" className="text-accent font-medium hover:underline">
                {t('auth.login')}
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">{t('auth.role')}</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'individual', icon: UserCircle, label: t('auth.individual') },
                  { value: 'business', icon: Building2, label: 'Business' },
                ].map(role => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => updateField('role', role.value)}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                      formData.role === role.value
                        ? 'border-accent bg-accent-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <role.icon className={cn('w-5 h-5', formData.role === role.value ? 'text-accent' : 'text-secondary-400')} />
                    <span className={cn('font-medium text-sm', formData.role === role.value ? 'text-accent' : 'text-secondary-600')}>
                      {role.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('auth.firstName')}
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                icon={<User className="w-4 h-4" />}
                required
              />
              <Input
                label={t('auth.lastName')}
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                icon={<User className="w-4 h-4" />}
                required
              />
            </div>

            <Input
              label={t('auth.email')}
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />
            <Input
              label={t('auth.phone')}
              type="tel"
              placeholder="+383 44 000 000"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              icon={<Phone className="w-4 h-4" />}
            />

            <div className="relative">
              <Input
                label={t('auth.password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-secondary-400 hover:text-secondary-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Input
              label="Konfirmo Fjalëkalimin"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <label className="flex items-start gap-2 text-sm text-secondary-600">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-accent focus:ring-accent"
              />
              <span>Pranoj <a href="#" className="text-accent hover:underline">{t('footer.terms')}</a> dhe <a href="#" className="text-accent hover:underline">{t('footer.privacy')}</a></span>
            </label>

            <Button
              type="submit"
              className="w-full py-3 rounded-xl"
              size="lg"
              loading={loading}
              disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.password || !acceptTerms}
            >
              {t('auth.register')}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-secondary-400">
              {t('auth.haveAccount')}{' '}
              <Link to="/login" className="text-accent font-semibold hover:underline">
                {t('auth.login')}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
