
import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord, UserRole } from '../../types';
import { db } from '../../firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';

const AttendanceScreen: React.FC<{ user: User }> = ({ user }) => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role === UserRole.ADMIN) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, `users/${user.uid}/attendance`),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const attendanceList = snapshot.docs.map(doc => doc.data() as AttendanceRecord);
      setAttendance(attendanceList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching attendance: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const calculateStats = () => {
    const total = attendance.length;
    if (total === 0) return { percentage: 0, leaveDays: 0 };
    const present = attendance.filter(r => r.status === 'present' || r.status === 'late').length;
    const leaveDays = total - present;
    const percentage = Math.round((present / total) * 100);
    return { percentage, leaveDays };
  };

  const { percentage, leaveDays } = calculateStats();

  if (loading) {
    return <div className="text-center p-10">Loading attendance...</div>;
  }

  if (user.role === UserRole.ADMIN) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl m-4 border-2 border-dashed border-gray-100">
        <p className="text-gray-400 font-black text-[9px] uppercase tracking-widest">Attendance records are not applicable for admins</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Percentage</p>
          <h3 className="text-3xl font-black text-blue-600">{percentage}%</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Leave Days</p>
          <h3 className="text-3xl font-black text-red-500">{leaveDays}</h3>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
          <h3 className="text-xs font-bold text-gray-600 uppercase tracking-widest">Attendance Log</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {attendance.length > 0 ? attendance.map((record, idx) => (
            <div key={idx} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  record.status === 'present' ? 'bg-green-500' :
                  record.status === 'absent' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                <span className="text-sm font-semibold text-gray-700">{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg ${
                record.status === 'present' ? 'text-green-600 bg-green-50' :
                record.status === 'absent' ? 'text-red-600 bg-red-50' : 'text-yellow-600 bg-yellow-50'
              }`}>
                {record.status}
              </span>
            </div>
          )) : (
            <p className="text-center text-gray-400 text-xs py-10">No attendance records found.</p>
          )}
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
