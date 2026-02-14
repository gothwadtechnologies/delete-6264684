
import React, { useState, useEffect } from 'react';
import { Batch, GlobalSettings, User, UserRole, Chapter, Lecture } from '../types.ts';
import { db } from '../firebase.ts';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import VideoPlayer from '../components/VideoPlayer.tsx';

interface BatchDetailsScreenProps {
  batch: Batch;
  settings: GlobalSettings;
  user: User;
  onBack: () => void;
}

type ViewState = 'MAIN' | 'SUBJECTS' | 'CHAPTERS' | 'LECTURES' | 'LECTURE_MANAGE' | 'LECTURE_WATCH';

const BatchDetailsScreen: React.FC<BatchDetailsScreenProps> = ({ batch, settings, user, onBack }) => {
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

  // Management State
  const [manageYoutube, setManageYoutube] = useState('');
  const [manageNotes, setManageNotes] = useState('');
  const [manageDpp, setManageDpp] = useState('');

  const isAdmin = user.role === UserRole.ADMIN;

  useEffect(() => {
    if (currentView === 'CHAPTERS' && selectedSubject) {
      const q = query(
        collection(db, 'batches', batch.id, 'subjects', selectedSubject, 'chapters'),
        orderBy('createdAt', 'asc')
      );
      const unsub = onSnapshot(q, (snap) => {
        setChapters(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter)));
      });
      return () => unsub();
    }
  }, [currentView, selectedSubject, batch.id]);

  useEffect(() => {
    if ((currentView === 'LECTURES' || currentView === 'LECTURE_WATCH') && selectedChapter && selectedSubject) {
      const q = query(
        collection(db, 'batches', batch.id, 'subjects', selectedSubject, 'chapters', selectedChapter.id, 'lectures'),
        orderBy('createdAt', 'asc')
      );
      const unsub = onSnapshot(q, (snap) => {
        const fetchedLectures = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lecture));
        setLectures(fetchedLectures);
        
        // Sync the currently watched lecture with real-time updates
        if (selectedLecture) {
          const updated = fetchedLectures.find(l => l.id === selectedLecture.id);
          if (updated) setSelectedLecture(updated);
        }
      });
      return () => unsub();
    }
  }, [currentView, selectedChapter, selectedSubject, batch.id, selectedLecture?.id]);

  const handleAddChapter = async () => {
    if (!newChapterTitle) return;
    try {
      await addDoc(collection(db, 'batches', batch.id, 'subjects', selectedSubject, 'chapters'), {
        title: newChapterTitle,
        createdAt: serverTimestamp()
      });
      setNewChapterTitle('');
      setIsAddingChapter(false);
    } catch (e) { alert('Error adding chapter'); }
  };

  const handleAddLecture = async () => {
    if (!newLectureTopic || !newLectureDate || !selectedChapter) return;
    try {
      await addDoc(collection(db, 'batches', batch.id, 'subjects', selectedSubject, 'chapters', selectedChapter.id, 'lectures'), {
        topicName: newLectureTopic,
        date: newLectureDate,
        createdAt: serverTimestamp()
      });
      setNewLectureTopic('');
      setNewLectureDate('');
      setIsAddingLecture(false);
    } catch (e) { alert('Error adding lecture'); }
  };

  const handleSaveManage = async () => {
    if (!selectedLecture || !selectedChapter) return;
    try {
      const lectureRef = doc(db, 'batches', batch.id, 'subjects', selectedSubject, 'chapters', selectedChapter.id, 'lectures', selectedLecture.id);
      const cleanUrl = manageYoutube.trim();
      
      await updateDoc(lectureRef, {
        youtubeUrl: cleanUrl,
        notesUrl: manageNotes.trim(),
        dppUrl: manageDpp.trim(),
      });
      
      // Update local state immediately so user sees the change when switching to Watch view
      setSelectedLecture({
        ...selectedLecture,
        youtubeUrl: cleanUrl,
        notesUrl: manageNotes.trim(),
        dppUrl: manageDpp.trim(),
      });
      
      alert('Updated! You can now click Watch.');
      setCurrentView('LECTURES');
    } catch (e) { alert('Failed to update. Check your internet.'); }
  };

  const navigateBack = () => {
    if (currentView === 'LECTURE_WATCH' || currentView === 'LECTURE_MANAGE') setCurrentView('LECTURES');
    else if (currentView === 'LECTURES') setCurrentView('CHAPTERS');
    else if (currentView === 'CHAPTERS') setCurrentView('SUBJECTS');
    else if (currentView === 'SUBJECTS') setCurrentView('MAIN');
    else onBack();
  };

  const renderLectures = () => (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedChapter?.title} Lectures</p>
        {isAdmin && <button onClick={() => setIsAddingLecture(true)} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Add Lecture +</button>}
      </div>

      {isAddingLecture && (
        <div className="bg-gray-50 p-4 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
          <input className="w-full bg-white border border-gray-200 p-3 rounded-xl font-bold text-sm text-black outline-none" placeholder="Topic Name" value={newLectureTopic} onChange={(e) => setNewLectureTopic(e.target.value)} />
          <input type="date" className="w-full bg-white border border-gray-200 p-3 rounded-xl font-bold text-sm text-black outline-none" value={newLectureDate} onChange={(e) => setNewLectureDate(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={handleAddLecture} className="flex-1 bg-blue-600 text-white font-black py-2 rounded-lg text-[10px] uppercase">Save</button>
            <button onClick={() => setIsAddingLecture(false)} className="px-4 bg-gray-200 text-gray-500 font-black rounded-lg text-[10px] uppercase">Cancel</button>
          </div>
        </div>
      )}

      {lectures.map((lec, idx) => (
        <div key={lec.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center text-xs font-black border border-rose-100 shrink-0">L{idx+1}</div>
          <div className="flex-1 text-left min-w-0">
            <h4 className="font-bold text-gray-900 text-sm truncate uppercase tracking-tight">{lec.topicName}</h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">{lec.date}</p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <button 
                onClick={() => { 
                  setSelectedLecture(lec); 
                  setManageYoutube(lec.youtubeUrl || ''); 
                  setManageNotes(lec.notesUrl || ''); 
                  setManageDpp(lec.dppUrl || ''); 
                  setCurrentView('LECTURE_MANAGE'); 
                }}
                className="bg-gray-900 text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase border border-gray-900"
              >
                Manage
              </button>
            )}
            <button 
              onClick={() => { setSelectedLecture(lec); setCurrentView('LECTURE_WATCH'); }}
              className="bg-blue-600 text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase shadow-sm"
            >
              Watch
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderLectureManage = () => (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest border-b border-gray-50 pb-2">Resource Settings</h3>
        
        <div className="space-y-1">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Full YouTube URL</label>
          <input className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl font-bold text-sm text-black outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://youtu.be/..." value={manageYoutube} onChange={(e) => setManageYoutube(e.target.value)} />
          <p className="text-[8px] text-gray-400 font-bold px-1 italic">Note: Both youtube.com and youtu.be links are supported.</p>
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Study Material (PDF)</label>
          <input className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl font-bold text-sm text-black outline-none focus:ring-2 focus:ring-blue-500" placeholder="Drive or web link" value={manageNotes} onChange={(e) => setManageNotes(e.target.value)} />
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Practice Paper (DPP)</label>
          <input className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl font-bold text-sm text-black outline-none focus:ring-2 focus:ring-blue-500" placeholder="Practice set link" value={manageDpp} onChange={(e) => setManageDpp(e.target.value)} />
        </div>

        <div className="flex gap-2 pt-4">
          <button onClick={handleSaveManage} className="flex-1 bg-blue-600 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">Save Resources</button>
          <button onClick={() => setCurrentView('LECTURES')} className="px-6 bg-gray-100 text-gray-500 font-black rounded-xl text-xs uppercase tracking-widest">Cancel</button>
        </div>
      </div>
    </div>
  );

  const renderLectureWatch = () => {
    if (!selectedLecture) return null;

    return (
      <div className="flex flex-col h-full bg-gray-50 -mx-4 -mt-4">
        {/* Using the updated VideoPlayer component */}
        <VideoPlayer url={selectedLecture.youtubeUrl} title={selectedLecture.topicName} />

        <div className="p-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h3 className="font-black text-gray-900 text-sm uppercase tracking-tight leading-tight">{selectedLecture.topicName}</h3>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Recorded: {selectedLecture.date}</p>
            </div>
            {isAdmin && (
              <button 
                onClick={() => {
                  setManageYoutube(selectedLecture.youtubeUrl || '');
                  setManageNotes(selectedLecture.notesUrl || '');
                  setManageDpp(selectedLecture.dppUrl || '');
                  setCurrentView('LECTURE_MANAGE');
                }}
                className="text-blue-600 text-[9px] font-black uppercase tracking-widest p-2 hover:bg-blue-50 rounded-lg"
              >
                Edit Link
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => selectedLecture.notesUrl && window.open(selectedLecture.notesUrl)} className={`bg-white border border-gray-100 p-4 rounded-xl shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-all ${!selectedLecture.notesUrl ? 'opacity-30 pointer-events-none' : 'hover:border-blue-200'}`}>
               <span className="text-xl">📄</span>
               <span className="text-[8px] font-black uppercase tracking-widest">Notes</span>
            </button>
            <button onClick={() => selectedLecture.dppUrl && window.open(selectedLecture.dppUrl)} className={`bg-white border border-gray-100 p-4 rounded-xl shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-all ${!selectedLecture.dppUrl ? 'opacity-30 pointer-events-none' : 'hover:border-blue-200'}`}>
               <span className="text-xl">📝</span>
               <span className="text-[8px] font-black uppercase tracking-widest">DPP</span>
            </button>
            <button className="bg-blue-600 text-white p-4 rounded-xl shadow-md flex flex-col items-center gap-2 active:scale-95 transition-all">
               <span className="text-xl text-white">🎯</span>
               <span className="text-[8px] font-black uppercase tracking-widest">Test</span>
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex justify-between items-center">
             <div className="flex flex-col">
               <p className="text-[9px] text-blue-800 font-black uppercase tracking-widest">Next Live Doubt Session</p>
               <span className="text-[9px] font-bold text-blue-600">Tonight 9:00 PM</span>
             </div>
             <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg font-black uppercase tracking-tighter text-[9px] shadow-sm active:scale-90 transition-all">
               Notify Me
             </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-white shrink-0">
        <button onClick={navigateBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-black text-gray-900 tracking-tight leading-tight truncate uppercase">
            {currentView === 'MAIN' ? batch.name : 
             currentView === 'SUBJECTS' ? 'Subject Selection' :
             currentView === 'CHAPTERS' ? selectedSubject :
             currentView === 'LECTURE_MANAGE' ? 'Manage Resources' :
             currentView === 'LECTURE_WATCH' ? 'Player' : selectedChapter?.title}
          </h2>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">
            {currentView === 'MAIN' ? `${batch.subjects.join(', ')}` : batch.name}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-hide p-4 space-y-6 pb-10">
        {currentView === 'MAIN' && (
          <><div className="relative p-5 rounded-2xl overflow-hidden shadow-sm flex items-center gap-4" style={{ backgroundColor: settings.primaryColor }}>
            <div className="absolute top-0 left-0 w-full h-full bg-white/5 backdrop-blur-xl"></div>
            <div className="relative z-10 w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-2xl border border-white/20">🎓</div>
            <div className="relative z-10 text-white min-w-0 flex-1">
              <h3 className="text-sm font-black uppercase tracking-tight leading-none truncate">{batch.name}</h3>
              <p className="text-white/60 text-[9px] font-bold uppercase tracking-widest mt-1 truncate">Instr: {batch.instructor}</p>
            </div>
          </div><div className="space-y-3"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Options</p>
            <button onClick={() => setCurrentView('SUBJECTS')} className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all group active:scale-95">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl border border-blue-100 shrink-0">📚</div>
              <div className="flex-1 text-left"><h4 className="font-bold text-gray-900 text-sm truncate uppercase tracking-tight">Curriculum</h4><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Subjects & Lectures</p></div>
              <div className="text-gray-300 group-hover:text-gray-900"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></div>
            </button>
          </div></>
        )}
        {currentView === 'SUBJECTS' && (
          <div className="space-y-3"><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Select Subject</p>
            {batch.subjects.map(sub => (
              <button key={sub} onClick={() => { setSelectedSubject(sub); setCurrentView('CHAPTERS'); }} className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all group active:scale-95">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl border border-indigo-100 shrink-0">🧬</div>
                <div className="flex-1 text-left"><h4 className="font-bold text-gray-900 text-sm truncate uppercase tracking-tight">{sub}</h4><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">View Syllabus</p></div>
              </button>
            ))}
          </div>
        )}
        {currentView === 'CHAPTERS' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedSubject} Syllabus</p>
              {isAdmin && <button onClick={() => setIsAddingChapter(true)} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Add Chapter +</button>}
            </div>
            {isAddingChapter && (
              <div className="bg-gray-50 p-4 rounded-xl space-y-3"><input className="w-full bg-white border border-gray-200 p-3 rounded-xl font-bold text-sm text-black outline-none" placeholder="Chapter Title" value={newChapterTitle} onChange={(e) => setNewChapterTitle(e.target.value)} />
                <div className="flex gap-2"><button onClick={handleAddChapter} className="flex-1 bg-blue-600 text-white font-black py-2 rounded-lg text-[10px] uppercase">Save</button><button onClick={() => setIsAddingChapter(false)} className="px-4 bg-gray-200 text-gray-500 font-black rounded-lg text-[10px] uppercase">Cancel</button></div>
              </div>
            )}
            {chapters.map(ch => (
              <button key={ch.id} onClick={() => { setSelectedChapter(ch); setCurrentView('LECTURES'); }} className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 active:scale-95 transition-all group text-left">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center text-lg border border-green-100 shrink-0">📖</div>
                <div className="flex-1 min-w-0"><h4 className="font-bold text-gray-900 text-sm truncate uppercase tracking-tight">{ch.title}</h4></div>
              </button>
            ))}
          </div>
        )}
        {currentView === 'LECTURES' && renderLectures()}
        {currentView === 'LECTURE_MANAGE' && renderLectureManage()}
        {currentView === 'LECTURE_WATCH' && renderLectureWatch()}
      </div>
    </div>
  );
};

export default BatchDetailsScreen;
