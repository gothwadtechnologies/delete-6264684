
import React, { useState, useEffect } from 'react';
import { User, FeeRecord, UserRole } from '../../types';
import { db } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const FeesScreen: React.FC<{ user: User }> = ({ user }) => {
  const [feeRecord, setFeeRecord] = useState<FeeRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role === UserRole.ADMIN) {
      setLoading(false);
      return;
    }

    // Assume student's fee details are stored in a document named after their UID in a 'fees' collection.
    const feeDocRef = doc(db, 'fees', user.uid);

    const unsubscribe = onSnapshot(feeDocRef, (doc) => {
      if (doc.exists()) {
        setFeeRecord(doc.data() as FeeRecord);
      } else {
        // Handle case where no fee record exists for the user
        setFeeRecord(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching fee record: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return <div className="text-center py-20">Loading fee details...</div>;
  }

  if (user.role === UserRole.ADMIN) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl m-4 border-2 border-dashed border-gray-100">
        <p className="text-gray-400 font-black text-[9px] uppercase tracking-widest">Fee management for admins is TBD</p>
      </div>
    );
  }

  if (!feeRecord) {
    return (
        <div className="text-center py-20 bg-white rounded-2xl m-4 border-2 border-dashed border-gray-100">
            <p className="text-gray-400 font-black text-[9px] uppercase tracking-widest">No fee record found for this user.</p>
      </div>
    );
  }

  const pending = feeRecord.total - feeRecord.paid;

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total Outstanding</p>
        <h2 className="text-4xl font-black text-gray-800">₹{pending.toLocaleString()}</h2>
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-50 text-sm">
          <div className="text-left">
            <p className="text-gray-400 text-xs">Total Fees</p>
            <p className="font-bold text-gray-700">₹{feeRecord.total.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs">Total Paid</p>
            <p className="font-bold text-green-600">₹{feeRecord.paid.toLocaleString()}</p>
          </div>
        </div>
        <button className="w-full bg-blue-600 text-white font-bold py-3 mt-6 rounded-xl shadow-lg shadow-blue-200">
          Pay Now
        </button>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-bold text-gray-800 px-1 mb-3">Recent Transactions</h3>
        <div className="space-y-2">
          {feeRecord.history.length > 0 ? feeRecord.history.map((tx, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center font-bold">₹</div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Payment Received</p>
                  <p className="text-[10px] text-gray-400">{new Date(tx.date).toLocaleDateString()} • {tx.method}</p>
                </div>
              </div>
              <p className="text-sm font-bold text-green-600">+₹{tx.amount}</p>
            </div>
          )) : (
            <p className="text-center text-gray-400 text-xs py-4">No transaction history.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeesScreen;
