
import React, { useState, useEffect } from 'react';
import { GlobalSettings, UserRole, User } from '../types';
import { doc, updateDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { APP_NAME, BRANDING_FOOTER } from '../constants';

interface SettingsScreenProps {
  settings: GlobalSettings;
  onBack: () => void;
  user: User;
  initialSubView?: 'MAIN' | 'ABOUT' | 'AI' | 'PRIVACY';
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ settings, onBack, user, initialSubView = 'MAIN' }) => {
  const [underMaintenance, setUnderMaintenance] = useState(settings.underMaintenance);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSubView, setActiveSubView] = useState<'MAIN' | 'ABOUT' | 'AI' | 'PRIVACY'>(initialSubView);

  useEffect(() => {
    setActiveSubView(initialSubView);
  }, [initialSubView]);

  const handleMaintenanceToggle = async () => {
    if (isSaving) return;
    
    // Optimistic Update to remove lag
    const originalState = underMaintenance;
    const newState = !originalState;
    setUnderMaintenance(newState);
    
    setIsSaving(true);
    try {
      if (db) {
        await updateDoc(doc(db, "config", "global"), { underMaintenance: newState });
      }
    } catch (e) { 
      // Rollback on error
      setUnderMaintenance(originalState);
      alert("Update failed. Check connection."); 
    }
    finally { setIsSaving(false); }
  };

  const handleFullBackup = async () => {
    setIsSaving(true);
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
      a.download = `${APP_NAME}_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (e) { alert("Backup failed."); }
    finally { setIsSaving(false); }
  };

  if (activeSubView === 'ABOUT') return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="p-5 border-b border-gray-100 flex items-center gap-4 shrink-0"><button onClick={() => setActiveSubView('MAIN')} className="p-2 bg-gray-50 rounded-xl text-gray-900">←</button><h2 className="text-sm font-black uppercase tracking-tight">About {APP_NAME}</h2></div>
      <div className="flex-1 overflow-y-auto p-8 space-y-6 text-center scroll-hide">
        <div className="w-24 h-24 bg-gray-900 rounded-[2rem] flex items-center justify-center text-white text-4xl mx-auto shadow-2xl">X</div>
        <div>
          <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{APP_NAME}</h3>
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mt-1">Premium Education Node</p>
        </div>
        <p className="text-[11px] font-medium text-gray-500 leading-loose">Dedicated to providing world-class educational tools for competitive exams. Built and maintained by {BRANDING_FOOTER}.</p>
        <div className="pt-10"><p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Version 2.4.0 (Stable)</p></div>
      </div>
    </div>
  );

  if (activeSubView === 'AI') return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="p-5 border-b border-gray-100 flex items-center gap-4 shrink-0"><button onClick={() => setActiveSubView('MAIN')} className="p-2 bg-gray-50 rounded-xl text-gray-900">←</button><h2 className="text-sm font-black uppercase tracking-tight">AI Configuration</h2></div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-hide">
        <div className="bg-purple-600 p-6 rounded-3xl text-white shadow-xl shadow-purple-100">
           <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">✨</div>
             <h4 className="font-black text-sm uppercase tracking-widest leading-none">Edu AI Logic</h4>
           </div>
           <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest leading-relaxed">Model: Gemini 3 Pro Preview<br/>Context: JEE/NEET/Boards<br/>Response Mode: Concise Academic</p>
        </div>
        <div className="p-4 border-2 border-dashed border-gray-100 rounded-2xl">
           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">AI behavior is globally managed by the {BRANDING_FOOTER} core team.</p>
        </div>
      </div>
    </div>
  );

  if (activeSubView === 'PRIVACY') return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center gap-4 shrink-0"><button onClick={() => setActiveSubView('MAIN')} className="p-2 bg-gray-50 rounded-xl text-gray-900">←</button><h2 className="text-sm font-black uppercase tracking-tight">Privacy Policy</h2></div>
      <div className="flex-1 overflow-y-auto p-8 space-y-6 scroll-hide">
        <h3 className="font-black text-gray-900 uppercase tracking-tight text-lg">Data Protection</h3>
        <p className="text-xs font-medium text-gray-500 leading-loose">We prioritize student data security. All communications are encrypted via SSL. We do not sell user data to third parties. Your registration identifiers are used strictly for academic tracking.</p>
        <div className="h-px bg-gray-100 w-full" />
        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Last Updated: October 2024</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="p-5 border-b border-gray-100 flex items-center gap-4 shrink-0 bg-white">
        <button onClick={onBack} className="p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div>
          <h2 className="text-sm font-black text-gray-900 tracking-tight uppercase leading-none">Control Center</h2>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">App Infrastructure</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-hide">
        <div className="space-y-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">System Control</p>
          <div className="bg-rose-600 p-6 rounded-[2.5rem] text-white flex justify-between items-center shadow-2xl shadow-rose-100 group transition-all">
             <div className="text-left">
               <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-1">Maintenance Mode</h4>
               <p className="text-[8px] text-white/60 font-black uppercase tracking-widest italic">LOCKED TO ADMIN ONLY</p>
             </div>
             <button 
              disabled={isSaving}
              onClick={handleMaintenanceToggle} 
              className={`w-14 h-8 rounded-full relative transition-all ${underMaintenance ? 'bg-white shadow-inner' : 'bg-white/30'}`}
             >
                <div className={`absolute top-1.5 w-5 h-5 rounded-full transition-all duration-300 ${underMaintenance ? 'right-1.5 bg-rose-600 scale-110' : 'left-1.5 bg-white'}`}></div>
             </button>
          </div>

          <button 
            disabled={isSaving}
            onClick={handleFullBackup}
            className="w-full bg-gray-900 p-6 rounded-[2.5rem] flex items-center justify-between text-white shadow-2xl shadow-gray-200 active:scale-95 transition-all"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl border border-white/5">💾</div>
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-widest">Full Data Backup</h4>
                <p className="text-[8px] text-white/40 font-black uppercase tracking-widest mt-0.5 italic">Export All Collections</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">→</div>
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Advanced Configuration</p>
          <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
             <SettingsRow icon="✨" label="AI Configuration" desc="Engine & Logic Setup" onClick={() => setActiveSubView('AI')} />
             <div className="h-px bg-gray-50 mx-6" />
             <SettingsRow icon="🏛️" label="About Section" desc="App Core & Version" onClick={() => setActiveSubView('ABOUT')} />
             <div className="h-px bg-gray-50 mx-6" />
             <SettingsRow icon="⚖️" label="Privacy Policy" desc="Security & Data Rights" onClick={() => setActiveSubView('PRIVACY')} />
          </div>
        </div>

        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex items-center gap-4">
           <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl">💡</div>
           <p className="text-[10px] font-bold text-blue-700 leading-relaxed uppercase tracking-widest">Your configuration is synchronized across all institute nodes.</p>
        </div>
      </div>
      <div className="p-6 border-t border-gray-50 bg-gray-50/30">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.4em] text-center italic">{BRANDING_FOOTER} CORE ENGINE</p>
      </div>
    </div>
  );
};

const SettingsRow: React.FC<{ icon: string; label: string; desc: string; onClick: () => void }> = ({ icon, label, desc, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-6 hover:bg-gray-50 active:bg-gray-100 transition-all text-left">
    <div className="flex items-center gap-4">
      <div className="text-2xl w-8 flex justify-center opacity-80">{icon}</div>
      <div>
        <h4 className="text-[11px] font-black uppercase text-gray-900 tracking-tight leading-none">{label}</h4>
        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">{desc}</p>
      </div>
    </div>
    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
    </div>
  </button>
);

export default SettingsScreen;
