
import React, { useState } from 'react';
import { 
  User as UserIcon, 
  BarChart3, 
  Settings, 
  Sparkles, 
  Info, 
  ShieldCheck, 
  BookMarked, 
  CalendarDays,
  LogOut,
  ChevronRight,
  BookOpen,
  History,
  FileCode,
  Trophy,
  MessageSquare
} from 'lucide-react';
import { User } from '../types';
import { BRANDING_FOOTER } from '../constants';

interface UserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onLogout: () => void;
  onSettings: (subView?: 'MAIN' | 'ABOUT' | 'AI' | 'PRIVACY') => void;
  onProfile: () => void;
  onSelectResource: (id: string) => void;
}

const UserDrawer: React.FC<UserDrawerProps> = ({ 
  isOpen, onClose, user, onLogout, onSettings, onProfile, onSelectResource 
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const shortcuts = [
    { id: 'Edu AI', icon: <Sparkles className="w-4 h-4" />, label: 'AI Tutor' },
    { id: 'Library', icon: <BookOpen className="w-4 h-4" />, label: 'Library' },
    { id: 'PYQs', icon: <History className="w-4 h-4" />, label: 'PYQs' },
    { id: 'Papers', icon: <FileCode className="w-4 h-4" />, label: 'Papers' },
    { id: 'Series', icon: <Trophy className="w-4 h-4" />, label: 'Series' },
    { id: 'Doubts', icon: <MessageSquare className="w-4 h-4" />, label: 'Doubts' },
  ];

  const handleAction = (type: 'resource' | 'settings' | 'profile', val?: any) => {
    onClose();
    setShowLogoutConfirm(false);
    setTimeout(() => {
      if (type === 'resource') onSelectResource(val);
      if (type === 'settings') onSettings(val);
      if (type === 'profile') onProfile();
    }, 100);
  };

  return (
    <>
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity z-[100] ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => { onClose(); setShowLogoutConfirm(false); }}
      />

      <div 
        className={`absolute top-0 bottom-0 left-0 w-[75%] max-w-[280px] bg-white z-[110] transform transition-transform duration-300 ease-out shadow-2xl border-r border-slate-100 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button 
          onClick={() => handleAction('profile')}
          className="p-6 bg-white border-b border-slate-100 shrink-0 flex items-center gap-4 text-left active:bg-slate-50 transition-colors"
        >
          <div className="w-12 h-12 bg-slate-50 text-slate-900 border-slate-100 rounded-2xl flex items-center justify-center text-xl font-black shadow-sm border shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-black text-slate-900 truncate uppercase tracking-tight leading-none">{user.name}</h3>
            <p className="text-[10px] text-slate-500 truncate mt-1 lowercase opacity-80">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-blue-600 bg-blue-50 border-blue-100 text-[7px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border">
                {user.role}
              </p>
              <ChevronRight className="w-3 h-3 text-slate-300" />
            </div>
          </div>
        </button>

        <div className="flex-1 overflow-y-auto scroll-hide p-4 space-y-6">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 mb-3">Shortcuts</p>
            <div className="grid grid-cols-3 gap-2">
              {shortcuts.map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => handleAction('resource', item.id)}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-100 active:bg-slate-100 active:scale-90 transition-all"
                >
                  <span className="text-slate-600">{item.icon}</span>
                  <span className="text-[6px] font-black uppercase tracking-tighter text-slate-500">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Management</p>
            <DrawerItem icon={<UserIcon className="w-4 h-4" />} label="My Profile" onClick={() => handleAction('profile')} />
            <DrawerItem icon={<BarChart3 className="w-4 h-4" />} label="Test Results" onClick={() => handleAction('resource', 'Results')} />
            <DrawerItem icon={<Settings className="w-4 h-4" />} label="Settings" onClick={() => handleAction('settings', 'MAIN')} />
          </div>

          <div className="h-px bg-slate-100 mx-2 my-1" />

          <div className="space-y-1">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Support</p>
             <DrawerItem icon={<Sparkles className="w-4 h-4" />} label="AI Config" onClick={() => handleAction('settings', 'AI')} />
             <DrawerItem icon={<Info className="w-4 h-4" />} label="About Us" onClick={() => handleAction('settings', 'ABOUT')} />
             <DrawerItem icon={<ShieldCheck className="w-4 h-4" />} label="Privacy" onClick={() => handleAction('settings', 'PRIVACY')} />
          </div>

          <div className="space-y-1">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">Academic</p>
             <DrawerItem icon={<BookMarked className="w-4 h-4" />} label="Modules" onClick={() => handleAction('resource', 'Notes')} />
             <DrawerItem icon={<CalendarDays className="w-4 h-4" />} label="Schedules" />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
          {!showLogoutConfirm ? (
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-between px-4 py-3 text-rose-600 bg-white border border-rose-100 rounded-xl transition-all active:scale-95 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4" />
                <span className="text-[9px] uppercase font-black tracking-widest">Sign Out</span>
              </div>
              <ChevronRight className="w-3 h-3 opacity-30" />
            </button>
          ) : (
            <div className="bg-white border border-rose-200 p-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2">
               <p className="text-[8px] font-black text-rose-600 uppercase tracking-widest text-center mb-3">Logout Session?</p>
               <div className="flex gap-2">
                  <button onClick={onLogout} className="flex-1 bg-rose-600 text-white py-2 rounded-lg font-black text-[8px] uppercase tracking-widest active:scale-95 transition-all shadow-md shadow-rose-200">Yes</button>
                  <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 bg-slate-100 text-slate-500 py-2 rounded-lg font-black text-[8px] uppercase tracking-widest active:scale-95 transition-all">No</button>
               </div>
            </div>
          )}
          <div className="text-center mt-3">
            <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.3em]">{BRANDING_FOOTER}</p>
          </div>
        </div>
      </div>
    </>
  );
};

const DrawerItem: React.FC<{ icon: React.ReactNode; label: string; onClick?: () => void }> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all active:scale-[0.98] mb-0.5 text-left bg-white hover:bg-slate-50 text-slate-600 border border-slate-100 shadow-sm"
  >
    <div className="flex items-center gap-3">
      <span className="text-slate-400">{icon}</span>
      <span className="text-[9px] uppercase font-black tracking-tight text-slate-900">{label}</span>
    </div>
    <ChevronRight className="w-3 h-3 text-slate-300" />
  </button>
);

export default UserDrawer;
