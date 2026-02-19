
import React, { useState, useEffect } from 'react';
import { Batch, UserRole } from '../../types';
import { db } from '../../firebase';
import { collection, doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';

interface AddStudentScreenProps {
  initialBatch: Batch;
  allBatches: Batch[];
  onClose: () => void;
}

const AddStudentScreen: React.FC<AddStudentScreenProps> = ({ initialBatch, allBatches, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>(initialBatch.id);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateStudent = async () => {
    if (!name || !email || !password || !selectedBatchId) {
      setError('All fields are required.');
      return;
    }
    setIsLoading(true);
    setError(null);

    const targetBatch = allBatches.find(b => b.id === selectedBatchId);
    if (!targetBatch) {
        setError("Selected batch not found. Please try again.");
        setIsLoading(false);
        return;
    }

    try {
      const newStudentUid = doc(collection(db, 'users')).id;

      await setDoc(doc(db, 'users', newStudentUid), {
        uid: newStudentUid,
        name,
        email,
        role: UserRole.STUDENT,
        classLevel: targetBatch.classLevel, 
        createdAt: new Date(),
      });

      await updateDoc(doc(db, 'batches', targetBatch.id), {
        studentIds: arrayUnion(newStudentUid)
      });

      onClose();
    } catch (e: any) {
      console.error("Error creating student: ", e);
      setError(e.message || 'Failed to create student.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const selectedBatchForTitle = allBatches.find(b => b.id === selectedBatchId) || initialBatch;

  return (
    <div className="fixed inset-0 bg-white flex flex-col animate-in slide-in-from-bottom-full duration-300 z-30">
      <div className="p-3 border-b border-gray-100 flex items-center gap-3 bg-white shrink-0">
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-black text-gray-900 tracking-tight uppercase">Add New Student</h2>
          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Enroll in: {selectedBatchForTitle.name}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className='space-y-1'>
            <label className='text-xs font-bold text-gray-500 px-1'>Batch</label>
            <select 
                value={selectedBatchId} 
                onChange={e => setSelectedBatchId(e.target.value)}
                className='w-full p-3 bg-gray-100 border-gray-200 rounded-xl text-sm font-medium transition-all focus:bg-white focus:shadow-lg focus:shadow-blue-50 appearance-none'>
                {allBatches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.classLevel})</option>)}
            </select>
        </div>
        <div className='space-y-1'>
            <label className='text-xs font-bold text-gray-500 px-1'>Full Name</label>
            <input
              type="text"
              placeholder="Student's full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-gray-100 border-gray-200 rounded-xl text-sm font-medium transition-all focus:bg-white focus:shadow-lg focus:shadow-blue-50"
            />
        </div>
        <div className='space-y-1'>
            <label className='text-xs font-bold text-gray-500 px-1'>Login Email</label>
            <input
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-100 border-gray-200 rounded-xl text-sm font-medium transition-all focus:bg-white focus:shadow-lg focus:shadow-blue-50"
            />
        </div>
        <div className='space-y-1'>
            <label className='text-xs font-bold text-gray-500 px-1'>Password</label>
            <input
              type="password"
              placeholder="Create a secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-100 border-gray-200 rounded-xl text-sm font-medium transition-all focus:bg-white focus:shadow-lg focus:shadow-blue-50"
            />
        </div>

        {error && <p className="text-red-500 text-xs text-center font-bold p-2 bg-red-50 rounded-lg">{error}</p>}
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <button
          onClick={handleCreateStudent}
          disabled={isLoading}
          className="w-full p-4 bg-blue-600 text-white rounded-xl font-bold text-sm disabled:bg-blue-300 active:scale-95 transition-all shadow-lg shadow-blue-100"
        >
          {isLoading ? 'Creating Student...' : 'Create & Enroll Student'}
        </button>
      </div>
    </div>
  );
};

export default AddStudentScreen;
