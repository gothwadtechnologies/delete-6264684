
import React, { useState, useEffect, useMemo } from 'react';
import { Batch, User } from '@/types';
import { db } from '@/firebase';
import { collection, doc, onSnapshot, query, where, getDocs, updateDoc, arrayRemove } from 'firebase/firestore';
import EditStudentScreen from '@/screens/batch/EditStudentScreen';
import DeleteConfirmationScreen from '../../components/DeleteConfirmationScreen';


interface StudentsScreenProps {
  batch: Batch;
  onAddStudent: () => void;
}

const StudentsScreen: React.FC<StudentsScreenProps> = ({ batch, onAddStudent }) => {
  const [allBatches, setAllBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<User | null>(null);

  useEffect(() => {
    const fetchAllBatches = async () => {
      const querySnapshot = await getDocs(collection(db, 'batches'));
      setAllBatches(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Batch)));
    };
    fetchAllBatches();

    const unsubBatch = onSnapshot(doc(db, 'batches', batch.id), async (batchDoc) => {
      const batchData = batchDoc.data() as Batch;
      if (batchData && batchData.studentIds && batchData.studentIds.length > 0) {
        const studentsQuery = query(collection(db, 'users'), where('uid', 'in', batchData.studentIds));
        const unsubStudents = onSnapshot(studentsQuery, (querySnapshot) => {
            const studentsData = querySnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User));
            setStudents(studentsData);
            setIsLoading(false);
        });
        return () => unsubStudents();
      } else {
        setStudents([]);
        setIsLoading(false);
      }
    });

    return () => unsubBatch();
  }, [batch.id]);

  const handleUnenroll = async () => {
    if (!deletingStudent) return;
    try {
      const batchRef = doc(db, 'batches', batch.id);
      await updateDoc(batchRef, { studentIds: arrayRemove(deletingStudent.uid) });
    } catch (error) {
      console.error("Error unenrolling student: ", error);
      alert("Failed to un-enroll student.");
    }
  };

  const handleSaveStudent = (updatedStudent: User, newBatchId: string) => {
    if (newBatchId === batch.id) {
        setStudents(prev => prev.map(s => s.uid === updatedStudent.uid ? updatedStudent : s));
    } else {
        setStudents(prev => prev.filter(s => s.uid !== updatedStudent.uid));
    }
    setEditingStudent(null);
  };

  const filteredStudents = useMemo(() => {
    return students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [students, searchTerm]);

  return (
    <div className="p-4 flex-1">
      <button 
        onClick={onAddStudent}
        className="w-full p-3 mb-3 bg-blue-600 text-white rounded-xl font-bold text-sm active:scale-95 transition-all shadow-lg shadow-blue-100"
      >
        + Add New Student
      </button>
      <input 
        type="text"
        placeholder={`Search in ${batch.name}...`}
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full p-3 mb-4 bg-gray-100 border-gray-200 rounded-xl text-sm font-medium transition-all focus:bg-white focus:shadow-lg focus:shadow-blue-50"
      />
      
      {isLoading ? (
        <p className="text-center text-gray-500 py-10">Loading students...</p>
      ) : filteredStudents.length > 0 ? (
        <div className="space-y-2">
          {filteredStudents.map(student => (
            <div key={student.uid} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 text-lg shrink-0">{student.name.charAt(0)}</div>
                <div className='flex-1 min-w-0'>
                    <h4 className="font-bold text-gray-900 text-sm truncate">{student.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{student.email}</p>
                </div>
                <button onClick={() => setEditingStudent(student)} className="text-xs font-bold text-blue-600 hover:underline shrink-0 p-1">Edit</button>
                <button onClick={() => setDeletingStudent(student)} className="text-xs font-bold text-red-600 hover:underline shrink-0 p-1">Delete</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center bg-gray-50 rounded-2xl m-4 border-2 border-dashed border-gray-100">
          <h3 className="font-bold text-lg text-gray-400">No Students Found</h3>
          <p className="text-sm text-gray-500 mt-1">{searchTerm ? 'Try a different search term.' : `This batch doesn\'t have any students yet.`}</p>
       </div>
      )}

      {editingStudent && allBatches.length > 0 &&
        <EditStudentScreen 
            student={editingStudent} 
            currentBatch={batch}
            allBatches={allBatches}
            onClose={() => setEditingStudent(null)}
            onSave={handleSaveStudent}
        />}
        
      <ConfirmDeleteModal
        isOpen={!!deletingStudent}
        onClose={() => setDeletingStudent(null)}
        onConfirm={handleUnenroll}
        title="Confirm Un-enrollment"
        message={`Are you sure you want to remove ${deletingStudent?.name} from this batch? This cannot be undone.`}
      />
    </div>
  );
};

export default StudentsScreen;
