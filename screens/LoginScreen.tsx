import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, Check } from 'lucide-react';
import { User, UserRole, GlobalSettings } from '../types';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { BRANDING_FOOTER } from '../constants';

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
  const roleTitle = role.charAt(0) + role.slice(1).toLowerCase();

  useEffect(() => {
    const savedIdentifier = localStorage.getItem(`remembered_id_${role}`);
    if (savedIdentifier) {
      setIdentifier(savedIdentifier);
      setRememberMe(true);
    }
  }, [role]);

  const handleForgotPassword = async () => {
    if (!identifier.includes('@')) {
      setError("Please enter your email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, identifier);
      setMsg("Password reset link sent to your email!");
      setTimeout(() => setMsg(''), 5000);
    } catch (err: any) {
      setError("Failed to send reset link.");
    }
  };

  const handleLoginAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let loginEmail = identifier.trim();
      // Auto-append domain if it's just a username/ID for students/parents
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
          throw new Error(`This account is not registered as a ${roleTitle}.`);
        }
        userData = {
          uid: fbUser.uid,
          name: data.name || "User",
          role: data.role as UserRole,
          phone: data.phone || "",
          email: fbUser.email || undefined
        };
      } else {
        // If user exists in Auth but not in Firestore, create a basic profile
        const initialProfile = {
          name: isAdmin ? "Admin User" : `User ${identifier}`,
          role: role,
          phone: "",
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
      setError(err.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden font-sans">
      {/* Android Style Header */}
      <header className="px-4 pt-4 pb-2 flex items-center bg-white sticky top-0 z-50">
        <button 
          onClick={onBack} 
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-600"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 px-8 pt-4 overflow-y-auto scroll-hide">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10 text-left"
        >
          <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Login as {roleTitle}
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-2">
            Please sign in to your account to continue
          </p>
        </motion.div>

        <form onSubmit={handleLoginAction} className="space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold border border-rose-100"
            >
              {error}
            </motion.div>
          )}
          {msg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-xs font-bold border border-emerald-100"
            >
              {msg}
            </motion.div>
          )}
          
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input 
                type="email" 
                required
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:border-transparent outline-none font-bold text-slate-900 transition-all text-sm"
                placeholder="name@example.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between px-1">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Password</label>
            </div>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                required
                className="w-full pl-12 pr-14 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white focus:border-transparent outline-none font-bold text-slate-900 transition-all text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${rememberMe ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200'}`}
              >
                {rememberMe && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>
              <span 
                onClick={() => setRememberMe(!rememberMe)}
                className="text-xs font-bold text-slate-500 cursor-pointer select-none"
              >
                Remember me
              </span>
            </div>
            <button 
              type="button" 
              onClick={handleForgotPassword} 
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          <div className="pt-4">
            <button 
              disabled={isLoading}
              type="submit"
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>
      </div>

      <footer className="p-8 flex flex-col items-center shrink-0 bg-white border-t border-slate-50">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
          {BRANDING_FOOTER}
        </p>
      </footer>
    </div>
  );
};

export default LoginScreen;
