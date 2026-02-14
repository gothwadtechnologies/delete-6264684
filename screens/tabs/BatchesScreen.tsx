
import React, { useState, useEffect } from 'react';
import { User, UserRole, Batch, ClassLevel } from '../../types';
import { db } from '../../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';

const SUBJECT_OPTIONS = ['Mathematics', 'Physics', 'Chemistry', 'Biology'];
const CLASS_OPTIONS: ClassLevel[] = ['9th', '10th', '11th', '12th', 'Dropper'];

const THUMBNAIL_COLORS = [
  'bg-blue-600',
  'bg-indigo-600',
  'bg-purple-600',
  'bg-rose-600',
  'bg-emerald-600'
];

interface BatchesScreenProps {
  user: User;
  onSelectBatch: (batch: Batch) => void;
  onOpenNotifications: () => void;
}

const BatchesScreen: React.FC<BatchesScreenProps> = ({ user, onSelectBatch, onOpenNotifications }) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isAddingBatch, setIsAddingBatch] = useState(false);
  const [isAddingTest, setIsAddingTest] = useState(false);
  
  // Batch Form State
  const [newBatchName, setNewBatchName] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassLevel>('10th');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  
  // Test Form State
  const [testTitle, setTestTitle] = useState('');
  const [testDate, setTestDate] = useState('');
  const [testMarks, setTestMarks] = useState('');
  const [testSubjects, setTestSubjects] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = user.role === UserRole.ADMIN;

  useEffect(() => {
    if (!db) return;

    try {
      const q = query(collection(db, 'batches'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedBatches = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Batch[];
        setBatches(fetchedBatches);
      }, (err) => {
        console.warn("Firestore snapshot error:", err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Could not attach batches listener:", e);
    }
  }, []);

  const toggleSubject = (subject: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setList(prev => 
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const handleCreateBatch = async () => {
    if (!newBatchName || selectedSubjects.length === 0) {
      alert("Please fill all details and select at least one subject.");
      return;
    }

    if (!db) {
      alert("Action not available in offline/demo mode.");
      return;
    }
    
    setIsLoading(true);
    try {
      const randomColor = THUMBNAIL_COLORS[Math.floor(Math.random() * THUMBNAIL_COLORS.length)];
      const batchData = {
        name: newBatchName,
        classLevel: selectedClass,
        instructor: user.name,
        studentIds: [],
        thumbnailColor: randomColor,
        subjects: selectedSubjects,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'batches'), batchData);
      
      setNewBatchName('');
      setSelectedSubjects([]);
      setSelectedClass('10th');
      setIsAddingBatch(false);
    } catch (error) {
      console.error("Error adding batch: ", error);
      alert("Failed to create batch.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTest = async () => {
    if (!testTitle || !testDate || !testMarks || testSubjects.length === 0) {
      alert("Please fill all test details.");
      return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, 'tests'), {
        title: testTitle,
        date: testDate,
        totalMarks: parseInt(testMarks),
        subjects: testSubjects,
        instructor: user.name,
        createdAt: serverTimestamp()
      });
      
      setTestTitle('');
      setTestDate('');
      setTestMarks('');
      setTestSubjects([]);
      setIsAddingTest(false);
      alert("Academic Test Created!");
    } catch (error) {
      alert("Failed to create test.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-5">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Active Courses</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-none mt-1">Academic Session 2024-25</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={onOpenNotifications}
            className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-sm active:scale-90 transition-all hover:bg-gray-50"
           >
            🔔
          </button>
        </div>
      </div>

      {isAdmin && !isAddingBatch && !isAddingTest && (
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setIsAddingBatch(true)}
            className="bg-blue-600 p-4 rounded-2xl flex flex-col justify-between text-white font-black active:scale-[0.98] transition-all shadow-lg shadow-blue-100"
          >
            <span className="text-lg">📚</span>
            <div className="text-left mt-2">
              <p className="text-[9px] uppercase tracking-tight font-bold">New Batch</p>
              <p className="text-[8px] opacity-70 font-medium">Add Classroom</p>
            </div>
          </button>
          <button 
            onClick={() => setIsAddingTest(true)}
            className="bg-gray-900 p-4 rounded-2xl flex flex-col justify-between text-white font-black active:scale-[0.98] transition-all shadow-lg shadow-gray-200"
          >
            <span className="text-lg">📝</span>
            <div className="text-left mt-2">
              <p className="text-[9px] uppercase tracking-tight font-bold">Create Test</p>
              <p className="text-[8px] opacity-70 font-medium">Exam Portal</p>
            </div>
          </button>
        </div>
      )}

      {/* Batch Creation Form */}
      {isAddingBatch && (
        <div className="bg-white p-5 rounded-[2rem] shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-black text-gray-900 text-[10px] tracking-[0.2em] uppercase px-1">Batch Designer</h3>
            <button onClick={() => setIsAddingBatch(false)} className="bg-gray-50 p-2 rounded-xl text-gray-400 text-xs font-bold">✕</button>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Batch Title</label>
              <input 
                className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl font-bold text-sm text-black outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                value={newBatchName}
                onChange={(e) => setNewBatchName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Subjects</label>
              <div className="grid grid-cols-2 gap-2">
                {SUBJECT_OPTIONS.map(sub => (
                  <button
                    key={sub}
                    onClick={() => toggleSubject(sub, selectedSubjects, setSelectedSubjects)}
                    className={`py-2 rounded-xl text-[9px] font-black uppercase transition-all border ${
                      selectedSubjects.includes(sub) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-100'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={handleCreateBatch} 
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-blue-50 active:scale-95 transition-all"
            >
              {isLoading ? 'Processing...' : 'Deploy Batch'}
            </button>
          </div>
        </div>
      )}

      {/* Test Creation Form */}
      {isAddingTest && (
        <div className="bg-white p-5 rounded-[2rem] shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-black text-gray-900 text-[10px] tracking-[0.2em] uppercase px-1">Academic Test Portal</h3>
            <button onClick={() => setIsAddingTest(false)} className="bg-gray-50 p-2 rounded-xl text-gray-400 text-xs font-bold">✕</button>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Test Heading</label>
              <input 
                className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl font-bold text-sm text-black outline-none" 
                placeholder="e.g. Minor Test 05 - Calculus"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Date</label>
                <input 
                  type="date"
                  className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl font-bold text-xs text-black outline-none" 
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Marks</label>
                <input 
                  type="number"
                  className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl font-bold text-sm text-black outline-none" 
                  placeholder="e.g. 100"
                  value={testMarks}
                  onChange={(e) => setTestMarks(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Topics</label>
              <div className="grid grid-cols-2 gap-2">
                {SUBJECT_OPTIONS.map(sub => (
                  <button
                    key={sub}
                    onClick={() => toggleSubject(sub, testSubjects, setTestSubjects)}
                    className={`py-2 rounded-xl text-[9px] font-black uppercase transition-all border ${
                      testSubjects.includes(sub) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-400 border-gray-100'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={handleCreateTest} 
              disabled={isLoading}
              className="w-full bg-gray-900 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
            >
              {isLoading ? 'Storing...' : 'Confirm Test Creation'}
            </button>
          </div>
        </div>
      )}

      {/* Batch Cards */}
      <div className="space-y-4">
        {batches.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-100">
            <p className="text-gray-400 font-black text-[9px] uppercase tracking-widest">No active batches</p>
          </div>
        ) : (
          batches.map(batch => (
            <div 
              key={batch.id} 
              onClick={() => onSelectBatch(batch)}
              className="bg-white rounded-[1.8rem] shadow-sm border border-gray-100 overflow-hidden active:scale-[0.98] transition-all cursor-pointer group"
            >
              <div className={`h-24 relative ${batch.thumbnailColor} p-5 flex flex-col justify-end`}>
                 <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
                    <span className="text-white text-[8px] font-black uppercase tracking-widest">{batch.classLevel}</span>
                 </div>
                 <h4 className="text-white font-black text-base uppercase tracking-tight truncate">{batch.name}</h4>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {batch.subjects?.slice(0, 2).map(s => (
                    <span key={s} className="bg-gray-50 text-gray-400 text-[8px] font-black px-2 py-1 rounded-md uppercase border border-gray-100">{s}</span>
                  ))}
                </div>
                <span className="text-[9px] font-black text-blue-600 uppercase">View Details →</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-gray-900 p-6 rounded-2xl text-white relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-blue-400 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Notice</p>
          <h3 className="text-sm font-black italic">"Education is the passport to the future."</h3>
        </div>
        <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-blue-600/20 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
};

export default BatchesScreen;
