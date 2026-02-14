
import React, { useState, useEffect } from 'react';
import { User, UserRole, GlobalSettings } from '../types';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
      setError("Please enter your full email address to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, identifier);
      setMsg("Reset link sent to your email!");
      setTimeout(() => setMsg(''), 5000);
    } catch (err: any) {
      setError("Failed to send reset email.");
    }
  };

  const handleLoginAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let loginEmail = identifier.trim();
      // Auto-suffix for students/parents if only ID is provided
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
          throw new Error(`This account is not registered as a ${role.toLowerCase()}.`);
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
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-white p-8 flex flex-col overflow-y-auto scroll-hide">
      <div className="mt-4 shrink-0">
        <button onClick={onBack} className="flex items-center gap-1 text-gray-400 hover:text-blue-600 font-medium text-sm transition-colors group">
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      <div className="mt-6 mb-8 flex flex-col items-center shrink-0">
        <div 
          className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl mb-4 text-white text-3xl font-black italic transform rotate-3"
          style={{ backgroundColor: settings.primaryColor }}
        >
          {settings.logoEmoji}
        </div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tighter text-center uppercase">
          {settings.appName}
        </h2>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">{role} ACCESS</p>
      </div>

      <form onSubmit={handleLoginAction} className="space-y-5 flex-1">
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[11px] font-bold border border-red-100">{error}</div>}
        {msg && <div className="bg-green-50 text-green-600 p-4 rounded-2xl text-[11px] font-bold border border-green-100">{msg}</div>}
        
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
            {isAdmin ? 'Email Address' : 'User ID / Roll No'}
          </label>
          <input 
            type="text" required
            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 outline-none font-bold text-gray-900"
            style={{ '--tw-ring-color': settings.primaryColor } as any}
            placeholder={isAdmin ? "admin@mail.com" : "Enter your ID"}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between px-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
            <button type="button" onClick={handleForgotPassword} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Forgot?</button>
          </div>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} required
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 outline-none font-bold text-gray-900 pr-12"
              style={{ '--tw-ring-color': settings.primaryColor } as any}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
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
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="rem" className="text-xs font-bold text-gray-500">Keep me signed in</label>
        </div>

        <div className="pt-2 space-y-3">
          <button 
            disabled={isLoading}
            type="submit"
            className="w-full text-white py-4 rounded-2xl font-black text-lg shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            style={{ backgroundColor: settings.primaryColor }}
          >
            {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'SIGN IN NOW'}
          </button>

          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-gray-100"></div>
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">OR</span>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>

          <button 
            type="button"
            onClick={handleDemoLogin}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-sm shadow-md active:scale-[0.98] transition-all"
          >
            TRY DEMO ACCOUNT
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginScreen;
