
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Batch, User } from '../types';

interface UniversalSearchScreenProps {
  searchQuery: string;
  onClose: () => void;
  onSelectBatch: (batch: Batch) => void;
  onSelectStudent: (student: User) => void;
}

const UniversalSearchScreen: React.FC<UniversalSearchScreenProps> = ({ 
    searchQuery, 
    onClose,
    onSelectBatch,
    onSelectStudent
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{ batches: Batch[], students: User[] }>({ batches: [], students: [] });

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setResults({ batches: [], students: [] });
        return;
      }
      setIsSearching(true);
      
      try {
        // Search batches
        const batchQuery = query(
            collection(db, 'batches'), 
            where('name', '>=', searchQuery),
            where('name', '<=', searchQuery + '\uf8ff'),
            limit(5)
        );
        const batchSnapshot = await getDocs(batchQuery);
        const batches = batchSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Batch));

        // Search students
        const studentQuery = query(
            collection(db, 'users'), 
            where('role', '==', 'STUDENT'),
            where('name', '>=', searchQuery),
            where('name', '<=', searchQuery + '\uf8ff'),
            limit(5)
        );
        const studentSnapshot = await getDocs(studentQuery);
        const students = studentSnapshot.docs.map(doc => doc.data() as User);

        setResults({ batches, students });

      } catch (error) {
        console.error("Error performing search: ", error);
      }
      
      setIsSearching(false);
    };

    const debounceTimeout = setTimeout(() => {
        performSearch();
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const handleSelectBatch = (batch: Batch) => {
    onSelectBatch(batch);
    onClose();
  }

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[100]" onClick={onClose}>
      <div className="bg-white/95 rounded-t-3xl mt-24" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200">
            <div className="relative">
                <input 
                autoFocus
                type="text"
                placeholder="Search Batches, Students, Tests..."
                className="w-full bg-gray-100 border border-gray-200 pl-10 pr-10 py-4 rounded-xl text-sm font-black text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                defaultValue={searchQuery}
                // The query is now managed by the parent, so we don't need onChange here
                />
                <div className="absolute left-3 top-4.5 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <button className="absolute right-3 top-3 text-gray-400" onClick={onClose}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>

        <div className="h-96 overflow-y-auto p-4">
            {isSearching && <p className="text-center text-gray-500">Searching...</p>}
            
            {!isSearching && results.batches.length === 0 && results.students.length === 0 && searchQuery.length > 1 && (
                <p className="text-center text-gray-500 pt-10">No results found for "{searchQuery}"</p>
            )}

            {results.batches.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider px-2 mb-2">Batches</h4>
                    {results.batches.map(batch => (
                        <div key={batch.id} onClick={() => handleSelectBatch(batch)} className="p-3 hover:bg-gray-100 rounded-lg cursor-pointer">
                            <p className="font-bold text-gray-800">{batch.name}</p>
                            <p className="text-xs text-gray-500">{batch.classLevel} • {batch.studentIds?.length || 0} students</p>
                        </div>
                    ))}
                </div>
            )}

            {results.students.length > 0 && (
                <div>
                    <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider px-2 mb-2">Students</h4>
                    {results.students.map(student => (
                        <div key={student.uid} className="p-3 hover:bg-gray-100 rounded-lg cursor-pointer">
                            <p className="font-bold text-gray-800">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.email}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default UniversalSearchScreen;
