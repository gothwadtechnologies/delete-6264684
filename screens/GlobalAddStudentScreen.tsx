
import React, { useState } from 'react';
import { Batch, UserRole } from '../types';
import { db } from '../firebase';
import { collection, doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';

interface GlobalAddStudentScreenProps {
  allBatches: Batch[];
  onClose: () => void;
}

const GlobalAddStudentScreen: React.FC<GlobalAddStudentScreenProps> = ({ allBatches, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Default to the first batch in the list, if available
  const [selectedBatchId, setSelectedBatchId] = useState<string>(allBatches.length > 0 ? allBatches[0].id : '');
  
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
      // This creates a new unique ID for the user
      const newStudentUid = doc(collection(db, 'users')).id;

      // Create the user document in the 'users' collection
      await setDoc(doc(db, 'users', newStudentUid), {
        uid: newStudentUid,
        name,
        email,
        role: UserRole.STUDENT,
        classLevel: targetBatch.classLevel, 
        createdAt: new Date(),
        // Note: We are not setting the auth password here. This requires a backend function for security.
      });

      // Add the student's UID to the selected batch
      await updateDoc(doc(db, 'batches', targetBatch.id), {
        studentIds: arrayUnion(newStudentUid)
      });

      onClose(); // Close the modal on success
    } catch (e: any) {
      console.error("Error creating student: ", e);
      setError(e.message || 'Failed to create student.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-xl p-5 m-4 w-full max-w-sm animate-in slide-in-from-bottom-10 duration-300" onClick={e => e.stopPropagation()}>
        
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Add New Student</h3>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        <div className="space-y-4">
            <div className='space-y-1'>
                <label className='text-xs font-bold text-gray-500 px-1'>Batch</label>
                <select 
                    value={selectedBatchId} 
                    onChange={e => setSelectedBatchId(e.target.value)}
                    className='w-full p-3 bg-gray-100 border-gray-200 rounded-xl text-sm font-medium transition-all focus:bg-white focus:shadow-lg focus:shadow-blue-50 appearance-none'>
                    {allBatches.length > 0 ? (
                        allBatches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.classLevel})</option>)
                    ) : (
                        <option disabled>No batches available</option>
                    )}
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

            <div className="pt-2">
                <button
                    onClick={handleCreateStudent}
                    disabled={isLoading || allBatches.length === 0}
                    className="w-full p-4 bg-blue-600 text-white rounded-xl font-bold text-sm disabled:bg-blue-300 active:scale-95 transition-all shadow-lg shadow-blue-100"
                    >
                    {isLoading ? 'Creating Student...' : 'Create & Enroll Student'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalAddStudentScreen;
