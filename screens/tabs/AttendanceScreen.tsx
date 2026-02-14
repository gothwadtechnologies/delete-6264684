
import React from 'react';
import { User, AttendanceRecord } from '../../types';

const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { date: 'Dec 05', status: 'present' },
  { date: 'Dec 04', status: 'present' },
  { date: 'Dec 03', status: 'absent' },
  { date: 'Dec 02', status: 'present' },
  { date: 'Dec 01', status: 'late' },
];

const AttendanceScreen: React.FC<{ user: User }> = () => {
  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Percentage</p>
          <h3 className="text-3xl font-black text-blue-600">92%</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Leave Days</p>
          <h3 className="text-3xl font-black text-red-500">2</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
          <h3 className="text-xs font-bold text-gray-600 uppercase tracking-widest">Attendance Log</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {MOCK_ATTENDANCE.map((record, idx) => (
            <div key={idx} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  record.status === 'present' ? 'bg-green-500' : 
                  record.status === 'absent' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                <span className="text-sm font-semibold text-gray-700">{record.date}</span>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg ${
                record.status === 'present' ? 'text-green-600 bg-green-50' : 
                record.status === 'absent' ? 'text-red-600 bg-red-50' : 'text-yellow-600 bg-yellow-50'
              }`}>
                {record.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
        <span className="text-2xl">💡</span>
        <p className="text-[11px] text-blue-700 font-medium">Regular attendance is highly correlated with better exam performance. Keep it up!</p>
      </div>
    </div>
  );
};

export default AttendanceScreen;
