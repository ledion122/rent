import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Send, ChevronLeft, Bot, User, Sparkles, Calendar, Car, HelpCircle, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

const quickActions = [
  { icon: Calendar, label: 'ai.booking', action: 'Dua të bëj një rezervim' },
  { icon: Car, label: 'ai.listing', action: 'Dua të listoj makinën time' },
  { icon: HelpCircle, label: 'ai.faq', action: 'Pyetje të shpeshta' },
];

const botResponses: Record<string, string> = {
  'pershendetje': 'Përshëndetje! Si mund t\'ju ndihmoj sot?',
  'faleminderit': 'Ju lutem! A ka diçka tjetër me të cilën mund t\'ju ndihmoj?',
  'default': 'Faleminderit për mesazhin. Një nga ekipi ynë do t\'ju kontaktojë së shpejti. Ndërkohë, mund të shfletoni faqen tonë për më shumë informacion.',
};

export default function AIAssistant() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: t('ai.greeting'), sender: 'bot', timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const lower = userMessage.toLowerCase();
    for (const [key, response] of Object.entries(botResponses)) {
      if (lower.includes(key)) return response;
    }
    return botResponses.default;
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(input),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    }, 800);
  };

  const handleQuickAction = (action: string) => {
    const userMsg: Message = { id: Date.now().toString(), text: action, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const response = action.includes('rezervim')
        ? 'Sigurisht! Mund të shfletoni makinat tona duke klikuar butonin "Kërko" në menu, ose mund të shkoni direkt në faqen e kërkimit.'
        : action.includes('listoj')
        ? 'Shkëlqyeshëm! Për të listuar makinën tuaj, fillimisht duhet të regjistroheni dhe pastaj të klikoni "Listo Makinën" në menu.'
        : 'Këtu janë disa pyetje të shpeshta:\n\n1. Si të rezervoj një makinë?\n2. Si të listoj makinën time?\n3. Cilat janë metodat e pagesës?\n4. Si të kontaktoj pronarin?';
      
      const botMsg: Message = { id: (Date.now() + 1).toString(), text: response, sender: 'bot', timestamp: new Date() };
      setMessages(prev => [...prev, botMsg]);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-secondary-100 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-700 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold">{t('ai.title')}</h1>
            <p className="text-xs text-secondary-400">Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 overflow-auto">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 mb-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
              msg.sender === 'bot' ? 'bg-primary-100' : 'bg-accent-100'
            }`}>
              {msg.sender === 'bot' ? (
                <Bot className="w-4 h-4 text-primary" />
              ) : (
                <User className="w-4 h-4 text-accent" />
              )}
            </div>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              msg.sender === 'bot'
                ? 'bg-white border border-gray-100 text-secondary-700'
                : 'bg-primary text-white'
            }`}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        
        {/* Quick Actions (only show at start) */}
        {messages.length === 1 && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action.action)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-gray-100 hover:border-primary/30 hover:shadow-soft-md transition-all"
              >
                <action.icon className="w-6 h-6 text-primary" />
                <span className="text-xs text-center font-medium text-secondary-600">{t(action.label as any)}</span>
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('ai.placeholder')}
              className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
