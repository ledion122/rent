import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Car, Building2, BarChart3, LogOut, ChevronLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { label: t('admin.title'), path: '/admin', icon: LayoutDashboard },
    { label: t('admin.users'), path: '/admin/users', icon: Users },
    { label: t('admin.vehicles'), path: '/admin/vehicles', icon: Car },
    { label: t('admin.businesses'), path: '/admin/businesses', icon: Building2 },
    { label: t('admin.analytics'), path: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-secondary-50 flex">
      {/* Sidebar */}
      <aside className={cn(
        'bg-secondary-900 text-white flex flex-col transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}>
        <div className="p-4 flex items-center justify-between border-b border-secondary-800">
          {!collapsed && (
            <Link to="/" className="font-bold text-lg">
              <span className="text-primary">RK</span> Admin
            </Link>
          )}
          {collapsed && (
            <Link to="/" className="font-bold text-lg text-primary mx-auto">RK</Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-secondary-800 transition-colors"
          >
            <ChevronLeft className={cn('w-4 h-4 transition-transform', collapsed && 'rotate-180')} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive ? 'bg-primary text-white' : 'text-secondary-400 hover:bg-secondary-800 hover:text-white'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-secondary-800">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-secondary-400 hover:bg-secondary-800 hover:text-red-400 transition-all w-full"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && 'Dalje'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-secondary-900">
                {navItems.find(i => i.path === location.pathname)?.label || t('admin.title')}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-secondary-500">
                {user?.firstName} {user?.lastName}
              </span>
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary text-sm font-semibold">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
