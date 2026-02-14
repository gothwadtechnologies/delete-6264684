
import React, { useState, useEffect } from 'react';
import { User, UserRole, Test, Question, Batch } from '../../types';
import { db } from '../../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc, where } from 'firebase/firestore';

interface TestsScreenProps {
  user: User;
}

type ViewState = 'LIST' | 'CREATE' | 'MANAGE';

const TestsScreen: React.FC<TestsScreenProps> = ({ user }) => {
  const [view, setView] = useState<ViewState>('LIST');
  const [tests, setTests] = useState<Test[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(false);

  // Create Test Form
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('60');
  const [targetBatchId, setTargetBatchId] = useState('all');

  // Question Form
  const [qText, setQText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correct, setCorrect] = useState(0);

  const isAdmin = user.role === UserRole.ADMIN;

  useEffect(() => {
    // Fetch Tests
    const q = query(collection(db, 'tests'), orderBy('createdAt', 'desc'));
    const unsubTests = onSnapshot(q, (snap) => {
      setTests(snap.docs.map(d => ({ id: d.id, ...d.data() } as Test)));
    });

    // Fetch Batches for dropdown
    const unsubBatches = onSnapshot(collection(db, 'batches'), (snap) => {
      setBatches(snap.docs.map(d => ({ id: d.id, ...d.data() } as Batch)));
    });

    return () => {
      unsubTests();
      unsubBatches();
    };
  }, []);

  const handleCreateTest = async () => {
    if (!title || !date) return;
    setLoading(true);
    try {
      const selectedBatch = batches.find(b => b.id === targetBatchId);
      await addDoc(collection(db, 'tests'), {
        title,
        date,
        duration: parseInt(duration),
        batchId: targetBatchId,
        batchName: targetBatchId === 'all' ? 'All Batches' : selectedBatch?.name,
        totalMarks: 0,
        questions: [],
        createdAt: serverTimestamp()
      });
      setTitle(''); setDate(''); setView('LIST');
    } catch (e) { alert("Error creating test"); }
    finally { setLoading(false); }
  };

  const handleAddQuestion = async () => {
    if (!selectedTest || !qText || options.some(o => !o)) return;
    setLoading(true);
    try {
      const newQuestion: Question = {
        id: Date.now().toString(),
        text: qText,
        options: [...options],
        correctOption: correct
      };
      const updatedQuestions = [...(selectedTest.questions || []), newQuestion];
      const testRef = doc(db, 'tests', selectedTest.id);
      await updateDoc(testRef, {
        questions: updatedQuestions,
        totalMarks: updatedQuestions.length * 4 // Assuming 4 marks per question
      });
      setQText(''); setOptions(['', '', '', '']); setCorrect(0);
      setSelectedTest({ ...selectedTest, questions: updatedQuestions });
    } catch (e) { alert("Error adding question"); }
    finally { setLoading(false); }
  };

  if (view === 'CREATE') {
    return (
      <div className="p-4 space-y-5 animate-in fade-in slide-in-from-bottom-2">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">New Exam Protocol</h3>
          <div className="space-y-3">
            <input className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl font-bold text-sm text-gray-900 outline-none" placeholder="Test Title (e.g. Unit Test 1)" value={title} onChange={e => setTitle(e.target.value)} />
            <input type="date" className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl font-bold text-sm text-gray-900 outline-none" value={date} onChange={e => setDate(e.target.value)} />
            <div className="flex gap-2">
              <input type="number" className="flex-1 bg-gray-50 border border-gray-100 p-3.5 rounded-xl font-bold text-sm text-gray-900 outline-none" placeholder="Duration (Min)" value={duration} onChange={e => setDuration(e.target.value)} />
              <select className="flex-1 bg-gray-50 border border-gray-100 p-3.5 rounded-xl font-bold text-sm text-gray-900 outline-none" value={targetBatchId} onChange={e => setTargetBatchId(e.target.value)}>
                <option value="all">All Batches</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreateTest} disabled={loading} className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
              {loading ? '...' : 'Deploy Test'}
            </button>
            <button onClick={() => setView('LIST')} className="px-6 bg-gray-100 text-gray-400 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'MANAGE' && selectedTest) {
    return (
      <div className="p-4 space-y-5 animate-in fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">{selectedTest.title}</h3>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Question Bank Management</p>
          </div>
          <button onClick={() => setView('LIST')} className="p-2 bg-gray-100 rounded-lg text-xs font-black">✕</button>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Add New Question</label>
          <textarea className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-xl font-bold text-sm text-gray-900 outline-none h-24" placeholder="Enter question text here..." value={qText} onChange={e => setQText(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2 items-center bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                <button onClick={() => setCorrect(i)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] ${correct === i ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-transparent'}`}>✓</button>
                <input className="flex-1 bg-transparent font-bold text-xs text-gray-900 outline-none" placeholder={`Option ${i+1}`} value={opt} onChange={e => {
                  const newOpts = [...options]; newOpts[i] = e.target.value; setOptions(newOpts);
                }} />
              </div>
            ))}
          </div>
          <button onClick={handleAddQuestion} disabled={loading} className="w-full bg-gray-900 text-white py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
            {loading ? 'Saving...' : 'Save Question'}
          </button>
        </div>

        <div className="space-y-3 pb-20">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Questions ({selectedTest.questions?.length || 0})</p>
          {selectedTest.questions?.map((q, idx) => (
            <div key={q.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] font-black text-blue-600 uppercase">Question {idx+1}</span>
              </div>
              <p className="text-xs font-bold text-gray-800 mb-3">{q.text}</p>
              <div className="grid grid-cols-2 gap-2 opacity-50">
                {q.options.map((o, i) => (
                  <div key={i} className={`p-2 rounded-lg text-[10px] font-bold ${q.correctOption === i ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-400'}`}>
                    {o}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-black text-gray-900 tracking-tight">Academic Portal</h3>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Tests & Assessments</p>
        </div>
        {isAdmin && (
          <button onClick={() => setView('CREATE')} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all">
            + New Test
          </button>
        )}
      </div>

      <div className="space-y-4">
        {tests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100">
            <p className="text-gray-400 font-black text-[9px] uppercase tracking-widest">No active tests scheduled</p>
          </div>
        ) : (
          tests.map(test => (
            <div key={test.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-lg">📝</div>
                  <div>
                    <h4 className="font-black text-gray-900 text-sm uppercase tracking-tight">{test.title}</h4>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">
                      {test.date} • {test.duration}m • {test.batchName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-gray-900 leading-none">{test.questions?.length || 0}</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Items</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-50">
                {isAdmin ? (
                  <>
                    <button 
                      onClick={() => { setSelectedTest(test); setView('MANAGE'); }}
                      className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Manage Paper
                    </button>
                    <button className="flex-1 bg-gray-100 text-gray-500 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest">Stats</button>
                  </>
                ) : (
                  <>
                    <button className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                      Start Test
                    </button>
                    <button className="px-4 bg-gray-50 text-gray-400 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest">Prep</button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-blue-600 p-6 rounded-2xl text-white relative overflow-hidden mt-8 shadow-xl shadow-blue-100">
        <div className="relative z-10">
          <p className="text-white/60 text-[8px] font-black uppercase tracking-[0.3em] mb-1">Upcoming Milestone</p>
          <h4 className="text-sm font-black uppercase tracking-tight">Sunday All-India Mock Test</h4>
          <button className="mt-3 bg-white text-blue-600 px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">Join Queue</button>
        </div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
};

export default TestsScreen;
