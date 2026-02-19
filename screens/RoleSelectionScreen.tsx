
import React, { useState } from 'react';
import { UserRole, GlobalSettings } from '../types';
import { APP_NAME, BRANDING_FOOTER } from '../constants';

interface RoleSelectionScreenProps {
  onSelectRole: (role: UserRole) => void;
  settings: GlobalSettings;
}

const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ onSelectRole, settings }) => {
  const [isInfoMenuOpen, setIsInfoMenuOpen] = useState(false);

  const roles = [
    { id: UserRole.STUDENT, title: 'Student', icon: '👨‍🎓', desc: 'Access your learning portal' },
    { id: UserRole.PARENT, title: 'Parent', icon: '👪', desc: "View your child's progress" },
  ];

  const handleAdminLoginClick = () => {
    onSelectRole(UserRole.ADMIN);
    setIsInfoMenuOpen(false);
  };

  return (
    <div className="font-sans bg-gray-50 flex flex-col h-full">
      
      <header className="px-4 py-3 border-b border-gray-200 flex items-center justify-between relative shrink-0">
        <button className="p-2 rounded-full hover:bg-gray-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900">Classes X</h1>
          <p className="text-[10px] font-medium text-gray-500">Gothwad Technologies</p>
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsInfoMenuOpen(prev => !prev)} 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          {isInfoMenuOpen && (
            <div 
              className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 animate-in fade-in zoom-in-95"
              onMouseLeave={() => setIsInfoMenuOpen(false)}
            >
              <button 
                onClick={handleAdminLoginClick} 
                className="w-full text-left px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Administrator Login
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="overflow-y-auto flex-grow">
        <div className="p-6 space-y-5">
          <div className="pt-4 text-left">
            <h2 className="text-2xl font-bold text-gray-900">Select Your Role</h2>
            <p className="text-sm text-gray-500 mt-1">Please choose how you'd like to sign in.</p>
          </div>

          <div className="space-y-4 pt-2">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => onSelectRole(role.id)}
                className="w-full bg-white border border-gray-200 shadow-sm rounded-2xl p-4 flex items-center gap-4 transition-all duration-200 active:scale-[0.98] hover:border-blue-500 hover:shadow-md"
              >
                <div className={`w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl shrink-0`}>
                  {role.icon}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-base text-gray-800">{role.title}</h3>
                  <p className="text-sm text-gray-500">{role.desc}</p>
                </div>
                <div className="text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer with updated black background badge */}
      <footer className="p-5 text-center shrink-0">
        <span className="inline-block bg-gray-900 text-gray-100 text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-full">
        © 2026 {BRANDING_FOOTER}
        </span>
      </footer>
    </div>
  );
};

export default RoleSelectionScreen;
