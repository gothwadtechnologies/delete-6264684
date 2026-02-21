
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Users, ShieldCheck, ChevronRight, Settings, Info } from 'lucide-react';
import { UserRole, GlobalSettings } from '../types';
import { BRANDING_FOOTER } from '../constants';

interface RoleSelectionScreenProps {
  onSelectRole: (role: UserRole) => void;
  settings: GlobalSettings;
}

const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({ onSelectRole, settings }) => {
  const [showAdmin, setShowAdmin] = useState(false);

  const roles = [
    { 
      id: UserRole.STUDENT, 
      title: 'Student', 
      icon: <GraduationCap className="w-7 h-7" />, 
      desc: 'Access your classes, tests & results', 
      color: 'bg-blue-600',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    { 
      id: UserRole.PARENT, 
      title: 'Parent', 
      icon: <Users className="w-7 h-7" />, 
      desc: 'Track attendance, fees & progress', 
      color: 'bg-emerald-600',
      lightColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    }
  ];

  const adminRole = { 
    id: UserRole.ADMIN, 
    title: 'Administrator', 
    icon: <ShieldCheck className="w-7 h-7" />, 
    desc: 'Manage batches, staff & students', 
    color: 'bg-slate-800',
    lightColor: 'bg-slate-100',
    textColor: 'text-slate-800'
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden font-sans">
      {/* Android Style Header */}
      <header className="px-4 pt-4 pb-2 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-600">
          <Settings className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col items-center">
          <span className="text-xs font-black tracking-[0.2em] text-blue-600 uppercase">
            {settings.appName}
          </span>
          <div className="h-0.5 w-4 bg-blue-600 rounded-full mt-0.5" />
        </div>

        <div className="relative">
          <button 
            onClick={() => setShowAdmin(!showAdmin)}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${showAdmin ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <Info className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {showAdmin && (
              <motion.button
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                onClick={() => onSelectRole(UserRole.ADMIN)}
                className="absolute right-0 mt-2 whitespace-nowrap bg-sky-100 text-sky-700 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-xl shadow-sky-200/50 border border-sky-200 active:scale-95 transition-all z-[60]"
              >
                Administrator Login
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="flex-1 px-6 pt-6 overflow-y-auto scroll-hide">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome back</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Choose your account type to sign in</p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {roles.map((role) => (
            <motion.button
              key={role.id}
              variants={itemVariants}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectRole(role.id)}
              className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 flex items-center gap-4 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 group"
            >
              <div className={`w-14 h-14 rounded-2xl ${role.lightColor} ${role.textColor} flex items-center justify-center shadow-sm shrink-0`}>
                {role.icon}
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-lg text-slate-900 leading-tight">{role.title}</h3>
                <p className="text-slate-500 text-[11px] mt-0.5 font-medium leading-relaxed">{role.desc}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>

      <footer className="p-8 flex flex-col items-center shrink-0 bg-white border-t border-slate-50">
        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
            {BRANDING_FOOTER}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">System Online</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RoleSelectionScreen;
