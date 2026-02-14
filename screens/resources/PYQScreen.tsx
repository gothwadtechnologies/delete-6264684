
import React from 'react';

const PYQScreen: React.FC = () => {
  const years = ['2024', '2023', '2022', '2021', '2020'];
  const exams = [
    { name: 'JEE Main', color: 'blue' },
    { name: 'JEE Advanced', color: 'indigo' },
    { name: 'NEET UG', color: 'green' },
    { name: 'CBSE Boards', color: 'orange' },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">PYQ Archive</h3>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Last 10 Years Solved Papers</p>
      </div>

      <div className="space-y-3">
        {exams.map((exam, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border border-${exam.color}-100 bg-${exam.color}-50 text-${exam.color}-600`}>
              <span className="text-[10px] font-black uppercase">PYQ</span>
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-tight">{exam.name}</h4>
              <div className="flex gap-2 mt-2 overflow-x-auto scroll-hide">
                {years.map(y => (
                  <button key={y} className="bg-gray-50 px-3 py-1.5 rounded-lg text-[9px] font-black text-gray-500 uppercase hover:bg-gray-900 hover:text-white transition-all">
                    {y}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PYQScreen;
