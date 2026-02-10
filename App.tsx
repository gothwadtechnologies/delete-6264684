
import React, { useState, useEffect } from 'react';
import { User, UserRole, ScreenName } from './types';
import LoadingScreen from './screens/LoadingScreen';
import RoleSelectionScreen from './screens/RoleSelectionScreen';
import LoginScreen from './screens/LoginScreen';
import MainTabNavigator from './navigation/MainTabNavigator';
import DrawerMenu from './components/DrawerMenu';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('LOADING');
  const [user, setUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    // Listen for auth state changes to handle persistence
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          // Attempt to restore user profile from Firestore
          const userDoc = await getDoc(doc(db, "users", fbUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
              uid: fbUser.uid,
              name: data.name || "User",
              role: data.role as UserRole,
              phone: data.phone || "",
              email: fbUser.email || undefined
            });
            setCurrentScreen('HOME');
          } else {
            // No profile found, user might have been deleted or needs setup
            setCurrentScreen('ROLE_SELECTION');
          }
        } catch (error) {
          console.error("Persistence Error:", error);
          setCurrentScreen('ROLE_SELECTION');
        }
      } else {
        // No session, show role selection after splash
        setTimeout(() => {
          setCurrentScreen('ROLE_SELECTION');
        }, 2000);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setCurrentScreen('LOGIN');
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentScreen('HOME');
  };

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    setSelectedRole(null);
    setCurrentScreen('ROLE_SELECTION');
    setIsDrawerOpen(false);
  };

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  return (
    <div className="mobile-container shadow-2xl overflow-hidden relative">
      {currentScreen === 'LOADING' && <LoadingScreen />}
      
      {currentScreen === 'ROLE_SELECTION' && (
        <RoleSelectionScreen onSelectRole={handleRoleSelect} />
      )}

      {currentScreen === 'LOGIN' && selectedRole && (
        <LoginScreen 
          role={selectedRole} 
          onLogin={handleLogin} 
          onBack={() => setCurrentScreen('ROLE_SELECTION')} 
        />
      )}
      
      {currentScreen === 'HOME' && user && (
        <>
          <MainTabNavigator 
            user={user} 
            onOpenDrawer={toggleDrawer} 
          />
          <DrawerMenu 
            isOpen={isDrawerOpen} 
            onClose={toggleDrawer} 
            user={user}
            onLogout={handleLogout}
          />
        </>
      )}

      {/* Floating Global Brand Placeholder - Hidden on Login to prevent keyboard issues */}
      {(currentScreen === 'ROLE_SELECTION') && (
        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
          <p className="text-[10px] tracking-widest text-gray-400 font-bold uppercase">
            GOTHWAD TECHNOLOGIES
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
