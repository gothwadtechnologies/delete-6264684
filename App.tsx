
import React, { useState, useEffect } from 'react';
import { User, UserRole, ScreenName, GlobalSettings, Batch, Test, TabName } from './common/types.ts';
import LoadingScreen from './common/screens/LoadingScreen.tsx';
import LoginScreen from './common/screens/LoginScreen.tsx';
import SignUpScreen from './common/screens/SignUpScreen.tsx';
import SettingsScreen from './common/screens/SettingsScreen.tsx';
import BatchDetailsScreen from './common/screens/BatchDetailsScreen.tsx';
import NotificationsScreen from './common/screens/NotificationsScreen.tsx';
import ProfileScreen from './common/screens/ProfileScreen.tsx';
import TestBuilderScreen from './common/screens/test-management/TestBuilderScreen.tsx';
import TestTakerScreen from './common/screens/test-management/TestTakerScreen.tsx';
import AdminNavigator from './admin/AdminNavigator.tsx';
import UserNavigator from './user/UserNavigator.tsx';
import AdminDrawer from './admin/AdminDrawer.tsx';
import UserDrawer from './user/UserDrawer.tsx';
import { auth, db, isFirebaseAvailable } from './common/firebase.ts';
import { useAdminView } from './common/context/AdminViewContext.tsx';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';

const FIXED_SETTINGS: GlobalSettings = {
  appName: "Gx Edu",
  logoEmoji: "G",
  primaryColor: "#3b82f6",
  backgroundColor: "#ffffff",
  underMaintenance: false
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('LOADING');
  const [user, setUser] = useState<User | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [settings, setSettings] = useState<GlobalSettings>(FIXED_SETTINGS);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(!isFirebaseAvailable);
  const [activeResource, setActiveResource] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabName>('Batches');
  const [settingsSubView, setSettingsSubView] = useState<'MAIN' | 'ABOUT' | 'AI' | 'PRIVACY'>('MAIN');
  const { isAdminViewMode, setIsAdminViewMode } = useAdminView();

  // Navigation History Management
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        const { screen, resource, tab, batch, test, subView } = event.state;
        setCurrentScreen(screen);
        setActiveResource(resource);
        setActiveTab(tab);
        setSelectedBatch(batch);
        setSelectedTest(test);
        setSettingsSubView(subView || 'MAIN');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Initial state
    window.history.replaceState({
      screen: currentScreen,
      resource: activeResource,
      tab: activeTab,
      batch: selectedBatch,
      test: selectedTest,
      subView: settingsSubView
    }, '');

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (updates: {
    screen?: ScreenName;
    resource?: string | null;
    tab?: TabName;
    batch?: Batch | null;
    test?: Test | null;
    subView?: 'MAIN' | 'ABOUT' | 'AI' | 'PRIVACY';
  }) => {
    const newState = {
      screen: updates.screen ?? currentScreen,
      resource: updates.resource !== undefined ? updates.resource : activeResource,
      tab: updates.tab ?? activeTab,
      batch: updates.batch !== undefined ? updates.batch : selectedBatch,
      test: updates.test !== undefined ? updates.test : selectedTest,
      subView: updates.subView ?? settingsSubView
    };

    setCurrentScreen(newState.screen);
    setActiveResource(newState.resource);
    setActiveTab(newState.tab);
    setSelectedBatch(newState.batch);
    setSelectedTest(newState.test);
    setSettingsSubView(newState.subView);

    window.history.pushState(newState, '');
  };

  const handleLogout = async () => {
    if (auth && !isDemoMode) await signOut(auth);
    setUser(null);
    navigateTo({ screen: 'LOGIN', resource: null, tab: 'Batches' });
    setIsDrawerOpen(false);
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    if (settings.underMaintenance && userData.role !== UserRole.ADMIN) {
      navigateTo({ screen: 'MAINTENANCE' });
    } else {
      navigateTo({ screen: 'HOME', tab: userData.role === UserRole.ADMIN ? 'Batches' : 'Home' });
    }
  };

  useEffect(() => {
    if (!isFirebaseAvailable) {
      setIsDemoMode(true);
      setTimeout(() => navigateTo({ screen: 'LOGIN' }), 1500);
      return;
    }

    let unsubSettings = () => {};
    if (db) {
      unsubSettings = onSnapshot(doc(db, "config", "global"), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings({
            ...FIXED_SETTINGS,
            appName: data.appName || FIXED_SETTINGS.appName,
            logoEmoji: data.logoEmoji || FIXED_SETTINGS.logoEmoji,
            underMaintenance: !!data.underMaintenance,
            aiApiKey: data.aiApiKey || '',
            aiModel1: data.aiModel1 || '',
            aiModel2: data.aiModel2 || '',
            aiModel3: data.aiModel3 || '',
            aiModel4: data.aiModel4 || '',
            aiModel5: data.aiModel5 || '',
          });
        }
      }, (error) => {
        console.error("Config Snapshot Error:", error);
      });
    }

    let unsubscribeAuth = () => {};
    if (auth && db) {
      unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          try {
            const userDoc = await getDoc(doc(db, "users", fbUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              const loggedInUser: User = {
                uid: fbUser.uid,
                name: data.name || "User",
                role: data.role as UserRole,
                phone: data.phone || "",
                email: fbUser.email || undefined
              };
              setUser(loggedInUser);
              if (settings.underMaintenance && loggedInUser.role !== UserRole.ADMIN) {
                navigateTo({ screen: 'MAINTENANCE' });
              } else {
                navigateTo({ screen: 'HOME', tab: loggedInUser.role === UserRole.ADMIN ? 'Batches' : 'Home' });
              }
            } else {
              navigateTo({ screen: 'LOGIN' });
            }
          } catch (error) {
            navigateTo({ screen: 'LOGIN' });
          }
        } else {
          setTimeout(() => navigateTo({ screen: 'LOGIN' }), 1500);
        }
      });
    }

    return () => {
      unsubSettings();
      unsubscribeAuth();
    };
  }, []);

  if (currentScreen === 'MAINTENANCE') {
    return (
      <div className="mobile-container bg-white flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-rose-600 rounded-[2.5rem] flex items-center justify-center text-5xl mb-10 shadow-xl text-white">🚧</div>
        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">System Offline</h2>
        <div className="bg-rose-50 p-6 rounded-[2rem] border border-rose-100 mt-8">
          <p className="text-rose-600 text-xs font-black uppercase tracking-[0.2em] leading-relaxed">Maintenance In Progress</p>
        </div>
        <button onClick={handleLogout} className="mt-14 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl active:scale-95 transition-all">Logout Session</button>
      </div>
    );
  }

  return (
    <div className="mobile-container" style={{ backgroundColor: '#ffffff' }}>
      {currentScreen === 'LOADING' && <LoadingScreen settings={settings} />}
      {currentScreen === 'LOGIN' && (
        <LoginScreen 
          settings={settings} 
          onLogin={handleLogin} 
          onSignUp={() => navigateTo({ screen: 'SIGNUP' })}
        />
      )}
      {currentScreen === 'SIGNUP' && (
        <SignUpScreen 
          settings={settings} 
          onLogin={handleLogin} 
          onBackToLogin={() => navigateTo({ screen: 'LOGIN' })}
        />
      )}
      
      {currentScreen === 'HOME' && user && (
        <>
          {user.role === UserRole.ADMIN && isAdminViewMode ? (
            <AdminNavigator 
              settings={settings} 
              user={user} 
              forcedResource={activeResource} 
              onOpenDrawer={() => setIsDrawerOpen(true)} 
              onSelectBatch={(b) => { navigateTo({ screen: 'BATCH_DETAILS', batch: b }); }} 
              onOpenNotifications={() => navigateTo({ screen: 'NOTIFICATIONS' })} 
              onOpenProfile={() => navigateTo({ screen: 'PROFILE' })} 
              onLogout={handleLogout}
              onTabPress={(tab) => navigateTo({ resource: null, tab })}
              onSelectResource={(id) => navigateTo({ resource: id })}
              isAdminViewMode={isAdminViewMode}
              onToggleViewMode={() => setIsAdminViewMode(!isAdminViewMode)}
              onSelectTest={(test, screen) => {
                navigateTo({ screen, test });
              }}
              activeTab={activeTab}
            />
          ) : (
            <UserNavigator 
              settings={settings} 
              user={user} 
              forcedResource={activeResource} 
              onOpenDrawer={() => setIsDrawerOpen(true)} 
              onSelectBatch={(b) => { navigateTo({ screen: 'BATCH_DETAILS', batch: b }); }} 
              onOpenNotifications={() => navigateTo({ screen: 'NOTIFICATIONS' })} 
              onOpenProfile={() => navigateTo({ screen: 'PROFILE' })} 
              onLogout={handleLogout}
              onTabPress={(tab) => navigateTo({ resource: null, tab })}
              onSelectResource={(id) => navigateTo({ resource: id })}
              isAdminViewMode={isAdminViewMode}
              onToggleViewMode={() => setIsAdminViewMode(!isAdminViewMode)}
              onSelectTest={(test, screen) => {
                navigateTo({ screen, test });
              }}
              activeTab={activeTab}
            />
          )}
          {user.role === UserRole.ADMIN && isAdminViewMode ? (
            <AdminDrawer 
              isOpen={isDrawerOpen} 
              onClose={() => setIsDrawerOpen(false)} 
              user={user} 
              onLogout={handleLogout} 
              onSettings={(view) => { 
                navigateTo({ screen: 'SETTINGS', subView: view || 'MAIN' });
                setIsDrawerOpen(false); 
              }} 
              onProfile={() => { navigateTo({ screen: 'PROFILE' }); setIsDrawerOpen(false); }}
              onSelectResource={(id) => {
                navigateTo({ resource: id });
                setIsDrawerOpen(false);
              }}
            />
          ) : (
            <UserDrawer 
              isOpen={isDrawerOpen} 
              onClose={() => setIsDrawerOpen(false)} 
              user={user} 
              onLogout={handleLogout} 
              onSettings={(view) => { 
                navigateTo({ screen: 'SETTINGS', subView: view || 'MAIN' });
                setIsDrawerOpen(false); 
              }} 
              onProfile={() => { navigateTo({ screen: 'PROFILE' }); setIsDrawerOpen(false); }}
              onSelectResource={(id) => {
                navigateTo({ resource: id });
                setIsDrawerOpen(false);
              }}
            />
          )}
        </>
      )}

      {currentScreen === 'SETTINGS' && user && (
        <SettingsScreen 
          settings={settings} 
          user={user} 
          onBack={() => window.history.back()} 
          initialSubView={settingsSubView} 
          onOpenDrawer={() => setIsDrawerOpen(true)}
        />
      )}
      {currentScreen === 'BATCH_DETAILS' && user && selectedBatch && <BatchDetailsScreen batch={selectedBatch} settings={settings} user={user} onBack={() => window.history.back()} />}
      {currentScreen === 'NOTIFICATIONS' && user && <NotificationsScreen user={user} settings={settings} onBack={() => window.history.back()} />}
      {currentScreen === 'PROFILE' && user && <ProfileScreen user={user} settings={settings} onBack={() => window.history.back()} onUpdateUser={(upd) => setUser({...user, ...upd})} />}
      
      {currentScreen === 'TEST_BUILDER' && user && selectedTest && (
        <TestBuilderScreen 
          test={selectedTest} 
          onBack={() => window.history.back()} 
          onSave={async (updatedTest) => {
            if (!db) return;
            try {
              await updateDoc(doc(db, 'tests', updatedTest.id), {
                questions: updatedTest.questions,
                updatedAt: serverTimestamp()
              });
              window.history.back();
            } catch (e) {
              alert("Failed to save test questions");
            }
          }} 
        />
      )}

      {currentScreen === 'TEST_TAKER' && user && selectedTest && (
        <TestTakerScreen 
          test={selectedTest} 
          studentId={user.uid}
          studentName={user.name}
          onBack={() => window.history.back()} 
          onSubmit={async (result) => {
            if (!db) return;
            try {
              await addDoc(collection(db, 'testResults'), {
                ...result,
                completedAt: new Date().toISOString()
              });
              window.history.back();
            } catch (e) {
              alert("Failed to submit test results");
            }
          }} 
        />
      )}
    </div>
  );
}
