
import React, { useState, useEffect } from 'react';
import { User, Batch, UserRole } from '../../types';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { BOOK_ICON } from '../../constants';

interface BatchesScreenProps {
  user: User;
  onSelectBatch: (batch: Batch) => void;
  onAddBatch: () => void;
  searchQuery: string;
}

const BatchesScreen: React.FC<BatchesScreenProps> = ({ user, onSelectBatch, onAddBatch, searchQuery }) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    const q = user.role === UserRole.ADMIN 
      ? query(collection(db, "batches"), orderBy('createdAt', 'desc'))
      : query(collection(db, "batches"), where("studentIds", "array-contains", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const batchData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Batch[];
      setBatches(batchData);
      setIsLoading(false);
    }, (error) => {
        console.error("Error fetching batches: ", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid, user.role]);

  const filteredBatches = batches.filter(batch => 
    batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (batch.classLevel && batch.classLevel.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return <p className="text-center p-8 text-gray-500 animate-pulse">Loading your batches...</p>;
  }

  return (
    <div className="relative min-h-[calc(100vh-280px)]">
      <div className="p-4">
        
        <div className="flex items-center justify-between mb-4">
            <div>
                <h2 className="text-xl font-bold text-gray-800">Available Batches</h2>
                <p className="text-sm text-gray-500">Your current batches are listed below</p>
            </div>
            {user.role === UserRole.ADMIN && (
                <button 
                    onClick={onAddBatch} 
                    className="bg-blue-600 text-white rounded-xl w-10 h-10 flex items-center justify-center shadow-lg shadow-blue-200/50 active:scale-95 transition-all"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" /></svg>
                </button>
            )}
        </div>

        {filteredBatches.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredBatches.map((batch, index) => (
              <div 
                key={batch.id} 
                onClick={() => onSelectBatch(batch)} 
                className="bg-gray-800 p-4 rounded-2xl shadow-lg shadow-gray-400/30 cursor-pointer transition-all active:scale-[0.98] active:shadow-xl relative overflow-hidden"
              >
                <div className="relative z-10">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="font-black text-white text-lg tracking-tight">{batch.name}</h3>
                            <p className="text-sm font-bold text-white/80 mt-1">{batch.classLevel} - {batch.subject}</p>
                        </div>
                        <div className="text-4xl ml-4 opacity-20 text-white">{BOOK_ICON || '📚'}</div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t-2 border-white/20">
                        <div className="flex items-center">
                            <div className="flex -space-x-2 overflow-hidden">
                                <div className="inline-block h-8 w-8 rounded-full bg-white/20 text-xs flex items-center justify-center text-white font-bold border-2 border-white/50">
                                    +{batch.studentIds?.length || 0}
                                </div>
                            </div>
                            <p className="text-xs font-bold text-white ml-3">{batch.studentIds?.length || 0} Students</p>
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-white/70">View Details</span>
                    </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 pt-16">
            <p className="font-bold text-lg">No batches found.</p>
            {user.role === UserRole.ADMIN && <p className="text-sm mt-2">Click the '+' button above to create a new one.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchesScreen;
