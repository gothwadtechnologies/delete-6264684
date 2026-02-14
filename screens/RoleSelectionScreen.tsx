
import React from 'react';
import { UserRole, GlobalSettings } from '../types';
import { APP_NAME, BRANDING_FOOTER } from '../constants';

interface RoleSelectionScreenProps {
  onSelectRole: (role: UserRole) => void;
  settings: GlobalSettings;
}

const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ onSelectRole, settings }) => {
  const roles = [
    { id: UserRole.STUDENT, title: 'Student', icon: '👨‍🎓', desc: 'Learning Grid', color: 'bg-[#e11d48]', lightColor: 'bg-rose-50', textColor: 'text-[#e11d48]' },
    { id: UserRole.PARENT, title: 'Parent', icon: '👪', desc: 'Sync Progress', color: 'bg-[#2563eb]', lightColor: 'bg-blue-50', textColor: 'text-[#2563eb]' },
    { id: UserRole.ADMIN, title: 'Admin', icon: '🛡️', desc: 'Core Controller', color: 'bg-gray-900', lightColor: 'bg-gray-100', textColor: 'text-gray-900' },
  ];

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      {/* Premium Native Header */}
      <header className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2563eb] rounded-lg flex items-center justify-center text-white font-black text-sm">
            {settings.logoEmoji}
          </div>
          <div>
            <h1 className="text-xs font-black tracking-widest uppercase text-gray-900 leading-none">{APP_NAME}</h1>
            <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mt-1">Gateway</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[7px] font-black text-emerald-700 uppercase tracking-widest">Server Live</span>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto scroll-hide">
        <div className="pt-2">
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Who Are You?</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-2">Identify yourself to continue</p>
        </div>

        <div className="space-y-4">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              className="w-full bg-white border border-gray-100 shadow-sm rounded-[2rem] p-5 flex items-center gap-4 transition-all active:scale-[0.97] group relative overflow-hidden"
            >
              <div className={`w-14 h-14 rounded-2xl ${role.lightColor} ${role.textColor} flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform`}>
                {role.icon}
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-black uppercase tracking-tight text-lg text-gray-900 leading-none">{role.title}</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">{role.desc}</p>
              </div>
              <div className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest ${role.color} text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity`}>
                Select
              </div>
            </button>
          ))}
        </div>

        {/* Security Indicator */}
        <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center justify-center gap-3">
           <span className="text-gray-400">🔒</span>
           <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
             SSL SECURED • END-TO-END ENCRYPTED
           </p>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-auto p-8 flex flex-col items-center shrink-0">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-[0.4em] leading-none mb-1">{APP_NAME}</h1>
          <div className="h-0.5 w-12 bg-[#2563eb] rounded-full opacity-30"></div>
        </div>
        
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-[10px] font-black text-black uppercase tracking-[0.4em] flex items-center gap-1.5">
            <span className="text-[#2563eb] text-xs">©</span> {BRANDING_FOOTER}
          </p>
          <div className="flex items-center gap-2 opacity-5">
            <div className="h-[0.5px] w-6 bg-black"></div>
            <span className="text-[6px] font-bold uppercase tracking-widest text-black">SECURE INFRASTRUCTURE</span>
            <div className="h-[0.5px] w-6 bg-black"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionScreen;
