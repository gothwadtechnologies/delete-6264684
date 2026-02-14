
import React, { useState } from 'react';
import { User, UserRole, GlobalSettings } from '../types.ts';
import { auth, db } from '../firebase.ts';
import { updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, updateDoc, getDocs, collection } from 'firebase/firestore';

interface ProfileScreenProps {
  user: User;
  settings: GlobalSettings;
  onBack: () => void;
  onUpdateUser: (updated: Partial<User>) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, settings, onBack, onUpdateUser }) => {
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  // States
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email || '');
  const [emailVerifyPass, setEmailVerifyPass] = useState('');
  const [showEmailVerifyPass, setShowEmailVerifyPass] = useState(false);
  const [emailStep, setEmailStep] = useState(1); // 1: Input, 2: Verify

  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });

  const showMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleUpdateName = async () => {
    if (!name.trim() || name === user.name) return;
    setLoading('name');
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name });
        await updateDoc(doc(db, 'users', user.uid), { name: name });
        onUpdateUser({ name });
        showMsg("Name updated successfully!");
      }
    } catch (e: any) { showMsg(e.message, 'error'); }
    finally { setLoading(null); }
  };

  const handleEmailNext = () => {
    if (!email.trim() || email === user.email) {
      showMsg("Please enter a new email address", 'error');
      return;
    }
    setEmailStep(2);
  };

  const handleUpdateEmail = async () => {
    if (!emailVerifyPass) return;
    setLoading('email');
    try {
      if (auth.currentUser && auth.currentUser.email) {
        const credential = EmailAuthProvider.credential(auth.currentUser.email, emailVerifyPass);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updateEmail(auth.currentUser, email);
        await updateDoc(doc(db, 'users', user.uid), { email });
        onUpdateUser({ email });
        showMsg("Email updated successfully!");
        setEmailStep(1);
        setEmailVerifyPass('');
      }
    } catch (e: any) { showMsg(e.message, 'error'); }
    finally { setLoading(null); }
  };

  const handleUpdatePassword = async () => {
    if (!oldPass || !newPass || newPass !== confirmPass) {
      showMsg("Check your passwords", 'error');
      return;
    }
    setLoading('password');
    try {
      if (auth.currentUser && auth.currentUser.email) {
        const credential = EmailAuthProvider.credential(auth.currentUser.email, oldPass);
        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPass);
        setOldPass(''); setNewPass(''); setConfirmPass('');
        showMsg("Password secured!");
      }
    } catch (e: any) { showMsg(e.message, 'error'); }
    finally { setLoading(null); }
  };

  const handleToggleMaintenance = async () => {
    if (user.role !== UserRole.ADMIN) return;
    try {
      const newState = !settings.underMaintenance;
      await updateDoc(doc(db, 'config', 'global'), { underMaintenance: newState });
      showMsg(`Maintenance: ${newState ? 'ON' : 'OFF'}`);
    } catch (e: any) { showMsg(e.message, 'error'); }
  };

  const handleExtractData = async () => {
    if (user.role !== UserRole.ADMIN) return;
    showMsg("Extracting backup...");
    try {
      const allData: any = {};
      const cols = ['users', 'batches', 'notifications', 'config'];
      for (const col of cols) {
        const snap = await getDocs(collection(db, col));
        allData[col] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      }
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (e: any) { showMsg("Extraction failed", 'error'); }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ backgroundColor: settings.backgroundColor }}>
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
          <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Security Vault</h2>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-hide p-4 space-y-6 pb-24">
        {message && (
          <div className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-lg animate-in fade-in slide-in-from-top-2 z-50 ${
            message.type === 'success' ? 'bg-green-600 text-white border-green-700' : 'bg-red-600 text-white border-red-700'
          }`}>
            {message.type === 'success' ? '✓' : '✕'} {message.text}
          </div>
        )}

        {/* Profile Avatar */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-gray-900 flex items-center justify-center text-white text-4xl font-black shadow-xl mb-3 border-2 border-white">
            {user.name.charAt(0)}
          </div>
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight leading-none">{user.name}</h3>
          <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-1 px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
            {user.role} Status
          </p>
        </div>

        {/* Identity Card */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Account Credentials</p>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-5">
            
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Display Name</label>
              <div className="flex gap-2">
                <input 
                  className="flex-1 bg-gray-50 border border-gray-100 p-3.5 rounded-xl font-bold text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <button 
                  onClick={handleUpdateName}
                  disabled={loading === 'name' || name === user.name}
                  className="bg-gray-900 text-white px-5 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-md disabled:opacity-20"
                >
                  {loading === 'name' ? '...' : 'Save'}
                </button>
              </div>
            </div>

            <div className="space-y-1.5 pt-4 border-t border-gray-50">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Email Recovery</label>
              {emailStep === 1 ? (
                <div className="flex gap-2 animate-in fade-in">
                  <input 
                    type="email"
                    className="flex-1 bg-gray-50 border border-gray-100 p-3.5 rounded-xl font-bold text-sm text-gray-900 outline-none"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                  <button onClick={handleEmailNext} className="bg-blue-600 text-white px-5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md">Next</button>
                </div>
              ) : (
                <div className="space-y-3 animate-in slide-in-from-right-2">
                   <div className="bg-blue-50/50 p-3 rounded-xl flex items-center justify-between border border-blue-100">
                      <span className="text-[10px] font-bold text-blue-700 truncate">{email}</span>
                      <button onClick={() => setEmailStep(1)} className="text-[9px] font-black text-blue-800 underline">Edit</button>
                   </div>
                   <div className="relative">
                      <input 
                        type={showEmailVerifyPass ? "text" : "password"}
                        className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl font-bold text-sm text-gray-900 outline-none"
                        placeholder="Verify Password"
                        value={emailVerifyPass}
                        onChange={e => setEmailVerifyPass(e.target.value)}
                      />
                      <button onClick={() => setShowEmailVerifyPass(!showEmailVerifyPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-lg grayscale opacity-40">
                        {showEmailVerifyPass ? '👁️' : '🙈'}
                      </button>
                   </div>
                   <button 
                    onClick={handleUpdateEmail}
                    disabled={loading === 'email'}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all"
                   >
                    {loading === 'email' ? 'Syncing...' : 'Update Email'}
                   </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Password Card */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Privacy Layer</p>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
            <div className="relative">
              <input 
                type={showPass.old ? "text" : "password"}
                className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl font-bold text-sm text-gray-900 outline-none"
                placeholder="Current Password"
                value={oldPass}
                onChange={e => setOldPass(e.target.value)}
              />
              <button onClick={() => setShowPass({...showPass, old: !showPass.old})} className="absolute right-4 top-1/2 -translate-y-1/2 text-lg grayscale opacity-30">
                {showPass.old ? '👁️' : '🙈'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <input 
                  type={showPass.new ? "text" : "password"}
                  className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl font-bold text-sm text-gray-900 outline-none"
                  placeholder="New"
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                />
                <button onClick={() => setShowPass({...showPass, new: !showPass.new})} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm grayscale opacity-30">
                  {showPass.new ? '👁️' : '🙈'}
                </button>
              </div>
              <div className="relative">
                <input 
                  type={showPass.confirm ? "text" : "password"}
                  className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl font-bold text-sm text-gray-900 outline-none"
                  placeholder="Confirm"
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                />
                <button onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm grayscale opacity-30">
                  {showPass.confirm ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            <button 
              onClick={handleUpdatePassword}
              disabled={loading === 'password'}
              className="w-full bg-gray-900 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all mt-1"
            >
              {loading === 'password' ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </div>

        {/* Admin Section */}
        {user.role === UserRole.ADMIN && (
          <div className="space-y-3">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">Admin Tools</p>
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={handleToggleMaintenance}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  settings.underMaintenance ? 'bg-amber-500 border-amber-600 text-white' : 'bg-white border-gray-100 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🚧</span>
                  <div className="text-left">
                    <h5 className="text-[10px] font-black uppercase">Maintenance</h5>
                    <p className={`text-[8px] font-bold uppercase ${settings.underMaintenance ? 'text-white/60' : 'text-gray-400'}`}>
                      {settings.underMaintenance ? 'Offline' : 'Online'}
                    </p>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full relative ${settings.underMaintenance ? 'bg-white/20' : 'bg-gray-200'}`}>
                  <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all ${settings.underMaintenance ? 'right-0.5' : 'left-0.5'}`}></div>
                </div>
              </button>

              <button 
                onClick={handleExtractData}
                className="flex items-center justify-between p-4 rounded-2xl bg-indigo-600 text-white shadow-md active:scale-95 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">💾</span>
                  <div className="text-left">
                    <h5 className="text-[10px] font-black uppercase">Export Backup</h5>
                    <p className="text-[8px] text-white/60 font-bold uppercase tracking-widest">Firestore Dump</p>
                  </div>
                </div>
                <span className="text-xs opacity-40">📊</span>
              </button>
            </div>
          </div>
        )}

        <div className="text-center py-4 opacity-30">
           <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em]">GOTHWAD TECHNOLOGIES</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
