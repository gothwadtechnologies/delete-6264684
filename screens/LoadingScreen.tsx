
import React from 'react';
import { GlobalSettings } from '../types';

interface LoadingScreenProps {
  settings: GlobalSettings;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ settings }) => {
  return (
    <div className="flex-1 bg-white flex flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center animate-pulse">
        <div 
          className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg mb-4"
          style={{ backgroundColor: settings.primaryColor }}
        >
          <span className="text-white text-4xl font-black italic">{settings.logoEmoji}</span>
        </div>
        <h1 className="text-3xl font-black tracking-tighter text-gray-800 uppercase">{settings.appName}</h1>
        <p className="text-gray-500 mt-2 font-medium">Empowering Education</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
