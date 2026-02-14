
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { APP_NAME, BRANDING_FOOTER } from '../constants';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onLogout: () => void;
  onSettings: (subView?: 'MAIN' | 'ABOUT' | 'AI' | 'PRIVACY') => void;
  onProfile: () => void;
  onSelectResource: (id: string) => void;
}

const DrawerMenu: React.FC<DrawerMenuProps> = ({ 
  isOpen, onClose, user, onLogout, onSettings, onProfile, onSelectResource 
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const shortcuts = [
    { id: 'Edu AI', icon: '✨', label: 'AI Tutor' },
    { id: 'Library', icon: '📖', label: 'Library' },
    { id: 'PYQs', icon: '📜', label: 'PYQs' },
    { id: 'Papers', icon: '📄', label: 'Papers' },
    { id: 'Series', icon: '🎯', label: 'Series' },
    { id: 'Doubts', icon: '🙋‍♂️', label: 'Doubts' },
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
        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity z-[100] ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => { onClose(); setShowLogoutConfirm(false); }}
      />

      <div 
        className={`absolute top-0 bottom-0 left-0 w-[85%] bg-white z-[110] transform transition-transform duration-300 ease-out shadow-2xl flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-8 bg-white border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => handleAction('profile')}
              className="w-16 h-16 bg-gray-900 rounded-[1.5rem] flex items-center justify-center text-white text-3xl font-black shadow-xl border-2 border-white active:scale-90 transition-transform"
            >
              {user.name.charAt(0)}
            </button>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-black text-gray-900 truncate uppercase tracking-tighter leading-none">{user.name}</h3>
              <p className="text-blue-600 text-[9px] font-black uppercase tracking-[0.2em] mt-2 bg-blue-50 px-3 py-1 rounded-full inline-block border border-blue-100">
                {user.role} Account
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scroll-hide p-6 space-y-8">
          <div>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-2 mb-4">Quick Shortcuts</p>
            <div className="grid grid-cols-3 gap-3">
              {shortcuts.map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => handleAction('resource', item.id)}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-gray-50 active:scale-90 transition-all border border-transparent active:border-gray-200"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-[7px] font-black uppercase tracking-tight text-gray-400">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-2 mb-2">Management</p>
            <DrawerItem icon="👤" label="My Profile" onClick={() => handleAction('profile')} />
            <DrawerItem icon="📊" label="Test Results" onClick={() => handleAction('resource', 'Results')} />
            {user.role === UserRole.ADMIN && (
              <DrawerItem 
                icon="👤+" 
                label="Add New Student" 
                onClick={() => handleAction('resource', 'Add Student')}
                variant="dark"
              />
            )}
            <DrawerItem icon="⚙️" label="App Settings" onClick={() => handleAction('settings', 'MAIN')} />
          </div>

          <div className="h-px bg-gray-100 mx-2 my-2" />

          <div className="space-y-1.5">
             <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-2 mb-2">Advanced</p>
             <DrawerItem icon="✨" label="AI Configuration" onClick={() => handleAction('settings', 'AI')} />
             <DrawerItem icon="🏛️" label="About Us" onClick={() => handleAction('settings', 'ABOUT')} />
             <DrawerItem icon="⚖️" label="Privacy Policy" onClick={() => handleAction('settings', 'PRIVACY')} />
          </div>

          <div className="space-y-1.5">
             <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest px-2 mb-2">Courseware</p>
             <DrawerItem icon="📚" label="Digital Modules" onClick={() => handleAction('resource', 'Notes')} />
             <DrawerItem icon="📋" label="Batch Schedules" />
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50 shrink-0">
          {!showLogoutConfirm ? (
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-between px-5 py-4 text-rose-600 font-bold rounded-2xl bg-white border border-rose-50 mb-4 transition-all active:scale-95 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <span className="text-lg">🚪</span>
                <span className="text-[10px] uppercase font-black tracking-widest">Sign Out</span>
              </div>
              <svg className="w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
            </button>
          ) : (
            <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-lg animate-in fade-in slide-in-from-bottom-2 mb-4">
               <p className="text-[9px] font-black text-gray-900 uppercase tracking-widest text-center mb-4">Confirm Logout?</p>
               <div className="flex gap-2">
                  <button onClick={onLogout} className="flex-1 bg-rose-600 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all shadow-md shadow-rose-100">Yes</button>
                  <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 bg-gray-100 text-gray-500 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all">No</button>
               </div>
            </div>
          )}
          <div className="text-center">
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.4em]">{BRANDING_FOOTER}</p>
          </div>
        </div>
      </div>
    </>
  );
};

const DrawerItem: React.FC<{ icon: string; label: string; onClick?: () => void, variant?: 'default' | 'dark' }> = ({ icon, label, onClick, variant = 'default' }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all active:scale-[0.98] mb-1 text-left ${
      variant === 'dark' ? 'bg-gray-900 text-white shadow-lg' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-50 shadow-sm'
    }`}
  >
    <div className="flex items-center gap-4">
      <span className={`text-xl w-6 flex justify-center`}>{icon}</span>
      <span className={`text-[10px] uppercase font-black tracking-tight ${variant === 'dark' ? 'text-white' : 'text-gray-900'}`}>{label}</span>
    </div>
    <svg className={`w-3.5 h-3.5 ${variant === 'dark' ? 'text-white/40' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
    </svg>
  </button>
);

export default DrawerMenu;
