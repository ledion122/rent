import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function Login() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
      toast.success(t('auth.loginSuccess'));
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
        className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary via-primary-700 to-primary-900 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
              <Car className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-white">RentKosova</span>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-white mb-4">Mirë se vini!</h1>
            <p className="text-white/60 text-lg">{t('home.hero.subtitle')}</p>
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
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Rent<span className="text-primary">Kosova</span></span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-secondary-900">{t('auth.login')}</h1>
            <p className="text-secondary-500 mt-2">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">
                {t('auth.register')}
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label={t('auth.email')}
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />
            <div className="relative">
              <Input
                label={t('auth.password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-secondary-600">
                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                Më kujto
              </label>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                {t('auth.forgotPassword')}
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full py-3 rounded-xl"
              size="lg"
              loading={loading}
              disabled={!email || !password}
            >
              {t('auth.login')}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-secondary-400">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                {t('auth.register')}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
