
import React, { useState, useEffect } from 'react';
import { User, UserRole, Notification, GlobalSettings, Batch } from '../types';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, limit, where } from 'firebase/firestore';

interface NotificationsScreenProps {
  user: User;
  settings: GlobalSettings;
  onBack: () => void;
}

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ user, settings, onBack }) => {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>(user.role === UserRole.ADMIN ? 'sent' : 'received');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  
  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newType, setNewType] = useState<Notification['type']>('info');
  const [targetType, setTargetType] = useState<'all' | 'batch'>('all');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = user.role === UserRole.ADMIN;

  // Fetch Batches for targeting
  useEffect(() => {
    if (!db || !isAdmin) return;
    const unsub = onSnapshot(collection(db, 'batches'), (snap) => {
      setBatches(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Batch)));
    });
    return () => unsub();
  }, [isAdmin]);

  // Fetch Notifications
  useEffect(() => {
    setQueryError(null);
    if (!db) {
      setNotifications([
        { id: '1', title: 'Demo Received', message: 'This is a demo message.', type: 'info', senderName: 'Admin', senderUid: '1', targetType: 'all', timestamp: new Date() }
      ]);
      return;
    }

    let q;
    if (activeTab === 'sent') {
      // FIX: Removed orderBy('timestamp', 'desc') to avoid composite index requirement
      // We will sort client-side in the snapshot listener
      q = query(
        collection(db, 'notifications'), 
        where('senderUid', '==', user.uid),
        limit(50) 
      );
    } else {
      // Single-field orderBy doesn't require composite index
      q = query(
        collection(db, 'notifications'),
        orderBy('timestamp', 'desc'),
        limit(30)
      );
    }

    const unsub = onSnapshot(q, (snap) => {
      let data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      
      // Client-side sort for Sent tab to resolve index error
      if (activeTab === 'sent') {
        data.sort((a, b) => {
          const getTime = (t: any) => {
            if (!t) return 0;
            if (t.toMillis) return t.toMillis();
            if (t.toDate) return t.toDate().getTime();
            if (t instanceof Date) return t.getTime();
            if (t.seconds) return t.seconds * 1000;
            return 0;
          };
          return getTime(b.timestamp) - getTime(a.timestamp);
        });
      }
      
      setNotifications(data);
    }, (err) => {
      console.error("Firestore error:", err);
      if (err.message.includes('index')) {
        setQueryError("A database index is being built or is missing. Please try again in a few minutes.");
      } else {
        setQueryError("Failed to load notifications.");
      }
    });

    return () => unsub();
  }, [activeTab, user.uid]);

  const handleSend = async () => {
    if (!newTitle || !newMessage) return;
    if (targetType === 'batch' && !selectedBatchId) {
      alert("Please select a target batch.");
      return;
    }

    setIsLoading(true);
    try {
      const selectedBatch = batches.find(b => b.id === selectedBatchId);
      if (db) {
        await addDoc(collection(db, 'notifications'), {
          title: newTitle,
          message: newMessage,
          type: newType,
          senderName: user.name,
          senderUid: user.uid,
          targetType,
          targetBatchId: targetType === 'batch' ? selectedBatchId : null,
          targetBatchName: targetType === 'batch' ? selectedBatch?.name : 'All Students',
          timestamp: serverTimestamp()
        });
      }
      setNewTitle('');
      setNewMessage('');
      setIsCreating(false);
      setActiveTab('sent');
    } catch (e) {
      console.error(e);
      alert('Failed to send.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-white shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-black text-gray-900 tracking-tight uppercase">Communication Hub</h2>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">Announcements & Alerts</p>
        </div>
      </div>

      {/* Segmented Control */}
      {isAdmin && (
        <div className="px-4 pt-4 shrink-0">
          <div className="bg-gray-100 p-1 rounded-2xl flex items-center">
            <button 
              onClick={() => setActiveTab('received')}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'received' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'
              }`}
            >
              Inbox
            </button>
            <button 
              onClick={() => setActiveTab('sent')}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === 'sent' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'
              }`}
            >
              Outbox
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto scroll-hide p-4 pb-24">
        {queryError && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-[10px] font-bold text-amber-700 uppercase tracking-widest leading-relaxed">
            ⚠️ {queryError}
          </div>
        )}

        {activeTab === 'sent' && isAdmin && (
          <div className="mb-6">
            {!isCreating ? (
              <button 
                onClick={() => setIsCreating(true)}
                className="w-full bg-blue-600 p-5 rounded-3xl shadow-xl shadow-blue-100 flex items-center justify-between text-white group active:scale-95 transition-all"
              >
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">📢</div>
                   <div className="text-left">
                      <h4 className="text-xs font-black uppercase tracking-widest">New Announcement</h4>
                      <p className="text-[9px] text-white/60 font-bold uppercase tracking-widest mt-0.5">Blast to batch or all</p>
                   </div>
                </div>
                <span className="text-2xl opacity-40 group-hover:opacity-100">⊕</span>
              </button>
            ) : (
              <div className="bg-gray-900 p-6 rounded-[2rem] shadow-2xl space-y-5 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex justify-between items-center">
                   <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Composer</h3>
                   <button onClick={() => setIsCreating(false)} className="text-white/30 hover:text-white transition-colors">✕</button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Target Audience</label>
                    <div className="flex gap-2">
                       <button 
                        onClick={() => setTargetType('all')}
                        className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${
                          targetType === 'all' ? 'bg-white text-black border-white' : 'border-white/10 text-white/40'
                        }`}
                       >
                        All Students
                       </button>
                       <button 
                        onClick={() => setTargetType('batch')}
                        className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${
                          targetType === 'batch' ? 'bg-white text-black border-white' : 'border-white/10 text-white/40'
                        }`}
                       >
                        Specific Batch
                       </button>
                    </div>
                  </div>

                  {targetType === 'batch' && (
                    <div className="space-y-1.5 animate-in fade-in slide-in-from-left-2">
                      <select 
                        className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-xs font-bold text-white outline-none appearance-none"
                        value={selectedBatchId}
                        onChange={(e) => setSelectedBatchId(e.target.value)}
                      >
                        <option value="" className="bg-gray-900">Choose a Batch</option>
                        {batches.map(b => (
                          <option key={b.id} value={b.id} className="bg-gray-900">{b.name} ({b.classLevel})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Title</label>
                    <input 
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm font-bold text-white outline-none focus:bg-white/10 transition-all"
                      placeholder="Announcement Heading"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-1">Message Description</label>
                    <textarea 
                      className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm font-bold text-white outline-none focus:bg-white/10 h-28 transition-all"
                      placeholder="Write your message here..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    {(['info', 'alert', 'update'] as const).map(t => (
                      <button 
                        key={t}
                        onClick={() => setNewType(t)}
                        className={`flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all ${
                          newType === t 
                            ? (t === 'alert' ? 'bg-red-500 text-white border-red-500' : 
                               t === 'update' ? 'bg-green-500 text-white border-green-500' : 
                               'bg-blue-500 text-white border-blue-500') 
                            : 'border-white/10 text-white/40'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={handleSend}
                    disabled={isLoading}
                    className="w-full bg-white text-gray-900 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Transmitting...' : 'Confirm Broadcast'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center">
               <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4 grayscale opacity-30">📪</div>
               <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest">No activity found here</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex gap-4 transition-all hover:border-blue-100">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                  n.type === 'alert' ? 'bg-red-50 text-red-500 shadow-inner' :
                  n.type === 'update' ? 'bg-green-50 text-green-500 shadow-inner' : 
                  'bg-blue-50 text-blue-500 shadow-inner'
                }`}>
                  {n.type === 'alert' ? '🚨' : n.type === 'update' ? '✨' : 'ℹ️'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight truncate pr-2">{n.title}</h4>
                    <span className="text-[8px] font-bold text-gray-300 uppercase shrink-0">
                      {n.timestamp?.toDate ? n.timestamp.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Now'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed font-medium mb-3">{n.message}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                       <span className="bg-gray-100 text-[8px] font-black text-gray-500 px-2 py-0.5 rounded-md uppercase tracking-widest">
                        {n.senderName}
                       </span>
                    </div>
                    {n.targetBatchName && (
                      <span className="text-[8px] font-bold text-blue-600/60 uppercase tracking-widest flex items-center gap-1">
                        <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                        {n.targetBatchName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsScreen;
