
import React, { useState, useEffect } from 'react';
import { User, UserRole, ScreenName, GlobalSettings, Batch } from './types.ts';
import LoadingScreen from './screens/LoadingScreen.tsx';
import RoleSelectionScreen from './screens/RoleSelectionScreen.tsx';
import LoginScreen from './screens/LoginScreen.tsx';
import SettingsScreen from './screens/SettingsScreen.tsx';
import BatchDetailsScreen from './screens/BatchDetailsScreen.tsx';
import NotificationsScreen from './screens/NotificationsScreen.tsx';
import ProfileScreen from './screens/ProfileScreen.tsx';
import MainTabNavigator from './navigation/MainTabNavigator.tsx';
import DrawerMenu from './components/DrawerMenu.tsx';
import { auth, db, isFirebaseAvailable } from './firebase.ts';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

const DEFAULT_SETTINGS: GlobalSettings = {
  appName: "CLASSES X",
  logoEmoji: "X",
  primaryColor: "#2563eb",
  backgroundColor: "#f8fafc",
  underMaintenance: false
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('LOADING');
  const [user, setUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [settings, setSettings] = useState<GlobalSettings>(DEFAULT_SETTINGS);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(!isFirebaseAvailable);

  useEffect(() => {
    if (!isFirebaseAvailable) {
      console.warn("Firebase not available. Activating Demo Mode.");
      setIsDemoMode(true);
      setTimeout(() => setCurrentScreen('ROLE_SELECTION'), 1500);
      return;
    }

    // Safe listeners for Firebase
    let unsubSettings = () => {};
    if (db) {
      unsubSettings = onSnapshot(doc(db, "config", "global"), (docSnap) => {
        if (docSnap.exists()) {
          const newSettings = docSnap.data() as GlobalSettings;
          setSettings(newSettings);
        }
      }, (err) => console.warn("Firestore settings error:", err));
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
              
              // Immediate check for maintenance
              if (settings.underMaintenance && loggedInUser.role !== UserRole.ADMIN) {
                setCurrentScreen('MAINTENANCE');
              } else {
                setCurrentScreen('HOME');
              }
            } else {
              setCurrentScreen('ROLE_SELECTION');
            }
          } catch (error) {
            console.error("User profile fetch error:", error);
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

  // Sync maintenance screen state
  useEffect(() => {
    if (settings.underMaintenance && user && user.role !== UserRole.ADMIN) {
      setCurrentScreen('MAINTENANCE');
    } else if (!settings.underMaintenance && currentScreen === 'MAINTENANCE') {
      setCurrentScreen('HOME');
    }
  }, [settings.underMaintenance, user?.role]);

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
    if (auth && !isDemoMode) {
      try {
        await signOut(auth);
      } catch (e) { console.error("Logout failed:", e); }
    }
    setUser(null);
    setSelectedRole(null);
    setCurrentScreen('ROLE_SELECTION');
    setIsDrawerOpen(false);
  };

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const handleSelectBatch = (batch: Batch) => {
    setSelectedBatch(batch);
    setCurrentScreen('BATCH_DETAILS');
  };

  if (currentScreen === 'MAINTENANCE') {
    return (
      <div className="mobile-container bg-white flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-amber-50 rounded-[2.5rem] flex items-center justify-center text-5xl mb-10 shadow-inner border border-amber-100 animate-bounce">🚧</div>
        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">System Offline</h2>
        <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 mt-8 shadow-sm">
          <p className="text-amber-800 text-xs font-black uppercase tracking-[0.2em] leading-relaxed">
            App is under maintenance.<br/>Please contact admin.
          </p>
        </div>
        <p className="text-gray-400 text-[9px] font-bold uppercase tracking-[0.4em] mt-10 max-w-[240px]">
          We're making things better. Stay tuned.
        </p>
        <button 
          onClick={handleLogout} 
          className="mt-14 bg-gray-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl active:scale-95 transition-all"
        >
          Logout Session
        </button>
      </div>
    );
  }

  return (
    <div 
      className="mobile-container shadow-2xl overflow-hidden relative" 
      style={{ 
        '--primary-brand': settings.primaryColor,
        backgroundColor: settings.backgroundColor 
      } as any}
    >
      {isDemoMode && currentScreen !== 'LOADING' && (
        <div className="absolute top-2 right-2 z-[100] bg-yellow-400 text-black text-[9px] font-black px-2 py-1 rounded-full shadow-sm animate-pulse flex items-center gap-1 border border-yellow-500">
          <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
          OFFLINE DEMO
        </div>
      )}

      {currentScreen === 'LOADING' && <LoadingScreen settings={settings} />}
      
      {currentScreen === 'ROLE_SELECTION' && (
        <RoleSelectionScreen settings={settings} onSelectRole={handleRoleSelect} />
      )}

      {currentScreen === 'LOGIN' && selectedRole && (
        <LoginScreen 
          settings={settings}
          role={selectedRole} 
          onLogin={handleLogin} 
          onBack={() => setCurrentScreen('ROLE_SELECTION')} 
        />
      )}
      
      {currentScreen === 'HOME' && user && (
        <>
          <MainTabNavigator 
            settings={settings}
            user={user} 
            onOpenDrawer={toggleDrawer}
            onSelectBatch={handleSelectBatch}
            onOpenNotifications={() => setCurrentScreen('NOTIFICATIONS')}
            onOpenProfile={() => setCurrentScreen('PROFILE')}
          />
          <DrawerMenu 
            isOpen={isDrawerOpen} 
            onClose={toggleDrawer} 
            user={user}
            onLogout={handleLogout}
            onSettings={() => {
              setCurrentScreen('SETTINGS');
              setIsDrawerOpen(false);
            }}
            onProfile={() => {
              setCurrentScreen('PROFILE');
              setIsDrawerOpen(false);
            }}
          />
        </>
      )}

      {currentScreen === 'SETTINGS' && user && (
        <SettingsScreen 
          settings={settings} 
          onBack={() => setCurrentScreen('HOME')} 
        />
      )}

      {currentScreen === 'BATCH_DETAILS' && user && selectedBatch && (
        <BatchDetailsScreen
          batch={selectedBatch}
          settings={settings}
          user={user}
          onBack={() => setCurrentScreen('HOME')}
        />
      )}

      {currentScreen === 'NOTIFICATIONS' && user && (
        <NotificationsScreen 
          user={user}
          settings={settings}
          onBack={() => setCurrentScreen('HOME')}
        />
      )}

      {currentScreen === 'PROFILE' && user && (
        <ProfileScreen
          user={user}
          settings={settings}
          onBack={() => setCurrentScreen('HOME')}
          onUpdateUser={(updated) => setUser({...user, ...updated})}
        />
      )}

      {(currentScreen === 'ROLE_SELECTION') && (
        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
          <p className="text-[10px] tracking-widest text-gray-400 font-bold uppercase">
            GOTHWAD TECHNOLOGIES
          </p>
        </div>
      )}
    </div>
  );
}
