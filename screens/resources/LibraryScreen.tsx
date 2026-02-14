
import React from 'react';

const LibraryScreen: React.FC = () => {
  const books = [
    { title: 'Concepts of Physics', author: 'H.C. Verma', category: 'Physics', icon: '📔' },
    { title: 'Organic Chemistry', author: 'O.P. Tandon', category: 'Chemistry', icon: '🧪' },
    { title: 'Calculus Made Easy', author: 'S.L. Loney', category: 'Maths', icon: '📐' },
    { title: 'Biology Vol 1', author: 'NCERT', category: 'Biology', icon: '🧬' },
  ];

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">E-Library</h3>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Access all reference books online</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {books.map((book, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center group active:scale-95 transition-all">
            <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-3xl mb-3 border border-gray-50 group-hover:bg-blue-50 transition-colors">
              {book.icon}
            </div>
            <h4 className="text-[11px] font-black text-gray-900 uppercase leading-tight line-clamp-2 mb-1">{book.title}</h4>
            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-3">{book.category}</p>
            <button className="w-full bg-gray-900 text-white py-2 rounded-lg text-[9px] font-black uppercase tracking-widest">Read Now</button>
          </div>
        ))}
      </div>

      <div className="bg-blue-600 p-6 rounded-2xl text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10">
          <h3 className="text-lg font-black uppercase tracking-tight mb-1">Premium Access</h3>
          <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Get access to 500+ solved modules</p>
        </div>
        <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
      </div>
    </div>
  );
};

export default LibraryScreen;
