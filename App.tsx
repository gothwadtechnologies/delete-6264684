
import React, { useState, useEffect } from 'react';
import { User, UserRole, ScreenName, GlobalSettings, Batch } from './types.ts';
import LoadingScreen from './screens/LoadingScreen.tsx';
import RoleSelectionScreen from './screens/RoleSelectionScreen.tsx';
import LoginScreen from './screens/LoginScreen.tsx';
import SettingsScreen from './screens/SettingsScreen.tsx';
import BatchDetailsScreen from './screens/BatchDetailsScreen.tsx';
import NotificationsScreen from './screens/NotificationsScreen.tsx';
import ProfileScreen from './screens/ProfileScreen.tsx';
import AdminNavigator from './navigation/AdminNavigator.tsx';
import UserNavigator from './navigation/UserNavigator.tsx';
import AdminDrawer from './components/AdminDrawer.tsx';
import UserDrawer from './components/UserDrawer.tsx';
import { auth, db, isFirebaseAvailable } from './firebase.ts';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

const FIXED_SETTINGS: GlobalSettings = {
  appName: "CLASSES X",
  logoEmoji: "X",
  primaryColor: "#3b82f6",
  backgroundColor: "#ffffff",
  underMaintenance: false
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('LOADING');
  const [user, setUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [settings, setSettings] = useState<GlobalSettings>(FIXED_SETTINGS);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(!isFirebaseAvailable);
  const [activeResource, setActiveResource] = useState<string | null>(null);
  const [settingsSubView, setSettingsSubView] = useState<'MAIN' | 'ABOUT' | 'AI' | 'PRIVACY'>('MAIN');

  useEffect(() => {
    if (!isFirebaseAvailable) {
      setIsDemoMode(true);
      setTimeout(() => setCurrentScreen('ROLE_SELECTION'), 1500);
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
            underMaintenance: !!data.underMaintenance
          });
        }
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
                setCurrentScreen('MAINTENANCE');
              } else {
                setCurrentScreen('HOME');
              }
            } else {
              setCurrentScreen('ROLE_SELECTION');
            }
          } catch (error) {
            setCurrentScreen('ROLE_SELECTION');
          }
        } else {
          setTimeout(() => setCurrentScreen('ROLE_SELECTION'), 1500);
        }
      });
    }

    return () => {
      unsubSettings();
      unsubscribeAuth();
    };
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setCurrentScreen('LOGIN');
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    if (settings.underMaintenance && userData.role !== UserRole.ADMIN) {
      setCurrentScreen('MAINTENANCE');
    } else {
      setCurrentScreen('HOME');
    }
  };

  const handleLogout = async () => {
    if (auth && !isDemoMode) await signOut(auth);
    setUser(null);
    setSelectedRole(null);
    setCurrentScreen('ROLE_SELECTION');
    setIsDrawerOpen(false);
    setActiveResource(null);
  };

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
      {currentScreen === 'ROLE_SELECTION' && <RoleSelectionScreen settings={settings} onSelectRole={handleRoleSelect} />}
      {currentScreen === 'LOGIN' && selectedRole && <LoginScreen settings={settings} role={selectedRole} onLogin={handleLogin} onBack={() => setCurrentScreen('ROLE_SELECTION')} />}
      
      {currentScreen === 'HOME' && user && (
        <>
          {user.role === UserRole.ADMIN ? (
            <AdminNavigator 
              settings={settings} 
              user={user} 
              forcedResource={activeResource} 
              onOpenDrawer={() => setIsDrawerOpen(true)} 
              onSelectBatch={(b) => { setSelectedBatch(b); setCurrentScreen('BATCH_DETAILS'); }} 
              onOpenNotifications={() => setCurrentScreen('NOTIFICATIONS')} 
              onOpenProfile={() => setCurrentScreen('PROFILE')} 
              onLogout={handleLogout}
              onTabPress={() => setActiveResource(null)}
              onSelectResource={(id) => setActiveResource(id)}
            />
          ) : (
            <UserNavigator 
              settings={settings} 
              user={user} 
              forcedResource={activeResource} 
              onOpenDrawer={() => setIsDrawerOpen(true)} 
              onSelectBatch={(b) => { setSelectedBatch(b); setCurrentScreen('BATCH_DETAILS'); }} 
              onOpenNotifications={() => setCurrentScreen('NOTIFICATIONS')} 
              onOpenProfile={() => setCurrentScreen('PROFILE')} 
              onLogout={handleLogout}
              onTabPress={() => setActiveResource(null)}
              onSelectResource={(id) => setActiveResource(id)}
            />
          )}
          {user.role === UserRole.ADMIN ? (
            <AdminDrawer 
              isOpen={isDrawerOpen} 
              onClose={() => setIsDrawerOpen(false)} 
              user={user} 
              onLogout={handleLogout} 
              onSettings={(view) => { 
                setSettingsSubView(view || 'MAIN');
                setCurrentScreen('SETTINGS'); 
                setIsDrawerOpen(false); 
              }} 
              onProfile={() => { setCurrentScreen('PROFILE'); setIsDrawerOpen(false); }}
              onSelectResource={(id) => {
                setActiveResource(id);
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
                setSettingsSubView(view || 'MAIN');
                setCurrentScreen('SETTINGS'); 
                setIsDrawerOpen(false); 
              }} 
              onProfile={() => { setCurrentScreen('PROFILE'); setIsDrawerOpen(false); }}
              onSelectResource={(id) => {
                setActiveResource(id);
                setIsDrawerOpen(false);
              }}
            />
          )}
        </>
      )}

      {currentScreen === 'SETTINGS' && user && <SettingsScreen settings={settings} user={user} onBack={() => { setCurrentScreen('HOME'); setSettingsSubView('MAIN'); }} initialSubView={settingsSubView} />}
      {currentScreen === 'BATCH_DETAILS' && user && selectedBatch && <BatchDetailsScreen batch={selectedBatch} settings={settings} user={user} onBack={() => setCurrentScreen('HOME')} />}
      {currentScreen === 'NOTIFICATIONS' && user && <NotificationsScreen user={user} settings={settings} onBack={() => setCurrentScreen('HOME')} />}
      {currentScreen === 'PROFILE' && user && <ProfileScreen user={user} settings={settings} onBack={() => setCurrentScreen('HOME')} onUpdateUser={(upd) => setUser({...user, ...upd})} />}
    </div>
  );
}
