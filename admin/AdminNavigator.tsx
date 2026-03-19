
import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  X,
  BookOpen,
  History,
  Sparkles,
  FileCode,
  Trophy,
  Users,
  User as UserIcon,
  ChevronLeft
} from 'lucide-react';
import { User, TabName, GlobalSettings, Batch, UserRole, Test } from '../common/types.ts';
import FeesScreen from '../common/screens/tabs/FeesScreen.tsx';
import ClassesScreen from '../common/screens/tabs/ClassesScreen.tsx';
import TestsScreen from '../common/screens/tabs/TestsScreen.tsx';
import AttendanceScreen from '../common/screens/tabs/AttendanceScreen.tsx';
import BatchesScreen from '../common/screens/tabs/BatchesScreen.tsx';
import StudentsScreen from '../common/screens/tabs/StudentsScreen.tsx';
import ResultsScreen from '../common/screens/tabs/ResultsScreen.tsx';
import { APP_NAME, BRANDING_FOOTER, APP_LOGO } from '../common/constants.ts';

// Resource Screens
import LibraryScreen from '../common/screens/resources/LibraryScreen.tsx';
import PYQScreen from '../common/screens/resources/PYQScreen.tsx';
import EduAIScreen from '../common/screens/resources/EduAIScreen.tsx';
import SamplePaperScreen from '../common/screens/resources/SamplePaperScreen.tsx';
import TestSeriesScreen from '../common/screens/resources/TestSeriesScreen.tsx';

interface AdminNavigatorProps {
  user: User;
  onOpenDrawer: () => void;
  settings: GlobalSettings;
  onSelectBatch: (batch: Batch) => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  forcedResource?: string | null;
  onTabPress: (tab: TabName) => void;
  onSelectResource: (id: string | null) => void;
  isAdminViewMode: boolean;
  onToggleViewMode: () => void;
  onSelectTest: (test: Test, screen: 'TEST_BUILDER' | 'TEST_TAKER') => void;
  activeTab: TabName;
}

const AdminNavigator: React.FC<AdminNavigatorProps> = ({ 
  user, 
  onOpenDrawer, 
  settings, 
  onSelectBatch, 
  onOpenNotifications, 
  onOpenProfile, 
  onLogout,
  forcedResource,
  onTabPress,
  onSelectResource,
  isAdminViewMode,
  onToggleViewMode,
  onSelectTest,
  activeTab
}) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const renderContent = () => {
    if (forcedResource) {
      switch (forcedResource) {
        case 'Library': return <LibraryScreen />;
        case 'PYQs': return <PYQScreen />;
        case 'Edu AI': return <EduAIScreen settings={settings} />;
        case 'Papers': return <SamplePaperScreen />;
        case 'Series': return <TestSeriesScreen />;
        case 'Notes': return <div className="p-12 text-center text-slate-500 font-black uppercase text-[10px] tracking-[0.2em] leading-loose">Notes Repository<br/>Coming Soon</div>;
        case 'Results': return <ResultsScreen user={user} />;
        case 'Add Student': return <div className="p-12 text-center text-slate-500 font-black uppercase text-[10px] tracking-[0.2em] leading-loose">Management: Add Student<br/>Coming Soon</div>;
        default: break;
      }
    }
    switch (activeTab) {
      case 'Batches': return <BatchesScreen user={user} onSelectBatch={onSelectBatch} searchQuery={searchQuery} />;
      case 'Classes': return <ClassesScreen user={user} />;
      case 'Students': return <StudentsScreen user={user} />;
      case 'Tests': return <TestsScreen user={user} onSelectTest={onSelectTest} />;
      case 'Fees': return <FeesScreen user={user} />;
      case 'Attendance': return <AttendanceScreen user={user} />;
      default: return null;
    }
  };

  const mainTabs: { name: TabName; icon: React.ReactNode }[] = [
    { name: 'Batches', icon: <LayoutGrid className="w-5 h-5" /> },
    { name: 'Classes', icon: <Video className="w-5 h-5" /> },
    { name: 'Students', icon: <Users className="w-5 h-5" /> },
    { name: 'Tests', icon: <FileText className="w-5 h-5" /> },
    { name: 'Attendance', icon: <CalendarCheck className="w-5 h-5" /> },
  ];

  const handleTabClick = (tabName: TabName) => {
    onTabPress(tabName);
    setIsSearchActive(false);
  };

  const handleBackToMain = () => {
    window.history.back();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white relative">
      {/* Deep Blue Header - Slimmer */}
      <header className="bg-[#0288D1] px-4 pt-3 pb-2 shadow-lg shadow-blue-900/20 shrink-0 z-[60] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {forcedResource ? (
              <button 
                onClick={handleBackToMain} 
                className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center transition-all active:scale-90 text-white border border-white/10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={onOpenDrawer} 
                className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center transition-all active:scale-90 text-white border border-white/10"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="flex flex-col">
              <h1 className="text-base font-black tracking-tight uppercase text-white leading-none">
                {forcedResource || APP_NAME}
              </h1>
              <p className="text-[8px] font-bold text-blue-200 uppercase tracking-[0.2em] mt-0.5">
                {forcedResource ? 'Resource Center' : 'Administrator'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onToggleViewMode}
              className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white active:scale-90 transition-all border border-white/10"
              title="Switch to User View"
            >
              <UserIcon className="w-4 h-4" />
            </button>
            <button 
              onClick={() => { setIsSearchActive(!isSearchActive); if(isSearchActive) setSearchQuery(''); }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${isSearchActive ? 'bg-white text-blue-800' : 'bg-white/10 text-white border border-white/10'}`}
            >
              {isSearchActive ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>
            <button 
              onClick={onOpenNotifications} 
              className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white active:scale-90 transition-all relative border border-white/10"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-blue-800"></span>
            </button>
            <button 
              onClick={onOpenProfile} 
              className="w-9 h-9 rounded-full bg-white shadow-md active:scale-90 transition-all flex items-center justify-center border border-blue-200 overflow-hidden"
            >
               <img 
                 src={APP_LOGO} 
                 alt="Profile" 
                 className="w-full h-full object-cover"
                 referrerPolicy="no-referrer"
               />
            </button>
          </div>
        </div>

        {isSearchActive && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pb-0.5"
          >
            <div className="relative">
              <input 
                autoFocus
                type="text"
                placeholder="Search anything..."
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-xl text-xs font-bold text-white placeholder:text-blue-200 outline-none focus:ring-2 focus:ring-white/30 transition-all shadow-inner"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto scroll-hide bg-white relative">
        <div className="pb-24">
          {renderContent()}
        </div>
      </main>

      {/* Deep Blue Bottom Navigation - Slimmer */}
      <nav className="bg-[#0288D1] px-4 py-2 shrink-0 flex items-center justify-around z-[60] shadow-[0_-8px_30px_rgba(0,0,0,0.15)] border-t border-white/10">
        {mainTabs.map((tab) => (
          <button 
            key={tab.name} 
            onClick={() => handleTabClick(tab.name)} 
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all relative ${
              (activeTab === tab.name && !forcedResource) 
                ? 'text-white scale-110 bg-white/10 shadow-lg' 
                : 'text-white/60 hover:text-white/80'
            }`}
          >
            {(activeTab === tab.name && !forcedResource) && (
              <motion.div 
                layoutId="activeTab"
                className="absolute -top-2 w-8 h-1 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)]"
              />
            )}
            <div className="mb-0.5 transform">{tab.icon}</div>
            <span className="text-[8px] font-black uppercase tracking-widest">{tab.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default AdminNavigator;
