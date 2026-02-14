
import React, { useState, useEffect } from 'react';
import { User, UserRole, GlobalSettings } from '../types';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { APP_NAME, BRANDING_FOOTER } from '../constants';

interface LoginScreenProps {
  role: UserRole;
  onLogin: (user: User) => void;
  onBack: () => void;
  settings: GlobalSettings;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ role, onLogin, onBack, settings }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const isAdmin = role === UserRole.ADMIN;

  useEffect(() => {
    const savedIdentifier = localStorage.getItem(`remembered_id_${role}`);
    if (savedIdentifier) {
      setIdentifier(savedIdentifier);
      setRememberMe(true);
    }
  }, [role]);

  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      const demoUser: User = {
        uid: 'demo-uid-' + role.toLowerCase(),
        name: `Demo ${role.charAt(0) + role.slice(1).toLowerCase()}`,
        role: role,
        phone: '0000000000',
        email: `demo@${settings.appName.toLowerCase().replace(/\s/g, '')}.com`
      };
      onLogin(demoUser);
      setIsLoading(false);
    }, 800);
  };

  const handleForgotPassword = async () => {
    if (!identifier.includes('@')) {
      setError("Enter email to reset.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, identifier);
      setMsg("Reset link sent!");
      setTimeout(() => setMsg(''), 5000);
    } catch (err: any) {
      setError("Reset failed.");
    }
  };

  const handleLoginAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let loginEmail = identifier.trim();
      if (!loginEmail.includes('@')) {
        if (role === UserRole.STUDENT) {
          loginEmail = `${identifier.trim().toLowerCase()}@student.classesx.com`;
        } else if (role === UserRole.PARENT) {
          loginEmail = `${identifier.trim().toLowerCase()}@parent.classesx.com`;
        }
      }

      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, password);
      const fbUser = userCredential.user;

      const userDocRef = doc(db, "users", fbUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      let userData: User;

      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.role && data.role !== role) {
          await auth.signOut();
          throw new Error(`Invalid role access.`);
        }
        userData = {
          uid: fbUser.uid,
          name: data.name || "Learner",
          role: data.role as UserRole,
          phone: data.phone || identifier,
          email: fbUser.email || undefined
        };
      } else {
        const initialProfile = {
          name: isAdmin ? "Admin User" : `User ${identifier}`,
          role: role,
          phone: identifier,
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, initialProfile);
        userData = { uid: fbUser.uid, ...initialProfile, email: fbUser.email || undefined };
      }

      if (rememberMe) {
        localStorage.setItem(`remembered_id_${role}`, identifier);
      } else {
        localStorage.removeItem(`remembered_id_${role}`);
      }

      onLogin(userData);
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      {/* High-End Header */}
      <header className="bg-white px-5 py-4 flex items-center justify-between border-b border-gray-100 shrink-0">
        <button onClick={onBack} className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center transition-all active:scale-90">
          <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-[11px] font-black tracking-[0.4em] uppercase text-gray-900 leading-none">{APP_NAME}</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse"></div>
            <p className="text-[8px] font-bold text-blue-600 uppercase tracking-widest">{role} AUTH</p>
          </div>
        </div>
        <div className="w-10 flex justify-end">
           <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center text-[10px]">🔒</div>
        </div>
      </header>

      {/* Main Body - Optimized for Zero Scrolling */}
      <div className="flex-1 flex flex-col justify-center px-8 py-4 space-y-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase leading-none">Access Node</h2>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-2">Enter credentials for secure entry</p>
        </div>

        <form onSubmit={handleLoginAction} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-[9px] font-black uppercase tracking-widest border border-red-100 animate-shake">{error}</div>}
          {msg && <div className="bg-blue-50 text-blue-600 p-3 rounded-xl text-[9px] font-black uppercase tracking-widest border border-blue-100">{msg}</div>}
          
          <div className="space-y-1">
            <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Identity UID</label>
            <input 
              type="text" required
              className="w-full px-5 py-3.5 bg-[#f8fafc] border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none font-bold text-gray-900 transition-all text-sm"
              placeholder={isAdmin ? "admin@mail.com" : "Registration ID"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between px-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Secret Key</label>
              <button type="button" onClick={handleForgotPassword} className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Forgot?</button>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} required
                className="w-full px-5 py-3.5 bg-[#f8fafc] border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none font-bold text-gray-900 pr-12 transition-all text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 opacity-60 text-lg"
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 px-1">
            <input 
              type="checkbox" id="rem" 
              checked={rememberMe} 
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-gray-200 text-blue-600 focus:ring-blue-600"
            />
            <label htmlFor="rem" className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Maintain Active Session</label>
          </div>

          <div className="pt-2 space-y-3">
            <button 
              disabled={isLoading}
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-blue-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'VALIDATE IDENTITY'}
            </button>

            <button 
              type="button"
              onClick={handleDemoLogin}
              className="w-full bg-gray-900 text-white py-3.5 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] active:scale-[0.98] transition-all"
            >
              Guest Access
            </button>
          </div>
        </form>

        {/* Specialized Security Badge */}
        <div className="bg-gray-50 border border-gray-100 py-3 px-4 rounded-2xl flex items-center justify-between">
           <div className="flex items-center gap-2">
             <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-[10px]">✓</div>
             <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">AES-256 Encrypted</p>
           </div>
           <p className="text-[7px] font-bold text-gray-300 uppercase tracking-[0.2em]">SSL PROTECTED CONNECTION</p>
        </div>
      </div>

      {/* Extreme Bottom Branding Footer */}
      <footer className="mt-auto pb-6 pt-2 flex flex-col items-center shrink-0">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-[0.5px] w-6 bg-gray-100"></div>
            <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-[0.3em]">{APP_NAME}</h3>
            <div className="h-[0.5px] w-6 bg-gray-100"></div>
          </div>
          <p className="text-[9px] font-black text-black uppercase tracking-[0.4em] flex items-center gap-1">
            <span className="text-blue-600 text-xs">©</span> {BRANDING_FOOTER}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LoginScreen;
