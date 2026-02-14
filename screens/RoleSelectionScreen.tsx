
import React from 'react';
import { UserRole, GlobalSettings } from '../types';

interface RoleSelectionScreenProps {
  onSelectRole: (role: UserRole) => void;
  settings: GlobalSettings;
}

const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ onSelectRole, settings }) => {
  const roles = [
    { id: UserRole.STUDENT, title: 'Student', icon: '👨‍🎓', desc: 'View your classes and tests' },
    { id: UserRole.PARENT, title: 'Parent', icon: '👪', desc: 'Track your child\'s progress' },
    { id: UserRole.ADMIN, title: 'Admin', icon: '🛡️', desc: 'Manage institution resources' },
  ];

  return (
    <div className="flex-1 bg-white p-8 flex flex-col overflow-y-auto scroll-hide">
      <div className="mt-2 mb-10 text-center">
        <h2 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Welcome to {settings.appName}</h2>
        <p className="text-gray-400 text-sm mt-2">Please select your role to continue</p>
      </div>

      <div className="space-y-4">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => onSelectRole(role.id)}
            className="w-full bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 p-5 rounded-2xl flex items-center gap-5 transition-all active:scale-[0.98] text-left group"
          >
            <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
              {role.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">{role.title}</h3>
              <p className="text-xs text-gray-500">{role.desc}</p>
            </div>
            <div className="ml-auto text-gray-300 group-hover:text-blue-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleSelectionScreen;
