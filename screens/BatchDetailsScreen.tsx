
import React, { useState, useEffect } from 'react';
import { Batch, GlobalSettings, User, UserRole, Chapter, Lecture } from '../types.ts';
import { db } from '../firebase.ts';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import VideoPlayer from '../components/VideoPlayer.tsx';

type ViewState = 'MAIN' | 'SUBJECTS' | 'CHAPTERS' | 'LECTURES' | 'LECTURE_MANAGE' | 'LECTURE_WATCH';

const BatchDetailsScreen: React.FC<{batch: Batch, settings: GlobalSettings, user: User, onBack: () => void}> = ({ batch, settings, user, onBack }) => {
  const [currentView, setCurrentView] = useState<ViewState>('MAIN');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [isAddingLecture, setIsAddingLecture] = useState(false);
  const [newLectureTopic, setNewLectureTopic] = useState('');
  const [newLectureDate, setNewLectureDate] = useState('');

  const isAdmin = user.role === UserRole.ADMIN;

  useEffect(() => {
    if (currentView === 'CHAPTERS' && selectedSubject) {
      const q = query(collection(db, 'batches', batch.id, 'subjects', selectedSubject, 'chapters'), orderBy('createdAt', 'asc'));
      const unsub = onSnapshot(q, snap => setChapters(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter))));
      return unsub;
    }
  }, [currentView, selectedSubject, batch.id]);

  useEffect(() => {
    if ((currentView === 'LECTURES' || currentView === 'LECTURE_WATCH') && selectedChapter && selectedSubject) {
      const q = query(collection(db, 'batches', batch.id, 'subjects', selectedSubject, 'chapters', selectedChapter.id, 'lectures'), orderBy('createdAt', 'asc'));
      const unsub = onSnapshot(q, snap => setLectures(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lecture))));
      return unsub;
    }
  }, [currentView, selectedChapter, selectedSubject, batch.id]);

  const handleAddChapter = async () => {
    if (!newChapterTitle) return;
    await addDoc(collection(db, 'batches', batch.id, 'subjects', selectedSubject, 'chapters'), { title: newChapterTitle, createdAt: serverTimestamp() });
    setNewChapterTitle(''); setIsAddingChapter(false);
  };

  const handleAddLecture = async () => {
    if (!newLectureTopic || !newLectureDate || !selectedChapter) return;
    await addDoc(collection(db, 'batches', batch.id, 'subjects', selectedSubject, 'chapters', selectedChapter.id, 'lectures'), { topicName: newLectureTopic, date: newLectureDate, createdAt: serverTimestamp() });
    setNewLectureTopic(''); setNewLectureDate(''); setIsAddingLecture(false);
  };

  const navigateBack = () => {
    if (currentView === 'LECTURE_WATCH' || currentView === 'LECTURE_MANAGE') setCurrentView('LECTURES');
    else if (currentView === 'LECTURES') setCurrentView('CHAPTERS');
    else if (currentView === 'CHAPTERS') setCurrentView('SUBJECTS');
    else if (currentView === 'SUBJECTS') setCurrentView('MAIN');
    else onBack();
  };

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-gray-100 flex items-center gap-3 bg-white shrink-0">
        <button onClick={navigateBack} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
        <div className="min-w-0 flex-1">
          <h2 className="text-xs font-black text-gray-900 tracking-tight truncate uppercase leading-none">{currentView === 'MAIN' ? batch.name : currentView === 'SUBJECTS' ? 'Curriculum' : selectedSubject || 'Grid'}</h2>
          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest truncate mt-1">Batch Navigator</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-hide p-4 space-y-4 pb-10">
        {currentView === 'MAIN' && (
          <div className="bg-blue-600 p-4 rounded-xl shadow-lg shadow-blue-100 flex items-center gap-4 cursor-pointer" onClick={() => setCurrentView('SUBJECTS')}>
             <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-xl text-white">📚</div>
             <div className="flex-1 min-w-0">
               <h4 className="text-sm font-black text-white uppercase tracking-tight">Curriculum</h4>
               <p className="text-white/60 text-[8px] font-bold uppercase tracking-widest">Chapters & Lectures</p>
             </div>
             <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
          </div>
        )}
        {currentView === 'SUBJECTS' && (
          <div className="space-y-2">
            {batch.subjects.map(sub => (
              <button key={sub} onClick={() => { setSelectedSubject(sub); setCurrentView('CHAPTERS'); }} className="w-full bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 transition-all active:scale-95 text-left">
                <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-lg border border-indigo-100 shrink-0">🧬</div>
                <h4 className="font-bold text-gray-900 text-xs truncate uppercase tracking-tight">{sub}</h4>
              </button>
            ))}
          </div>
        )}
        {currentView === 'CHAPTERS' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{selectedSubject} Grid</p>
              {isAdmin && <button onClick={() => setIsAddingChapter(true)} className="text-[9px] font-black text-blue-600 uppercase">Add +</button>}
            </div>
            {isAddingChapter && (
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <input className="w-full bg-white border border-gray-200 p-2.5 rounded-lg font-bold text-xs outline-none" placeholder="Title" value={newChapterTitle} onChange={e => setNewChapterTitle(e.target.value)} />
                <button onClick={handleAddChapter} className="w-full bg-blue-600 text-white font-black py-2 rounded-lg text-[9px] uppercase">Save</button>
              </div>
            )}
            {chapters.map(ch => (
              <button key={ch.id} onClick={() => { setSelectedChapter(ch); setCurrentView('LECTURES'); }} className="w-full bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3 active:scale-95 transition-all text-left">
                <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-sm border border-emerald-100 shrink-0">📖</div>
                <h4 className="font-bold text-gray-900 text-xs truncate uppercase tracking-tight leading-none">{ch.title}</h4>
              </button>
            ))}
          </div>
        )}
        {currentView === 'LECTURES' && (
           <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Lectures Log</p>
                {isAdmin && <button onClick={() => setIsAddingLecture(true)} className="text-[9px] font-black text-blue-600 uppercase">Add +</button>}
              </div>
              {lectures.map((lec, idx) => (
                <div key={lec.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                  <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center text-[10px] font-black border border-rose-100 shrink-0">L{idx+1}</div>
                  <div className="flex-1 min-w-0"><h4 className="font-bold text-gray-900 text-xs truncate uppercase tracking-tight">{lec.topicName}</h4><p className="text-[8px] text-gray-400 font-bold uppercase">{lec.date}</p></div>
                  <button onClick={() => { setSelectedLecture(lec); setCurrentView('LECTURE_WATCH'); }} className="bg-blue-600 text-white text-[8px] font-black px-3 py-1.5 rounded-lg uppercase">Watch</button>
                </div>
              ))}
           </div>
        )}
        {currentView === 'LECTURE_WATCH' && selectedLecture && (
           <div className="-mx-4 -mt-4 bg-gray-50 flex flex-col min-h-full">
              <VideoPlayer url={selectedLecture.youtubeUrl} title={selectedLecture.topicName} />
              <div className="p-4 space-y-4">
                 <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-black text-gray-900 text-xs uppercase tracking-tight leading-tight">{selectedLecture.topicName}</h3>
                    <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">Recorded: {selectedLecture.date}</p>
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                    <button className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm flex flex-col items-center gap-1.5"><span className="text-xl">📄</span><span className="text-[7px] font-black uppercase">Notes</span></button>
                    <button className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm flex flex-col items-center gap-1.5"><span className="text-xl">📝</span><span className="text-[7px] font-black uppercase">DPP</span></button>
                    <button className="bg-blue-600 text-white p-3 rounded-xl shadow-md flex flex-col items-center gap-1.5"><span className="text-xl">🎯</span><span className="text-[7px] font-black uppercase text-white">Test</span></button>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default BatchDetailsScreen;