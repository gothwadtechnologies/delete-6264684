
import React, { useState } from 'react';
import { User, TabName, GlobalSettings, Batch, UserRole } from '../types.ts';
import FeesScreen from '../screens/tabs/FeesScreen.tsx';
import ClassesScreen from '../screens/tabs/ClassesScreen.tsx';
import TestsScreen from '../screens/tabs/TestsScreen.tsx';
import AttendanceScreen from '../screens/tabs/AttendanceScreen.tsx';
import BatchesScreen from '../screens/tabs/BatchesScreen.tsx';
import { APP_NAME, BRANDING_FOOTER, BOOK_ICON } from '../constants.ts';

// Resource Screens
import LibraryScreen from '../screens/resources/LibraryScreen.tsx';
import PYQScreen from '../screens/resources/PYQScreen.tsx';
import EduAIScreen from '../screens/resources/EduAIScreen.tsx';
import SamplePaperScreen from '../screens/resources/SamplePaperScreen.tsx';
import TestSeriesScreen from '../screens/resources/TestSeriesScreen.tsx';

interface MainTabNavigatorProps {
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
  onAddStudent: () => void;
  onAddBatch: () => void; // Add this prop
  onSearch: () => void;
}

const MainTabNavigator: React.FC<MainTabNavigatorProps> = ({ 
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
  onAddStudent,
  onAddBatch, // Destructure the prop
  onSearch
}) => {
  const [activeTab, setActiveTab] = useState<TabName>('Batches');
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const renderContent = () => {
    if (forcedResource) {
      switch (forcedResource) {
        case 'Library': return <LibraryScreen />;
        case 'PYQs': return <PYQScreen />;
        case 'Edu AI': return <EduAIScreen />;
        case 'Papers': return <SamplePaperScreen />;
        case 'Series': return <TestSeriesScreen />;
        case 'Notes': return <div className="p-12 text-center text-gray-400 font-black uppercase text-[10px] tracking-[0.2em] leading-loose">Notes Repository<br/>Coming Soon</div>;
        case 'Results': return <div className="p-12 text-center text-gray-400 font-black uppercase text-[10px] tracking-[0.2em] leading-loose">Performance Results Grid<br/>Coming Soon</div>;
        default: break;
      }
    }
    switch (activeTab) {
      // Pass onAddBatch to BatchesScreen
      case 'Batches': return <BatchesScreen user={user} onSelectBatch={onSelectBatch} onAddBatch={onAddBatch} searchQuery={""} />;
      case 'Classes': return <ClassesScreen user={user} onAddClass={() => {}}/>;
      case 'Tests': return <TestsScreen user={user} />;
      case 'Fees': return <FeesScreen user={user} />;
      case 'Attendance': return <AttendanceScreen user={user} />;
      default: return null;
    }
  };

  const mainTabs: { name: TabName; icon: string }[] = [
    { name: 'Batches', icon: BOOK_ICON },
    { name: 'Classes', icon: '📺' },
    { name: 'Tests', icon: '📝' },
    { name: 'Fees', icon: '💰' },
    { name: 'Attendance', icon: '📅' },
  ];

  const visibleResources = [
    { id: 'Library', icon: '📖', label: 'LIB' },
    { id: 'PYQs', icon: '📜', label: 'PYQ' },
    { id: 'Edu AI', icon: '✨', label: 'AI' },
    { id: 'Papers', icon: '📄', label: 'PAPER' },
    { id: 'Series', icon: '🎯', label: 'SERIES' },
  ];

  const moreResources = [
    { id: 'Results', icon: '📊', label: 'Results' },
    { id: 'Notes', icon: '📝', label: 'Notes' },
    ...(user.role === UserRole.ADMIN ? [{ id: 'Add Student', icon: '👤+', label: '+ Student' }] : []),
    { id: 'Doubts', icon: '🙋‍♂️', label: 'Doubts' },
  ];

  const handleTabClick = (tabName: TabName) => {
    setActiveTab(tabName);
    onTabPress(); // Clears forcedResource in App.tsx
    setIsMoreMenuOpen(false);
  };

  const handleResourceClick = (id: string) => {
    setIsMoreMenuOpen(false);
    if (id === 'Add Student') {
      onAddStudent();
      return;
    }
    const nextVal = forcedResource === id ? null : id;
    onSelectResource(nextVal);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white relative">
      <header className="bg-blue-600 px-4 pt-4 pb-3 shrink-0 z-[60] shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onOpenDrawer} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center transition-all active:scale-90">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="flex flex-col">
              <h1 className="text-[14px] font-black tracking-tight uppercase text-white leading-none">{APP_NAME}</h1>
              <p className="text-[8px] font-bold text-white/70 uppercase tracking-[0.2em] mt-0.5">Gothwad technologies</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onSearch} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center transition-all active:scale-90">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
            <button onClick={onOpenNotifications} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg active:scale-90 transition-all relative">
              <span className="text-white">🔔</span>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
            <button onClick={onOpenProfile} className="w-10 h-10 rounded-full bg-white text-blue-600 font-black text-sm shadow-inner active:scale-90 transition-all flex items-center justify-center overflow-hidden">
               {user.name.charAt(0)}
            </button>
          </div>
        </div>
      </header>

      <div className="bg-gray-800 shrink-0 z-50 py-3">
        <div className="flex items-center justify-between px-4 gap-2">
          {visibleResources.map((res) => (
            <button 
              key={res.id} 
              onClick={() => handleResourceClick(res.id)}
              className={`flex flex-col items-center justify-center flex-1 aspect-square rounded-2xl transition-all relative ${
                forcedResource === res.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white/10 text-white'
              }`}
            >
              <span className="text-lg mb-1">{res.icon}</span>
              <span className={`text-[7px] font-black uppercase tracking-tight ${forcedResource === res.id ? 'text-white/80' : 'text-white/70'}`}>
                {res.label}
              </span>
            </button>
          ))}
          <button 
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={`flex flex-col items-center justify-center flex-1 aspect-square rounded-2xl transition-all relative ${
              isMoreMenuOpen ? 'bg-blue-800 text-white shadow-lg' : 'bg-white/10 text-white'
            }`}
          >
            <span className="text-xl mb-1">⚡</span>
            <span className={`text-[7px] font-black uppercase tracking-tight ${isMoreMenuOpen ? 'text-white/80' : 'text-white/70'}`}>
              MORE
            </span>
          </button>
        </div>
      </div>

      {isMoreMenuOpen && <div className="absolute inset-0 bg-black/5 backdrop-blur-[2px] z-[70]" onClick={() => setIsMoreMenuOpen(false)} />}
      
      <div className={`absolute right-4 w-48 bg-white rounded-[2rem] shadow-2xl border border-gray-100 z-[80] overflow-hidden transition-all duration-300 transform origin-top-right ${
        isMoreMenuOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
      }`} style={{ top: '140px' }}>
        <div className="p-3 space-y-2">
          {moreResources.map((res) => (
            <button 
              key={res.id}
              onClick={() => handleResourceClick(res.id)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all active:scale-[0.97] ${
                forcedResource === res.id ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <span className="text-xl">{res.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{res.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto scroll-hide bg-gray-50 relative">
        <div className="pb-32">
          {renderContent()}
        </div>
      </main>

      <nav className="bg-blue-600 px-2 py-2 shrink-0 flex items-center justify-around z-[60]">
        {mainTabs.map((tab) => (
          <button 
            key={tab.name} 
            onClick={() => handleTabClick(tab.name)} 
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 relative ${
              (activeTab === tab.name && !forcedResource) 
                ? 'text-white' 
                : 'text-white/60'
            }`}
          >
            <span className="text-2xl">{tab.icon}</span>
            <span className={`text-[9px] uppercase tracking-wider mt-1 ${
                (activeTab === tab.name && !forcedResource) ? 'font-bold' : 'font-medium'
            }`}>{tab.name}</span>
            {(activeTab === tab.name && !forcedResource) && (
                <span className="absolute bottom-2 w-1.5 h-1.5 bg-white rounded-full"></span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default MainTabNavigator;
