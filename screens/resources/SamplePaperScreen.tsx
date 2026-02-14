
import React from 'react';

const SamplePaperScreen: React.FC = () => {
  const papers = [
    { title: 'Full Length Model Paper 1', difficulty: 'Medium', qCount: 75 },
    { title: 'High Yield Topics Paper', difficulty: 'Hard', qCount: 45 },
    { title: 'Speed Practice Set', difficulty: 'Easy', qCount: 30 },
    { title: 'Rank Booster - Physics', difficulty: 'Intense', qCount: 60 },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">Model Papers</h3>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Handpicked by Subject Matter Experts</p>
      </div>

      <div className="space-y-3">
        {papers.map((paper, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-lg">📄</div>
               <div>
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-tight">{paper.title}</h4>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {paper.difficulty} • {paper.qCount} Questions
                  </p>
               </div>
            </div>
            <button className="bg-blue-600 text-white p-2 rounded-lg">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SamplePaperScreen;
