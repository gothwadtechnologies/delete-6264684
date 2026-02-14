
import React from 'react';
import { User, FeeRecord } from '../../types';

const MOCK_FEES: FeeRecord = {
  total: 25000,
  paid: 15000,
  history: [
    { amount: 10000, date: '2023-10-01', method: 'Razorpay' },
    { amount: 5000, date: '2023-11-15', method: 'UPI' },
  ]
};

const FeesScreen: React.FC<{ user: User }> = () => {
  const pending = MOCK_FEES.total - MOCK_FEES.paid;

  return (
    <div className="p-4 space-y-4">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total Outstanding</p>
        <h2 className="text-4xl font-black text-gray-800">₹{pending.toLocaleString()}</h2>
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-50 text-sm">
          <div className="text-left">
            <p className="text-gray-400 text-xs">Total Fees</p>
            <p className="font-bold text-gray-700">₹{MOCK_FEES.total.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs">Total Paid</p>
            <p className="font-bold text-green-600">₹{MOCK_FEES.paid.toLocaleString()}</p>
          </div>
        </div>
        <button className="w-full bg-blue-600 text-white font-bold py-3 mt-6 rounded-xl shadow-lg shadow-blue-200">
          Pay Now
        </button>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-bold text-gray-800 px-1 mb-3">Recent Transactions</h3>
        <div className="space-y-2">
          {MOCK_FEES.history.map((tx, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center font-bold">₹</div>
                <div>
                  <p className="text-xs font-bold text-gray-800">Payment Received</p>
                  <p className="text-[10px] text-gray-400">{tx.date} • {tx.method}</p>
                </div>
              </div>
              <p className="text-sm font-bold text-green-600">+₹{tx.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeesScreen;
