
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Menu, 
  Search, 
  Bell, 
  LayoutGrid, 
  Video, 
  FileText, 
  CreditCard, 
  CalendarCheck,
  Zap,
  X
} from 'lucide-react';
import { User, TabName, GlobalSettings, Batch, UserRole } from '../types.ts';
import FeesScreen from '../screens/tabs/FeesScreen.tsx';
import ClassesScreen from '../screens/tabs/ClassesScreen.tsx';
import TestsScreen from '../screens/tabs/TestsScreen.tsx';
import AttendanceScreen from '../screens/tabs/AttendanceScreen.tsx';
import BatchesScreen from '../screens/tabs/BatchesScreen.tsx';
import { APP_NAME, BRANDING_FOOTER } from '../constants.ts';

// Resource Screens
import LibraryScreen from '../screens/resources/LibraryScreen.tsx';
import PYQScreen from '../screens/resources/PYQScreen.tsx';
import EduAIScreen from '../screens/resources/EduAIScreen.tsx';
import SamplePaperScreen from '../screens/resources/SamplePaperScreen.tsx';
import TestSeriesScreen from '../screens/resources/TestSeriesScreen.tsx';

interface UserNavigatorProps {
  user: User;
  onOpenDrawer: () => void;
  settings: GlobalSettings;
  onSelectBatch: (batch: Batch) => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  forcedResource?: string | null;
  onTabPress: () => void;
  onSelectResource: (id: string | null) => void;
}

const UserNavigator: React.FC<UserNavigatorProps> = ({ 
  user, 
  onOpenDrawer, 
  settings, 
  onSelectBatch, 
  onOpenNotifications, 
  onOpenProfile, 
  onLogout,
  forcedResource,
  onTabPress,
  onSelectResource
}) => {
  const [activeTab, setActiveTab] = useState<TabName>('Batches');
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const renderContent = () => {
    if (forcedResource) {
      switch (forcedResource) {
        case 'Library': return <LibraryScreen />;
        case 'PYQs': return <PYQScreen />;
        case 'Edu AI': return <EduAIScreen />;
        case 'Papers': return <SamplePaperScreen />;
        case 'Series': return <TestSeriesScreen />;
        case 'Notes': return <div className="p-12 text-center text-slate-500 font-black uppercase text-[10px] tracking-[0.2em] leading-loose">Notes Repository<br/>Coming Soon</div>;
        case 'Results': return <div className="p-12 text-center text-slate-500 font-black uppercase text-[10px] tracking-[0.2em] leading-loose">Performance Results Grid<br/>Coming Soon</div>;
        default: break;
      }
    }
    switch (activeTab) {
      case 'Batches': return <BatchesScreen user={user} onSelectBatch={onSelectBatch} searchQuery={searchQuery} />;
      case 'Classes': return <ClassesScreen user={user} />;
      case 'Tests': return <TestsScreen user={user} />;
      case 'Fees': return <FeesScreen user={user} />;
      case 'Attendance': return <AttendanceScreen user={user} />;
      default: return null;
    }
  };

  const mainTabs: { name: TabName; icon: React.ReactNode }[] = [
    { name: 'Batches', icon: <LayoutGrid className="w-6 h-6" /> },
    { name: 'Classes', icon: <Video className="w-6 h-6" /> },
    { name: 'Tests', icon: <FileText className="w-6 h-6" /> },
    { name: 'Fees', icon: <CreditCard className="w-6 h-6" /> },
    { name: 'Attendance', icon: <CalendarCheck className="w-6 h-6" /> },
  ];

  const visibleResources = [
    { id: 'Library', icon: '📖', label: 'LIB' },
    { id: 'PYQs', icon: '📜', label: 'PYQ' },
    { id: 'Edu AI', icon: '✨', label: 'AI' },
    { id: 'Papers', icon: '📄', label: 'PAPER' },
    { id: 'Series', icon: '🎯', label: 'SERIES' },
  ];

  const handleTabClick = (tabName: TabName) => {
    setActiveTab(tabName);
    onTabPress();
    setIsMoreMenuOpen(false);
    setIsSearchActive(false);
  };

  const handleResourceClick = (id: string) => {
    const nextVal = forcedResource === id ? null : id;
    onSelectResource(nextVal);
    setIsMoreMenuOpen(false);
    setIsSearchActive(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white relative">
      <header className="bg-white px-4 py-3 border-b border-slate-100 shrink-0 z-[60] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onOpenDrawer} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center transition-all active:scale-90 border border-slate-100 text-slate-600">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-[14px] font-black tracking-tight uppercase text-slate-900 leading-none">{APP_NAME}</h1>
              <p className="text-[7px] font-bold text-blue-600 uppercase tracking-[0.2em] mt-0.5">Student Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setIsSearchActive(!isSearchActive); if(isSearchActive) setSearchQuery(''); }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 ${isSearchActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}
            >
              {isSearchActive ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>
            <button onClick={onOpenNotifications} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-lg active:scale-90 transition-all relative border border-slate-100 text-slate-600">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
            <button onClick={onOpenProfile} className="w-10 h-10 rounded-xl bg-slate-50 text-slate-900 font-black text-xs shadow-md active:scale-90 transition-all flex items-center justify-center border border-slate-200 overflow-hidden">
               {user.name.charAt(0)}
            </button>
          </div>
        </div>

        {isSearchActive && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-1"
          >
            <div className="relative">
              <input 
                autoFocus
                type="text"
                placeholder="Search Batches, Exams..."
                className="w-full bg-slate-50 border border-slate-100 px-4 py-3.5 rounded-xl text-xs font-black text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        )}
      </header>

      <div className="bg-white border-b border-slate-100 shrink-0 z-50">
        <div className="flex items-center justify-between px-4 py-3 gap-2">
          {visibleResources.map((res) => (
            <button 
              key={res.id} 
              onClick={() => handleResourceClick(res.id)}
              className={`flex flex-col items-center justify-center flex-1 py-3 rounded-2xl border transition-all relative ${
                forcedResource === res.id ? 'bg-blue-600 border-blue-500 text-white shadow-lg scale-105 z-10' : 'bg-slate-50 border-slate-100 text-slate-400'
              }`}
            >
              <span className="text-lg mb-1">{res.icon}</span>
              <span className={`text-[7px] font-black uppercase tracking-tight ${forcedResource === res.id ? 'text-white' : 'text-slate-500'}`}>
                {res.label}
              </span>
            </button>
          ))}
          <button 
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={`flex flex-col items-center justify-center flex-1 py-3 rounded-2xl border transition-all relative ${
              isMoreMenuOpen ? 'bg-slate-900 border-slate-800 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400'
            }`}
          >
            <Zap className="w-5 h-5 mb-1" />
            <span className={`text-[7px] font-black uppercase tracking-tight ${isMoreMenuOpen ? 'text-white' : 'text-slate-500'}`}>
              MORE
            </span>
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto scroll-hide bg-white relative">
        <div className="pb-32">
          {renderContent()}
        </div>
      </main>

      <div className="bg-white py-2 flex justify-center shrink-0 border-t border-slate-100">
         <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.5em]">© {BRANDING_FOOTER}</p>
      </div>

      <nav className="bg-white border-t border-slate-100 px-3 py-2 shrink-0 flex items-center justify-around z-[60] backdrop-blur-md">
        {mainTabs.map((tab) => (
          <button 
            key={tab.name} 
            onClick={() => handleTabClick(tab.name)} 
            className={`flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all relative ${
              (activeTab === tab.name && !forcedResource) ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            {(activeTab === tab.name && !forcedResource) && (
              <motion.div 
                layoutId="activeTabUser"
                className="absolute -top-2.5 w-8 h-1 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]"
              />
            )}
            <div className="mb-1">{tab.icon}</div>
            <span className="text-[7px] font-black uppercase tracking-[0.2em]">{tab.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};


export default UserNavigator;
