
import React, { useState } from 'react';
import { Batch, User } from '@/types';
import { db } from '@/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, writeBatch } from 'firebase/firestore';

interface EditStudentScreenProps {
  student: User;
  currentBatch: Batch;
  allBatches: Batch[];
  onClose: () => void;
  onSave: (student: User, newBatchId: string) => void;
}

const EditStudentScreen: React.FC<EditStudentScreenProps> = ({ student, currentBatch, allBatches, onClose, onSave }) => {
  const [name, setName] = useState(student.name);
  const [email, setEmail] = useState(student.email || '');
  const [password, setPassword] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>(currentBatch.id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveChanges = async () => {
    if (!name || !email) {
      setError('Name and email are required.');
      return;
    }
    setIsLoading(true);
    setError(null);

    const newBatch = allBatches.find(b => b.id === selectedBatchId);
    if (!newBatch) {
        setError("Selected batch not found.");
        setIsLoading(false);
        return;
    }

    try {
        const batchWriter = writeBatch(db);
        const userRef = doc(db, 'users', student.uid);

        const userUpdateData: any = {
            name,
            email,
            classLevel: newBatch.classLevel
        };
        
        if (password) {
            // NOTE: This updates the password in the Firestore document.
            // A secure implementation would use a Cloud Function to update the Firebase Auth user password.
            userUpdateData.password = password;
        }

        batchWriter.update(userRef, userUpdateData);

        if (currentBatch.id !== newBatch.id) {
            const oldBatchRef = doc(db, 'batches', currentBatch.id);
            batchWriter.update(oldBatchRef, { studentIds: arrayRemove(student.uid) });

            const newBatchRef = doc(db, 'batches', newBatch.id);
            batchWriter.update(newBatchRef, { studentIds: arrayUnion(student.uid) });
        }

        await batchWriter.commit();
        
        const updatedStudent = { ...student, ...userUpdateData };
        onSave(updatedStudent, newBatch.id);

    } catch (e: any) {
        console.error("Error updating student: ", e);
        setError(e.message || 'Failed to update student.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white flex flex-col animate-in slide-in-from-bottom-full duration-300 z-40">
       <div className="p-3 border-b border-gray-100 flex items-center gap-3 bg-white shrink-0">
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-black text-gray-900 tracking-tight uppercase">Edit Student Details</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className='space-y-1'>
            <label className='text-xs font-bold text-gray-500 px-1'>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-gray-100 border-gray-200 rounded-xl text-sm font-medium transition-all focus:bg-white focus:shadow-lg focus:shadow-blue-50"
            />
        </div>
        <div className='space-y-1'>
            <label className='text-xs font-bold text-gray-500 px-1'>Login Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-100 border-gray-200 rounded-xl text-sm font-medium transition-all focus:bg-white focus:shadow-lg focus:shadow-blue-50"
            />
        </div>
        <div className='space-y-1'>
            <label className='text-xs font-bold text-gray-500 px-1'>Change Password</label>
            <input
              type="password"
              placeholder="Leave blank to keep current password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-100 border-gray-200 rounded-xl text-sm font-medium transition-all focus:bg-white focus:shadow-lg focus:shadow-blue-50"
            />
        </div>
        <div className='space-y-1'>
            <label className='text-xs font-bold text-gray-500 px-1'>Move to Batch</label>
            <select 
                value={selectedBatchId} 
                onChange={e => setSelectedBatchId(e.target.value)}
                className='w-full p-3 bg-gray-100 border-gray-200 rounded-xl text-sm font-medium transition-all focus:bg-white focus:shadow-lg focus:shadow-blue-50 appearance-none'>
                {allBatches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.classLevel})</option>)}
            </select>
        </div>
        {error && <p className="text-red-500 text-xs text-center font-bold p-2 bg-red-50 rounded-lg">{error}</p>}
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <button
          onClick={handleSaveChanges}
          disabled={isLoading}
          className="w-full p-4 bg-blue-600 text-white rounded-xl font-bold text-sm disabled:bg-blue-300 active:scale-95 transition-all shadow-lg shadow-blue-100"
        >
          {isLoading ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default EditStudentScreen;
