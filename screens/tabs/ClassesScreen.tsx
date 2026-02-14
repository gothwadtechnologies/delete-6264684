
import React, { useState } from 'react';
import { User, ClassSession } from '../../types';

const MOCK_CLASSES: ClassSession[] = [
  { id: '1', title: 'Mathematics - Trigonometry 101', instructor: 'Dr. Smith', time: 'LIVE - 10:00 AM', youtubeUrl: '#', type: 'live', modality: 'online' },
  { id: '2', title: 'Physics - Newton Laws', instructor: 'Prof. J. Doe', time: 'REPLAY', youtubeUrl: '#', type: 'recorded', modality: 'online' },
  { id: '3', title: 'Chemistry - Organic Bonds', instructor: 'Ms. Sarah', time: 'Upcoming - 2:00 PM', youtubeUrl: '#', type: 'live', modality: 'online' },
  { id: '4', title: 'Mathematics - Offline Workshop', instructor: 'Dr. Alok P.', time: 'At Center - 09:00 AM', youtubeUrl: '', type: 'live', modality: 'offline' },
  { id: '5', title: 'Physics - Lab Session', instructor: 'Mr. Pankaj S.', time: 'Floor 2, Lab B - 11:30 AM', youtubeUrl: '', type: 'live', modality: 'offline' },
];

const ClassesScreen: React.FC<{ user: User }> = () => {
  const [modality, setModality] = useState<'online' | 'offline'>('online');

  const filteredClasses = MOCK_CLASSES.filter(c => c.modality === modality);

  return (
    <div className="p-4 space-y-4">
      {/* Toggle Segmented Control */}
      <div className="bg-gray-100 p-1.5 rounded-2xl flex items-center mb-2">
        <button 
          onClick={() => setModality('online')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            modality === 'online' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-500 hover:bg-gray-200'
          }`}
        >
          <span>🌐</span> Online
        </button>
        <button 
          onClick={() => setModality('offline')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            modality === 'offline' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-gray-500 hover:bg-gray-200'
          }`}
        >
          <span>🏫</span> Offline
        </button>
      </div>

      {/* Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-gray-900 shadow-sm overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-lg font-black">{modality === 'online' ? 'Digital Classroom' : 'On-Campus Schedule'}</h3>
          <p className="text-gray-500 text-xs mt-1 font-medium">
            {modality === 'online' ? 'Watch live sessions from anywhere.' : 'Visit your local center for these classes.'}
          </p>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/40 rounded-full -mr-10 -mt-10 blur-xl"></div>
      </div>

      <div className="space-y-3">
        {filteredClasses.length > 0 ? (
          filteredClasses.map(cls => (
            <div key={cls.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                cls.type === 'live' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'
              }`}>
                {cls.modality === 'online' ? (cls.type === 'live' ? '🔴' : '🎬') : '📍'}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 text-sm truncate">{cls.title}</h4>
                <p className="text-xs text-gray-500 font-medium">{cls.instructor} • {cls.time}</p>
              </div>
              <button className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                modality === 'online' 
                  ? 'bg-blue-600 text-white active:scale-95' 
                  : 'bg-gray-900 text-white active:scale-95'
              }`}>
                {modality === 'online' ? 'Join' : 'Map'}
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400 font-bold text-sm">No {modality} classes today.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassesScreen;
