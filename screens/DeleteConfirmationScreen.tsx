
import React from 'react';

interface DeleteConfirmationScreenProps {
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const DeleteConfirmationScreen: React.FC<DeleteConfirmationScreenProps> = ({ itemName, onConfirm, onCancel, isLoading }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 animate-in fade-in">
      <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-sm m-4 space-y-5 animate-in zoom-in-95">
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900">Delete {itemName}?</h2>
          <p className="text-sm text-gray-500 mt-1">This action is permanent and cannot be undone.</p>
        </div>
        
        <div className="flex justify-center gap-3">
            <button
                onClick={onCancel}
                className="flex-1 p-3 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm active:scale-[0.98] transition-all"
            >
                Cancel
            </button>
            <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 p-3 bg-red-600 text-white rounded-lg font-bold text-sm disabled:bg-red-300 active:scale-[0.98] transition-all shadow-lg shadow-red-100"
            >
                {isLoading ? 'Deleting...' : 'Delete'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationScreen;
