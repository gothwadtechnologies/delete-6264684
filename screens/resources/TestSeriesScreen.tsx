
import React from 'react';

const TestSeriesScreen: React.FC = () => {
  const tests = [
    { name: 'AITS - Minor Test 04', date: 'LIVE NOW', marks: 300, duration: '180m' },
    { name: 'Chapterwise Challenge - Bio', date: 'Next: Oct 12', marks: 100, duration: '60m' },
    { name: 'Physics Drill Series', date: 'Next: Oct 15', marks: 150, duration: '90m' },
    { name: 'Mock Board 2025', date: 'Next: Oct 20', marks: 80, duration: '180m' },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">Test Series</h3>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">All India Test Series & Drills</p>
      </div>

      <div className="space-y-4">
        {tests.map((t, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md mb-2 inline-block ${t.date === 'LIVE NOW' ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-50 text-blue-600'}`}>
                    {t.date}
                  </span>
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-tighter">{t.name}</h4>
               </div>
               <div className="text-right">
                  <p className="text-lg font-black text-gray-900 leading-none">{t.marks}</p>
                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Total Marks</p>
               </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
               <div className="flex items-center gap-1 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                  <span>⏱️</span> {t.duration}
               </div>
               <button className="bg-gray-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
                 Start Test
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestSeriesScreen;
