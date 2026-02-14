
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
        case 'Notes': return <div className="p-12 text-center text-gray-400 font-black uppercase text-[10px] tracking-[0.2em] leading-loose">Notes Repository<br/>Coming Soon</div>;
        case 'Results': return <div className="p-12 text-center text-gray-400 font-black uppercase text-[10px] tracking-[0.2em] leading-loose">Performance Results Grid<br/>Coming Soon</div>;
        case 'Add Student': return <div className="p-12 text-center text-gray-400 font-black uppercase text-[10px] tracking-[0.2em] leading-loose">Management: Add Student<br/>Coming Soon</div>;
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
      <header className="bg-white px-4 py-3 border-b border-gray-100 shrink-0 z-[60] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onOpenDrawer} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center transition-all active:scale-90">
              <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex flex-col">
              <h1 className="text-[14px] font-black tracking-tight uppercase text-gray-900 leading-none">{APP_NAME}</h1>
              <p className="text-[7px] font-bold text-blue-600 uppercase tracking-[0.2em] mt-0.5">Premium v2</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setIsSearchActive(!isSearchActive); if(isSearchActive) setSearchQuery(''); }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 ${isSearchActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-50 text-gray-500'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button onClick={onOpenNotifications} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-lg active:scale-90 transition-all relative">
              🔔
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>
            <button onClick={onOpenDrawer} className="w-10 h-10 rounded-xl bg-gray-900 text-white font-black text-xs shadow-md active:scale-90 transition-all flex items-center justify-center border-2 border-white overflow-hidden">
               {user.name.charAt(0)}
            </button>
          </div>
        </div>

        {isSearchActive && (
          <div className="animate-in slide-in-from-top-2 duration-300 pb-1">
            <div className="relative">
              <input 
                autoFocus
                type="text"
                placeholder="Search Batches, Exams..."
                className="w-full bg-[#f8fafc] border border-gray-100 px-4 py-3.5 rounded-xl text-xs font-black text-gray-900 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}
      </header>

      <div className="bg-white border-b border-gray-50 shrink-0 z-50">
        <div className="flex items-center justify-between px-4 py-3 gap-2">
          {visibleResources.map((res) => (
            <button 
              key={res.id} 
              onClick={() => handleResourceClick(res.id)}
              className={`flex flex-col items-center justify-center flex-1 aspect-square rounded-2xl border transition-all relative ${
                forcedResource === res.id ? 'bg-gray-900 border-gray-900 text-white shadow-lg scale-105 z-10' : 'bg-[#f8fafc] border-gray-100 text-gray-500'
              }`}
            >
              <span className="text-lg mb-1">{res.icon}</span>
              <span className={`text-[7px] font-black uppercase tracking-tight ${forcedResource === res.id ? 'text-white' : 'text-gray-400'}`}>
                {res.label}
              </span>
            </button>
          ))}
          <button 
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={`flex flex-col items-center justify-center flex-1 aspect-square rounded-2xl border transition-all relative ${
              isMoreMenuOpen ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-[#f8fafc] border-gray-100 text-gray-500'
            }`}
          >
            <span className="text-xl mb-1">⚡</span>
            <span className={`text-[7px] font-black uppercase tracking-tight ${isMoreMenuOpen ? 'text-white' : 'text-gray-400'}`}>
              MORE
            </span>
          </button>
        </div>
      </div>

      {isMoreMenuOpen && <div className="absolute inset-0 bg-black/5 backdrop-blur-[2px] z-[70]" onClick={() => setIsMoreMenuOpen(false)} />}
      
      <div className={`absolute right-4 w-48 bg-white rounded-[2rem] shadow-2xl border border-gray-100 z-[80] overflow-hidden transition-all duration-300 transform origin-top-right ${
        isMoreMenuOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
      }`} style={{ top: isSearchActive ? '188px' : '136px' }}>
        <div className="p-3 space-y-2">
          {moreResources.map((res) => (
            <button 
              key={res.id}
              onClick={() => handleResourceClick(res.id)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all active:scale-[0.97] ${
                forcedResource === res.id ? 'bg-gray-900 text-white shadow-lg' : 'bg-[#f8fafc] text-gray-700'
              }`}
            >
              <span className="text-xl">{res.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-widest">{res.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto scroll-hide bg-white relative">
        <div className="pb-32">
          {renderContent()}
        </div>
      </main>

      <div className="bg-[#f8fafc] py-2 flex justify-center shrink-0 border-t border-gray-50">
         <p className="text-[8px] font-black text-black uppercase tracking-[0.5em]">© {BRANDING_FOOTER}</p>
      </div>

      <nav className="bg-white border-t border-gray-100 px-3 py-2 shrink-0 flex items-center justify-around z-[60]">
        {mainTabs.map((tab) => (
          <button 
            key={tab.name} 
            onClick={() => handleTabClick(tab.name)} 
            className={`flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all relative ${
              (activeTab === tab.name && !forcedResource) ? 'text-blue-600' : 'text-gray-400 opacity-60'
            }`}
          >
            {(activeTab === tab.name && !forcedResource) && <div className="absolute -top-1 w-8 h-1 bg-blue-600 rounded-full"></div>}
            <span className="text-xl mb-0.5">{tab.icon}</span>
            <span className="text-[7px] font-black uppercase tracking-[0.2em]">{tab.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default MainTabNavigator;
