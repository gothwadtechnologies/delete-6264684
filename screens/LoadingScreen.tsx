
import React from 'react';
import { GlobalSettings } from '../types';
import { APP_NAME, BRANDING_FOOTER, BOOK_ICON } from '../constants';

const LoadingScreen: React.FC<{ settings: GlobalSettings }> = ({ settings }) => {
  return (
    <div className="flex-1 bg-white flex flex-col items-center justify-between p-10 pt-28 pb-4 overflow-hidden">
      {/* Top Section - 3 Open Book Icons */}
      <div className="flex items-end gap-3 animate-bounce">
        <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-2xl border border-blue-100 mb-2 opacity-50">
          {BOOK_ICON}
        </div>
        <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-2xl border-4 border-white transform scale-110 z-10">
          {BOOK_ICON}
        </div>
        <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-2xl border border-blue-100 mb-2 opacity-50">
          {BOOK_ICON}
        </div>
      </div>

      {/* Middle Section - 4 App Names (Straight/Non-Italic) */}
      <div className="flex flex-col items-center space-y-4">
        <h1 className="text-[10px] font-black text-gray-100 uppercase tracking-[2em]">{APP_NAME}</h1>
        <h1 className="text-xl font-black text-gray-200 uppercase tracking-[1em]">{APP_NAME}</h1>
        <h1 className="text-5xl font-black text-gray-900 uppercase tracking-tighter scale-y-110 animate-bounce">{APP_NAME}</h1>
        <h1 className="text-xl font-black text-blue-600/10 uppercase tracking-[1em]">{APP_NAME}</h1>
      </div>

      {/* Bottom Section - GOTHWAD TECHNOLOGIES Branding (Minimized and Fixed at very bottom) */}
      <div className="flex flex-col items-center w-full mt-auto">
        <div className="w-10 h-1 bg-blue-600 rounded-full mb-4"></div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-[10px] font-black text-black uppercase tracking-[0.3em] flex items-center gap-1.5">
            <span className="text-blue-600 text-xs">©</span> {BRANDING_FOOTER}
          </p>
          <div className="flex items-center gap-2 mt-0.5 opacity-10">
            <div className="h-[0.5px] w-8 bg-black"></div>
            <span className="text-[7px] font-bold uppercase tracking-widest text-black">EST 2024</span>
            <div className="h-[0.5px] w-8 bg-black"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
