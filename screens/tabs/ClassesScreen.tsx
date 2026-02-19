
import React, { useState, useEffect } from 'react';
import { User, ClassSession, UserRole } from '../../types';
import { db } from '../../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

interface ClassesScreenProps {
    user: User;
    onAddClass: () => void; // Assuming a function to add a new class
}

const ClassesScreen: React.FC<ClassesScreenProps> = ({ user, onAddClass }) => {
  const [modality, setModality] = useState<'online' | 'offline'>('online');
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    
    const q = user.role === UserRole.ADMIN 
      ? collection(db, 'classes')
      : query(collection(db, 'classes'), where('batchId', '==', user.studentId || ''));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const classList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ClassSession));
      setClasses(classList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching classes: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredClasses = classes.filter(c => c.modality === modality);

  return (
    <div className="p-4 space-y-4">
        <div className="flex items-center justify-between mb-2">
            <div>
                <h2 className="text-xl font-bold text-gray-800">Available Classes</h2>
                <p className="text-sm text-gray-500">Your scheduled classes are listed below</p>
            </div>
            {user.role === UserRole.ADMIN && (
                <button 
                    onClick={onAddClass} 
                    className="bg-blue-600 text-white rounded-xl w-10 h-10 flex items-center justify-center shadow-lg shadow-blue-200/50 active:scale-95 transition-all"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" /></svg>
                </button>
            )}
        </div>
      {/* Toggle Segmented Control */}
      <div className="bg-gray-100 p-1.5 rounded-2xl flex items-center">
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
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-400 font-bold text-sm">Loading classes...</p>
          </div>
        ) : filteredClasses.length > 0 ? (
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
