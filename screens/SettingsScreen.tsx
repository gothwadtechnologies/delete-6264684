
import React, { useState } from 'react';
import { GlobalSettings } from '../types';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface SettingsScreenProps {
  settings: GlobalSettings;
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ settings, onBack }) => {
  const [formData, setFormData] = useState<GlobalSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, "config", "global"), formData);
      setMsg('Changes published to all users! 🚀');
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Error updating global configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  const primaryColors = [
    '#2563eb', // Blue
    '#dc2626', // Red
    '#16a34a', // Green
    '#9333ea', // Purple
    '#ea580c', // Orange
    '#0f172a', // Slate
    '#06b6d4', // Cyan
  ];

  const backgroundColors = [
    // Light Backgrounds
    { name: 'Pure White', value: '#ffffff', type: 'light' },
    { name: 'Slate Light', value: '#f8fafc', type: 'light' },
    { name: 'Ice Blue', value: '#f0f9ff', type: 'light' },
    { name: 'Mint Fresh', value: '#f0fdf4', type: 'light' },
    { name: 'Soft Sand', value: '#fafaf9', type: 'light' },
    // Dark Backgrounds
    { name: 'Midnight', value: '#0f172a', type: 'dark' },
    { name: 'Obsidian', value: '#111827', type: 'dark' },
    { name: 'Deep Forest', value: '#064e3b', type: 'dark' },
    { name: 'Royal Indigo', value: '#312e81', type: 'dark' },
    { name: 'Charcoal', value: '#1e293b', type: 'dark' },
  ];

  const logos = ['X', 'A+', '🎓', '📖', '🏛️', '⚡', '🌟', '🚀'];

  // Helper to check if the current BG is dark
  const isDarkBg = backgroundColors.find(b => b.value === formData.backgroundColor)?.type === 'dark';

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight leading-tight">Master Config</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Branding Tools</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-hide p-6 space-y-8">
        {/* Maintenance Toggle */}
        <div className={`p-6 rounded-3xl border transition-all ${formData.underMaintenance ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
           <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">App Status</h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  Maintenance: {formData.underMaintenance ? 'ON' : 'OFF'}
                </p>
              </div>
              <button 
                onClick={() => setFormData({...formData, underMaintenance: !formData.underMaintenance})}
                className={`w-14 h-8 rounded-full relative transition-colors ${formData.underMaintenance ? 'bg-amber-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${formData.underMaintenance ? 'right-1' : 'left-1'}`}></div>
              </button>
           </div>
        </div>

        {/* Live Preview Card */}
        <div className="relative p-8 rounded-[2rem] overflow-hidden flex flex-col items-center justify-center text-center shadow-2xl transition-all duration-500 min-h-[220px]"
             style={{ backgroundColor: formData.backgroundColor }}>
          <div className="absolute top-0 left-0 w-full h-full bg-black/5 pointer-events-none"></div>
          <div className="relative z-10">
             <div 
               className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-xl mb-4 mx-auto animate-bounce text-white border-2 border-white/20"
               style={{ backgroundColor: formData.primaryColor }}
             >
              {formData.logoEmoji}
            </div>
            <h3 className={`text-2xl font-black uppercase tracking-tighter mb-1 transition-colors duration-500 ${isDarkBg ? 'text-white' : 'text-gray-900'}`}>
              {formData.appName}
            </h3>
            <p className={`text-[10px] font-bold uppercase tracking-widest transition-colors duration-500 ${isDarkBg ? 'text-white/40' : 'text-gray-400'}`}>
              Live Experience Preview
            </p>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-6 pb-24">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">App Title</label>
            <input 
              className="w-full bg-gray-50 border border-gray-200 p-5 rounded-2xl font-black text-black focus:ring-4 outline-none transition-all"
              style={{ '--tw-ring-color': `${formData.primaryColor}20` } as any}
              value={formData.appName}
              onChange={(e) => setFormData({...formData, appName: e.target.value.toUpperCase()})}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Choose Global Icon</label>
            <div className="flex gap-3 flex-wrap justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
              {logos.map(l => (
                <button
                  key={l}
                  onClick={() => setFormData({...formData, logoEmoji: l})}
                  className={`w-12 h-12 rounded-xl border-2 transition-all flex items-center justify-center text-xl shadow-sm ${
                    formData.logoEmoji === l ? 'border-gray-900 bg-white scale-110 rotate-3' : 'border-transparent bg-white/50 hover:bg-white'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Universal Theme Color</label>
            <div className="flex gap-4 flex-wrap justify-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
              {primaryColors.map(c => (
                <button
                  key={c}
                  onClick={() => setFormData({...formData, primaryColor: c})}
                  className={`w-12 h-12 rounded-full border-4 transition-all shadow-md ${
                    formData.primaryColor === c ? 'border-gray-900 scale-125' : 'border-white'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">App Background Theme</label>
            <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              {backgroundColors.map(bg => (
                <button
                  key={bg.value}
                  onClick={() => setFormData({...formData, backgroundColor: bg.value})}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    formData.backgroundColor === bg.value ? 'border-gray-900 bg-white shadow-md' : 'border-transparent bg-white/50 hover:bg-white'
                  }`}
                >
                  <div 
                    className="w-full h-10 rounded-lg border border-gray-200 shadow-inner" 
                    style={{ backgroundColor: bg.value }}
                  />
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-900">{bg.name}</span>
                    <span className="text-[8px] font-bold uppercase tracking-tight text-gray-400">{bg.type}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Action Bar */}
      <div className="p-6 bg-white border-t border-gray-100 shrink-0">
        {msg && (
          <div className="mb-4 bg-gray-900 text-white p-4 rounded-xl text-center text-xs font-black animate-bounce tracking-widest">
            {msg}
          </div>
        )}
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-gray-900 text-white font-black py-5 rounded-2xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isSaving ? (
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span>💾</span>
              SAVE GLOBAL SETTINGS
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SettingsScreen;
