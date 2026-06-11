import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={`flex-1 ${isHome ? '' : 'pt-16'}`}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Outlet />
        </motion.div>
      </main>
      <Footer />

      {/* AI Assistant Floating Button */}
      <button
        onClick={() => navigate('/ai-assistant')}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-primary to-primary-700 text-white rounded-2xl shadow-soft-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
}
