
import React, { useState } from 'react';
import { User, TabName, GlobalSettings, Batch } from '../types.ts';
import FeesScreen from '../screens/tabs/FeesScreen.tsx';
import ClassesScreen from '../screens/tabs/ClassesScreen.tsx';
import TestsScreen from '../screens/tabs/TestsScreen.tsx';
import AttendanceScreen from '../screens/tabs/AttendanceScreen.tsx';
import BatchesScreen from '../screens/tabs/BatchesScreen.tsx';

// Resource Screens
import LibraryScreen from '../screens/resources/LibraryScreen.tsx';
import PYQScreen from '../screens/resources/PYQScreen.tsx';
import SamplePaperScreen from '../screens/resources/SamplePaperScreen.tsx';
import TestSeriesScreen from '../screens/resources/TestSeriesScreen.tsx';
import EduAIScreen from '../screens/resources/EduAIScreen.tsx';

interface MainTabNavigatorProps {
  user: User;
  onOpenDrawer: () => void;
  settings: GlobalSettings;
  onSelectBatch: (batch: Batch) => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
}

const MainTabNavigator: React.FC<MainTabNavigatorProps> = ({ user, onOpenDrawer, settings, onSelectBatch, onOpenNotifications, onOpenProfile }) => {
  const [activeTab, setActiveTab] = useState<TabName>('Batches');
  const [activeResource, setActiveResource] = useState<string | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const renderContent = () => {
    if (activeResource) {
      switch (activeResource) {
        case 'Library': return <LibraryScreen />;
        case 'PYQs': return <PYQScreen />;
        case 'Edu AI': return <EduAIScreen />;
        case 'Sample Paper': return <SamplePaperScreen />;
        case 'Test Series': return <TestSeriesScreen />;
        default: break;
      }
    }

    switch (activeTab) {
      case 'Batches': return <BatchesScreen user={user} onSelectBatch={onSelectBatch} onOpenNotifications={onOpenNotifications} />;
      case 'Classes': return <ClassesScreen user={user} />;
      case 'Tests': return <TestsScreen user={user} />;
      case 'Fees': return <FeesScreen user={user} />;
      case 'Attendance': return <AttendanceScreen user={user} />;
      default: return null;
    }
  };

  const mainTabs: { name: TabName; icon: string }[] = [
    { name: 'Batches', icon: '📚' },
    { name: 'Classes', icon: '📺' },
    { name: 'Tests', icon: '📝' },
    { name: 'Fees', icon: '💰' },
    { name: 'Attendance', icon: '📅' },
  ];

  const handleTabChange = (name: TabName) => {
    setActiveTab(name);
    setActiveResource(null);
    setShowMoreMenu(false);
  };

  const handleResourceClick = (name: string) => {
    if (name === 'More') {
      setShowMoreMenu(!showMoreMenu);
    } else {
      setActiveResource(activeResource === name ? null : name);
      setShowMoreMenu(false);
    }
  };

  const isMoreActive = activeResource === 'Sample Paper' || activeResource === 'Test Series';

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {/* Top Header */}
      <header className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-100 shrink-0 z-50">
        <button onClick={onOpenDrawer} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex flex-col items-center">
           <h1 className="text-sm font-black tracking-tighter uppercase" style={{ color: settings.primaryColor }}>{settings.appName}</h1>
           <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">Learning Center</p>
        </div>
        <button 
          onClick={onOpenProfile}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm active:scale-90 transition-all overflow-hidden"
          style={{ backgroundColor: settings.primaryColor }}
        >
          {user.name.charAt(0)}
        </button>
      </header>

      {/* Revamped 4-Tab Header Navigation */}
      <div className="bg-white border-b border-gray-100 px-3 py-2 shrink-0 relative">
        <div className="flex items-center justify-between gap-1">
          <HeaderTab 
            icon="📖" label="Library" 
            active={activeResource === 'Library'} 
            onClick={() => handleResourceClick('Library')} 
          />
          <HeaderTab 
            icon="📜" label="PYQs" 
            active={activeResource === 'PYQs'} 
            onClick={() => handleResourceClick('PYQs')} 
          />
          <HeaderTab 
            icon="✨" label="Edu AI" 
            active={activeResource === 'Edu AI'} 
            onClick={() => handleResourceClick('Edu AI')} 
          />
          <HeaderTab 
            icon="➕" label="More" 
            active={isMoreActive || showMoreMenu} 
            onClick={() => handleResourceClick('More')} 
          />
        </div>

        {/* More Menu Dropdown */}
        {showMoreMenu && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShowMoreMenu(false)}></div>
            <div className="absolute right-3 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-40 animate-in fade-in zoom-in-95 duration-200">
              <button 
                onClick={() => { setActiveResource('Sample Paper'); setShowMoreMenu(false); }}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg">📄</span>
                <span className="text-[11px] font-black text-gray-900 uppercase tracking-tight">Sample Papers</span>
              </button>
              <div className="h-px bg-gray-50 mx-4"></div>
              <button 
                onClick={() => { setActiveResource('Test Series'); setShowMoreMenu(false); }}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
              >
                <span className="text-lg">🎯</span>
                <span className="text-[11px] font-black text-gray-900 uppercase tracking-tight">Test Series</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto scroll-hide relative">
        <div className="max-w-md mx-auto">
          {renderContent()}
          {!activeResource && (
            <div className="py-12 text-center">
               <p className="text-[10px] tracking-widest text-gray-300 font-black uppercase">
                GOTHWAD TECHNOLOGIES
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Fixed Bottom Tab Navigation */}
      <nav className="bg-white border-t border-gray-100 px-2 py-2 shrink-0 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-50">
        {mainTabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => handleTabChange(tab.name)}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all duration-300 min-w-[64px] ${
              activeTab === tab.name && !activeResource
                ? 'bg-opacity-10' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            style={activeTab === tab.name && !activeResource ? { color: settings.primaryColor, backgroundColor: `${settings.primaryColor}15` } : {}}
          >
            <span className={`text-xl transition-transform ${activeTab === tab.name && !activeResource ? 'scale-110' : ''}`}>
              {tab.icon}
            </span>
            <span className={`text-[9px] mt-1 font-black uppercase tracking-widest ${activeTab === tab.name && !activeResource ? 'opacity-100' : 'opacity-70'}`}>
              {tab.name}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};

const HeaderTab: React.FC<{ icon: string; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-200 border ${
      active 
        ? 'bg-gray-900 border-gray-900 shadow-lg scale-105 z-10' 
        : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100'
    }`}
  >
    <span className="text-lg">{icon}</span>
    <span className={`text-[8px] font-black uppercase tracking-tighter mt-0.5 ${active ? 'text-white' : 'text-gray-400'}`}>
      {label}
    </span>
  </button>
);

export default MainTabNavigator;
