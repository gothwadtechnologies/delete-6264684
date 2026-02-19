
import React from 'react';

interface AddMenuModalProps {
  onClose: () => void;
  onAddBatch: () => void;
  onAddStudent: () => void;
}

const AddMenuModal: React.FC<AddMenuModalProps> = ({ onClose, onAddBatch, onAddStudent }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}> 
      <div className="bg-white rounded-2xl shadow-xl p-5 m-4 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-900 text-center mb-4">Create New</h3>
        <div className="space-y-3">
          <button 
            onClick={onAddBatch}
            className="w-full p-4 bg-blue-600 text-white rounded-xl font-bold text-sm active:scale-95 transition-all shadow-lg shadow-blue-100"
          >
            + Add New Batch
          </button>
          <button 
            onClick={onAddStudent}
            className="w-full p-4 bg-green-600 text-white rounded-xl font-bold text-sm active:scale-95 transition-all shadow-lg shadow-green-100"
          >
            + Add New Student
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMenuModal;
