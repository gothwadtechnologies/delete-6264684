
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
    }
  }, [role]);

  const handleLoginAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      let loginEmail = identifier.trim();
      if (!loginEmail.includes('@')) {
        loginEmail = `${identifier.trim().toLowerCase()}@${role.toLowerCase()}.classesx.com`;
      }
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, password);
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      if (!userDoc.exists() || userDoc.data().role !== role) {
        throw new Error(`No ${role} account found with these credentials.`);
      }
      if (rememberMe) {
        localStorage.setItem(`remembered_id_${role}`, identifier);
      } else {
        localStorage.removeItem(`remembered_id_${role}`);
      }
      onLogin(userDoc.data() as User);
    } catch (err: any) {
      setError(err.message.includes('auth/invalid-credential') ? 'Invalid ID or password.' : err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleForgotPassword = async () => {
    if (!identifier) {
        setError('Please enter your ID/Email first to reset password.');
        return;
    }
    setIsLoading(true);
    setError('');
    setMsg('');
    try {
        let resetEmail = identifier.trim();
        if (!resetEmail.includes('@') && !isAdmin) {
            resetEmail = `${identifier.trim().toLowerCase()}@${role.toLowerCase()}.classesx.com`;
        }
        await sendPasswordResetEmail(auth, resetEmail);
        setMsg(`Password reset link sent to associated email.`);
    } catch (error) {
        setError('Failed to send reset link. Is the ID/Email correct?');
    } finally {
        setIsLoading(false);
    }
};

  return (
    <div className="font-sans bg-gray-50 flex flex-col h-full">
      <header className="px-4 py-4 flex items-center border-b border-gray-200">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-800 mx-auto pr-8">Sign In as {role}</h1>
      </header>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="pt-4 text-left">
          <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-1">Please sign in to continue.</p>
        </div>

        <form onSubmit={handleLoginAction} className="space-y-4 pt-4">
          <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">{isAdmin ? 'Email Address' : 'Your ID'}</label>
              <input
                  type={isAdmin ? "email" : "text"}
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder={isAdmin ? "admin@example.com" : "Enter your unique ID"}
                  className="w-full bg-white border border-gray-300 px-4 py-3 rounded-xl text-base text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-400"
              />
          </div>

          <div className="relative">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-gray-300 px-4 py-3 rounded-xl text-base text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-400 pr-10"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
            >
                {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C3.732 4.943 9.522 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-9.064 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.523l8.367 8.367zm1.414-1.414L6.523 5.11A6 6 0 0114.89 13.477zM4.223 4.223a.75.75 0 00-1.06 1.06l12 12a.75.75 0 001.06-1.06l-12-12z" clipRule="evenodd" /></svg>
                )}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember ID</label>
            </div>
            <div className="text-sm">
              <button type="button" onClick={handleForgotPassword} className="font-medium text-blue-600 hover:underline">Forgot Password?</button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-lg font-medium">{error}</p>}
          {msg && <p className="text-sm text-green-700 bg-green-100 p-3 rounded-lg font-medium">{msg}</p>}

          <button 
            type="submit" 
            disabled={isLoading || !identifier || !password}
            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl text-base uppercase shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {isLoading ? 'Signing In...' : 'Login'}
          </button>
        </form>
      </div>

      <footer className="p-5 text-center shrink-0">
        <span className="inline-block bg-gray-900 text-gray-100 text-[10px] font-bold tracking-widest uppercase px-4 py-2 rounded-full">
        © 2026 {BRANDING_FOOTER}
        </span>
      </footer>
    </div>
  );
};

export default LoginScreen;
