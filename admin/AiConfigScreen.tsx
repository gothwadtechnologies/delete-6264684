
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Cpu, Save, ChevronLeft, Sparkles } from 'lucide-react';
import { GlobalSettings } from '../common/types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../common/firebase';

interface AiConfigScreenProps {
  settings: GlobalSettings;
  onBack: () => void;
}

const AiConfigScreen: React.FC<AiConfigScreenProps> = ({ settings, onBack }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [visibleModels, setVisibleModels] = useState<Record<number, boolean>>({});
  const [aiConfig, setAiConfig] = useState({
    aiApiKey: settings.aiApiKey || '',
    aiModel1: settings.aiModel1 || '',
    aiModel2: settings.aiModel2 || '',
    aiModel3: settings.aiModel3 || '',
    aiModel4: settings.aiModel4 || '',
    aiModel5: settings.aiModel5 || '',
  });

  const toggleModelVisibility = (num: number) => {
    setVisibleModels(prev => ({ ...prev, [num]: !prev[num] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (db) {
        await updateDoc(doc(db, "config", "global"), { ...aiConfig });
        alert("AI Configuration saved successfully!");
      }
    } catch (e) {
      alert("Failed to save AI configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Header - Blue */}
      <div className="p-5 bg-blue-600 border-b border-blue-700 flex items-center gap-4 shrink-0 shadow-lg">
        <button onClick={onBack} className="p-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-all active:scale-90 border border-white/10">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h2 className="text-sm font-black text-white tracking-tight uppercase leading-none">AI Engine Setup</h2>
          <p className="text-[9px] font-bold text-blue-100 uppercase tracking-widest mt-1">Admin Configuration</p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar pb-40">
        {/* API Key Section */}
        <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl border border-white/5">🔑</div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-widest leading-none">Global API Key</h4>
              <p className="text-[8px] text-white/40 font-black uppercase tracking-widest mt-1">Master Key for all AI services</p>
            </div>
          </div>
          
          <div className="relative">
            <input 
              type={showApiKey ? "text" : "password"}
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-xs font-bold text-white outline-none focus:bg-white/10 transition-all pr-12"
              placeholder="Enter API Key"
              value={aiConfig.aiApiKey}
              onChange={e => setAiConfig({...aiConfig, aiApiKey: e.target.value})}
            />
            <button 
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Model Slots */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model ID Slots</p>
            <Sparkles className="w-3 h-3 text-purple-400" />
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {[1, 2, 3, 4, 5].map(num => (
              <div key={num} className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center text-[10px] font-black border border-slate-100 shrink-0">
                  M{num}
                </div>
                <div className="flex-1 relative">
                  <input 
                    type={visibleModels[num] ? "text" : "password"}
                    className="w-full bg-transparent p-0 text-xs font-bold text-slate-900 outline-none placeholder:text-slate-200 pr-10"
                    placeholder={`Model ID ${num}`}
                    value={(aiConfig as any)[`aiModel${num}`]}
                    onChange={e => setAiConfig({...aiConfig, [`aiModel${num}`]: e.target.value})}
                  />
                  <button 
                    onClick={() => toggleModelVisibility(num)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    {visibleModels[num] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-center gap-4">
           <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl shrink-0">💡</div>
           <p className="text-[9px] font-bold text-blue-700 leading-relaxed uppercase tracking-widest">
             Models configured here will appear in the student's AI chat interface. Ensure IDs match the provider's naming convention.
           </p>
        </div>
      </div>

      {/* Fixed Bottom Save Button */}
      <div className="p-5 bg-white border-t border-slate-100 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-100 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Configuration
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AiConfigScreen;
