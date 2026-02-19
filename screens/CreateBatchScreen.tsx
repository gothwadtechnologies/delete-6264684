
import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface CreateBatchScreenProps {
  userId: string;
  onClose: () => void;
}

const CreateBatchScreen: React.FC<CreateBatchScreenProps> = ({ userId, onClose }) => {
  const [name, setName] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [subject, setSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateBatch = async () => {
    if (!name || !classLevel || !subject) {
      setError('All fields are required.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      await addDoc(collection(db, 'batches'), {
        name,
        classLevel,
        subject,
        teacherId: userId,
        studentIds: [],
        createdAt: serverTimestamp(),
      });
      onClose();
    } catch (e: any) {
      console.error("Error creating batch: ", e);
      setError(e.message || 'Failed to create batch.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-xl p-5 m-4 w-full max-w-sm animate-in slide-in-from-bottom-10 duration-300" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Create New Batch</h3>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        <div className="space-y-4">
            <div className='space-y-1'>
                <label className='text-xs font-bold text-gray-500 px-1'>Batch Name</label>
                <input type="text" placeholder="e.g., Morning Physics" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 bg-gray-100 rounded-xl text-sm font-medium" />
            </div>
             <div className='space-y-1'>
                <label className='text-xs font-bold text-gray-500 px-1'>Class / Grade</label>
                <input type="text" placeholder="e.g., 12th Grade" value={classLevel} onChange={(e) => setClassLevel(e.target.value)} className="w-full p-3 bg-gray-100 rounded-xl text-sm font-medium" />
            </div>
            <div className='space-y-1'>
                <label className='text-xs font-bold text-gray-500 px-1'>Subject</label>
                <input type="text" placeholder="e.g., Physics" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full p-3 bg-gray-100 rounded-xl text-sm font-medium" />
            </div>

            {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}

            <div className="pt-2">
                <button onClick={handleCreateBatch} disabled={isLoading} className="w-full p-4 bg-blue-600 text-white rounded-xl font-bold text-sm disabled:bg-blue-300 active:scale-95 transition-all">
                    {isLoading ? 'Creating...' : 'Create Batch'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBatchScreen;
