import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Moon, Sun, Bell, Shield, Trash2, Save, Eye, EyeOff, Lock, User } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card, CardContent, Input, Modal } from '@/components/ui';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function Settings() {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error('Passwordet nuk përputhen');
      return;
    }
    toast.success('Fjalëkalimi u ndryshua me sukses');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const notifications = [
    { id: 'booking', label: 'Booking Updates', enabled: true },

    { id: 'review', label: 'New Reviews', enabled: false },
    { id: 'promo', label: 'Promotions', enabled: false },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-2">{t('settings.title')}</h1>
          <p className="text-secondary-500 mb-8">{t('settings.title')}</p>
        </motion.div>

        <div className="space-y-6">
          {/* Language */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{t('settings.language')}</p>
                  <p className="text-sm text-secondary-400">{language === 'sq' ? 'Shqip' : 'English'}</p>
                </div>
              </div>
              <div className="flex gap-1 bg-secondary-100 rounded-lg p-1">
                {(['sq', 'en'] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                      language === lang ? 'bg-white shadow-soft text-secondary-900' : 'text-secondary-500'
                    )}
                  >
                    {lang === 'sq' ? 'SQ' : 'EN'}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Theme */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
                <div>
                  <p className="font-medium">{t('settings.theme')}</p>
                  <p className="text-sm text-secondary-400">{darkMode ? 'Dark' : 'Light'}</p>
                </div>
              </div>
              <button
                onClick={toggleDark}
                className={cn(
                  'w-14 h-7 rounded-full transition-colors relative',
                  darkMode ? 'bg-primary' : 'bg-secondary-200'
                )}
              >
                <div className={cn(
                  'w-5 h-5 rounded-full bg-white shadow-soft absolute top-1 transition-transform',
                  darkMode ? 'translate-x-8' : 'translate-x-1'
                )} />
              </button>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <p className="font-medium">{t('settings.notifications')}</p>
            </div>
            <div className="space-y-3">
              {notifications.map(n => (
                <div key={n.id} className="flex items-center justify-between">
                  <span className="text-sm">{n.label}</span>
                  <button
                    className={cn(
                      'w-10 h-5 rounded-full transition-colors',
                      n.enabled ? 'bg-primary' : 'bg-secondary-200'
                    )}
                  >
                    <div className={cn(
                      'w-4 h-4 rounded-full bg-white shadow-soft transform transition-transform mt-0.5',
                      n.enabled ? 'translate-x-5' : 'translate-x-0.5'
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Change Password */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-primary" />
              <p className="font-medium">{t('settings.changePassword')}</p>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
              {(['current', 'new', 'confirm'] as const).map(field => (
                <div key={field} className="relative">
                  <Input
                    label={field === 'current' ? 'Current Password' : field === 'new' ? 'New Password' : 'Confirm Password'}
                    type={showPwd[field] ? 'text' : 'password'}
                    value={passwords[field]}
                    onChange={(e) => setPasswords(prev => ({ ...prev, [field]: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(prev => ({ ...prev, [field]: !prev[field] }))}
                    className="absolute right-3 top-[38px] text-secondary-400"
                  >
                    {showPwd[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              ))}
              <Button type="submit" disabled={!passwords.current || !passwords.new || !passwords.confirm}>
                <Save className="w-4 h-4" /> {t('common.save')}
              </Button>
            </form>
          </Card>

          {/* Delete Account */}
          <Card className="p-6 border-red-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-600">{t('settings.deleteAccount')}</p>
                  <p className="text-sm text-secondary-400">Permanently delete your account and all data</p>
                </div>
              </div>
              <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                {t('common.delete')}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title={t('settings.deleteAccount')} size="sm">
        <div className="space-y-4 text-center">
          <Trash2 className="w-12 h-12 mx-auto text-red-500" />
          <p className="text-sm text-secondary-600">Are you sure you want to delete your account? This action cannot be undone.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>{t('common.cancel')}</Button>
            <Button variant="danger">Yes, Delete My Account</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
