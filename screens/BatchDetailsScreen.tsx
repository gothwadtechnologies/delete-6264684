
import React, { useState, useEffect } from 'react';
import { Batch, GlobalSettings, User, UserRole, Chapter, Lecture } from '../types.ts';
import { db } from '../firebase.ts';
import { collection, getDocs, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import VideoPlayer from '../components/VideoPlayer.tsx';
import BatchMenuScreen, { BatchMenuItem } from './BatchMenuScreen.tsx';
import StudentsScreen from './batch/StudentsScreen.tsx';
import AddStudentScreen from './batch/AddStudentScreen.tsx';

// ... (rest of the component is the same until BatchDetailsScreen)

type CurriculumViewState = 'SUBJECTS' | 'CHAPTERS' | 'LECTURES' | 'LECTURE_WATCH';
type ScreenViewState = 'MENU' | 'CONTENT';

const PlaceholderContent: React.FC<{ title: string }> = ({ title }) => (
    <div className="p-8 text-center bg-gray-50 rounded-2xl m-4 border-2 border-dashed border-gray-100">
        <h3 className="font-bold text-lg text-gray-400">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">This section is under construction.</p>
    </div>
);

const BatchDetailsScreen: React.FC<{batch: Batch, settings: GlobalSettings, user: User, onBack: () => void}> = ({ batch, settings, user, onBack }) => {
  const [screenView, setScreenView] = useState<ScreenViewState>('MENU');
  const [selectedMenu, setSelectedMenu] = useState<BatchMenuItem>('CURRICULUM');
  const [isAddStudentVisible, setIsAddStudentVisible] = useState(false);
  
  const [allBatches, setAllBatches] = useState<Batch[]>([]);

  const [curriculumView, setCurriculumView] = useState<CurriculumViewState>('SUBJECTS');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);

  const isAdmin = user.role === UserRole.ADMIN;

  useEffect(() => {
    const fetchAllBatches = async () => {
      const querySnapshot = await getDocs(collection(db, 'batches'));
      const batches = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Batch));
      setAllBatches(batches);
    };
    fetchAllBatches();
  }, []);

  useEffect(() => {
    if (selectedMenu === 'CURRICULUM' && curriculumView === 'CHAPTERS' && selectedSubject) {
      const q = query(collection(db, 'batches', batch.id, 'subjects', selectedSubject, 'chapters'), orderBy('createdAt', 'asc'));
      const unsub = onSnapshot(q, snap => setChapters(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter))));
      return unsub;
    }
  }, [selectedMenu, curriculumView, selectedSubject, batch.id]);

  useEffect(() => {
    if (selectedMenu === 'CURRICULUM' && (curriculumView === 'LECTURES' || curriculumView === 'LECTURE_WATCH') && selectedChapter && selectedSubject) {
      const q = query(collection(db, 'batches', batch.id, 'subjects', selectedSubject, 'chapters', selectedChapter.id, 'lectures'), orderBy('createdAt', 'asc'));
      const unsub = onSnapshot(q, snap => setLectures(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lecture))));
      return unsub;
    }
  }, [selectedMenu, curriculumView, selectedChapter, selectedSubject, batch.id]);

  const handleMenuSelect = (item: BatchMenuItem) => {
    setSelectedMenu(item);
    setScreenView('CONTENT');
    setCurriculumView('SUBJECTS');
  };

  const navigateBack = () => {
    if (screenView === 'CONTENT') {
      if (selectedMenu === 'CURRICULUM') {
        if (curriculumView === 'LECTURE_WATCH') setCurriculumView('LECTURES');
        else if (curriculumView === 'LECTURES') setCurriculumView('CHAPTERS');
        else if (curriculumView === 'CHAPTERS') setCurriculumView('SUBJECTS');
        else setScreenView('MENU');
      } else {
        setScreenView('MENU');
      }
    } else {
      onBack();
    }
  };

  const getHeaderTitle = () => {
    if (screenView === 'MENU') return batch.name;
    const menuTitles: Record<BatchMenuItem, string> = { 'CURRICULUM': 'Curriculum', 'STUDENTS': 'Manage Students', 'TESTS': 'Tests', 'ATTENDANCE': 'Attendance', 'FEES': 'Fees', 'PYQS': 'PYQs' };
    return menuTitles[selectedMenu] || 'Details';
  }

  const renderCurriculum = () => (
    <div className="space-y-2 p-4">
      {/* ... curriculum rendering logic ... */}
    </div>
  );

  const renderContent = () => {
      switch(selectedMenu) {
          case 'CURRICULUM': return renderCurriculum();
          case 'STUDENTS': return <StudentsScreen batch={batch} onAddStudent={() => setIsAddStudentVisible(true)} />;
          case 'TESTS': return <PlaceholderContent title="Tests" />;
          case 'ATTENDANCE': return <PlaceholderContent title="Attendance" />;
          case 'FEES': return <PlaceholderContent title="Fees" />;
          case 'PYQS': return <PlaceholderContent title="PYQs" />;
          default: return <PlaceholderContent title="Coming Soon" />;
      }
  }

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-gray-100 flex items-center gap-3 bg-white shrink-0 z-10">
        <button onClick={navigateBack} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></button>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-black text-gray-900 tracking-tight truncate uppercase leading-none">{getHeaderTitle()}</h2>
          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest truncate mt-1">{batch.name}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-hide">
        {screenView === 'MENU' && <BatchMenuScreen onSelectItem={handleMenuSelect} />}
        {screenView === 'CONTENT' && renderContent()}
      </div>

      {isAddStudentVisible && allBatches.length > 0 &&
        <AddStudentScreen 
          initialBatch={batch} 
          allBatches={allBatches}
          onClose={() => setIsAddStudentVisible(false)} 
        />
      }
    </div>
  );
};

export default BatchDetailsScreen;
