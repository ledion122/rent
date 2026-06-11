import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Bell, User, Settings, LogOut, LayoutDashboard, Calendar, Car, Search, Plus, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Avatar } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { label: t('nav.home'), path: '/', icon: Car },
    { label: t('nav.search'), path: '/search', icon: Search },
    { label: t('nav.list'), path: '/list-vehicle', icon: Plus },
  ];

  const dropdownItems = [
    { label: 'Paneli im', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Paneli i Pronarit', path: '/owner-dashboard', icon: Car },
    { label: t('nav.settings'), path: '/settings', icon: Settings },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="glass border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-700 rounded-lg flex items-center justify-center">
                <Car className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-secondary-900">
                Rent<span className="text-primary">Kosova</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="flex items-center gap-1.5 text-sm font-medium text-secondary-600 hover:text-secondary-900 transition-colors"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === 'sq' ? 'en' : 'sq')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-secondary-600 hover:bg-secondary-100 transition-colors"
              >
                <Globe className="w-4 h-4" />
                {language === 'sq' ? 'EN' : 'SQ'}
              </button>

              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-secondary-100 transition-colors"
                  >
                    <Avatar src={user.profilePhoto} alt={`${user.firstName} ${user.lastName}`} size="sm" />
                  </button>

                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, translateY: 8, scale: 0.95 }}
                        animate={{ opacity: 1, translateY: 0, scale: 1 }}
                        exit={{ opacity: 0, translateY: 8, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-soft-lg border border-gray-100 py-2 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-secondary-500">{user.email}</p>
                        </div>
                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            {t('nav.admin')}
                          </Link>
                        )}
                        {dropdownItems.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                          >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                          </Link>
                        ))}
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                          >
                            <LogOut className="w-4 h-4" />
                            {t('nav.logout')}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/login" className="btn-ghost text-sm">{t('nav.login')}</Link>
                  <Link to="/register" className="btn-primary text-sm">{t('nav.register')}</Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-secondary-100 transition-colors"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -10 }}
            className="md:hidden glass border-b border-gray-100/50"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-secondary-700 hover:bg-secondary-100 transition-colors"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
              {!user && (
                <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                  <Link to="/login" onClick={() => setIsOpen(false)} className="btn-primary text-sm justify-center">
                    {t('nav.login')}
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="btn-outline text-sm justify-center">
                    {t('nav.register')}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
