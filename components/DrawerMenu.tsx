
import React from 'react';
import { User, UserRole } from '../types';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onLogout: () => void;
  onSettings: () => void;
  onProfile: () => void;
}

const DrawerMenu: React.FC<DrawerMenuProps> = ({ isOpen, onClose, user, onLogout, onSettings, onProfile }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/40 transition-opacity z-40 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`absolute top-0 bottom-0 left-0 w-4/5 bg-white z-50 transform transition-transform duration-300 ease-out shadow-2xl flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 bg-white border-b border-gray-100">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 text-white text-3xl font-bold shadow-lg">
            {user.name.charAt(0)}
          </div>
          <h3 className="text-xl font-black text-gray-900 truncate">{user.name}</h3>
          <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest mt-1">{user.role}</p>
        </div>

        <div className="flex-1 py-4 overflow-y-auto scroll-hide">
          {/* Account Section */}
          <div className="px-4 mb-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Account</p>
            <DrawerItem icon="👤" label="My Profile" onClick={onProfile} />
            <DrawerItem icon="⚙️" label="Settings" onClick={onSettings} />
          </div>

          <div className="h-px bg-gray-100 mx-6 my-4" />

          {/* Actions Section */}
          <div className="px-4">
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Actions</p>
            {user.role === UserRole.ADMIN && (
              <>
                <DrawerItem icon="📚" label="Manage Batches" />
                <DrawerItem icon="👨‍🎓" label="Manage Students" />
                <DrawerItem icon="➕" label="Create Test" />
                <DrawerItem icon="📊" label="Reports" />
              </>
            )}
            {user.role === UserRole.STUDENT && (
              <>
                <DrawerItem icon="📚" label="My Batches" />
                <DrawerItem icon="📈" label="My Progress" />
                <DrawerItem icon="📢" label="Announcements" />
              </>
            )}
             {user.role === UserRole.PARENT && (
              <>
                <DrawerItem icon="👶" label="Child's Progress" />
              </>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-colors"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

const DrawerItem: React.FC<{ icon: string; label: string; onClick?: () => void }> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-4 px-3 py-3 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 active:bg-blue-50 transition-colors mb-1 text-left"
  >
    <span className="text-xl w-6 flex justify-center">{icon}</span>
    <span className="text-sm">{label}</span>
  </button>
);

export default DrawerMenu;
