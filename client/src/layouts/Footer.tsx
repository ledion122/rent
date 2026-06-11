import { Link } from 'react-router-dom';
import { Car, Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t, language } = useLanguage();

  const quickLinks = [
    { label: t('footer.about'), path: '#' },
    { label: t('footer.contact'), path: '#' },
    { label: t('footer.faq'), path: '#' },
    { label: t('footer.terms'), path: '#' },
    { label: t('footer.privacy'), path: '#' },
  ];

  const categories = [
    { label: t('category.economy'), path: '/search?category=economy' },
    { label: t('category.compact'), path: '/search?category=compact' },
    { label: t('category.suv'), path: '/search?category=suv' },
    { label: t('category.luxury'), path: '/search?category=luxury' },
    { label: t('category.van'), path: '/search?category=van' },
  ];

  return (
    <footer className="bg-secondary-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-700 rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                Rent<span className="text-primary">Kosova</span>
              </span>
            </Link>
            <p className="text-secondary-400 text-sm leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-xl bg-secondary-800 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-secondary-800 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-secondary-800 flex items-center justify-center hover:bg-primary transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="text-secondary-400 text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.categories')}</h3>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat.label}>
                  <Link to={cat.path} className="text-secondary-400 text-sm hover:text-white transition-colors">
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-secondary-400 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                Prishtinë, Kosovë
              </li>
              <li className="flex items-center gap-2 text-secondary-400 text-sm">
                <Phone className="w-4 h-4 text-primary" />
                +383 44 000 000
              </li>
              <li className="flex items-center gap-2 text-secondary-400 text-sm">
                <Mail className="w-4 h-4 text-primary" />
                info@rentkosova.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-secondary-800 text-center">
          <p className="text-secondary-500 text-sm">
            &copy; {new Date().getFullYear()} RentKosova. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
