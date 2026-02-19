
import React from 'react';

// Define the menu item types
export type BatchMenuItem = 'CURRICULUM' | 'STUDENTS' | 'TESTS' | 'ATTENDANCE' | 'FEES' | 'PYQS';

interface MenuItem {
  id: BatchMenuItem;
  title: string;
  icon: string; // Emoji or SVG path
  color: string; // Tailwind color classes
}

// Define the menu items data
const menuItems: MenuItem[] = [
  { id: 'CURRICULUM', title: 'Curriculum', icon: '🧬', color: 'indigo' },
  { id: 'STUDENTS', title: 'Students', icon: '👥', color: 'green' },
  { id: 'TESTS', title: 'Tests', icon: '📝', color: 'blue' },
  { id: 'ATTENDANCE', title: 'Attendance', icon: '✅', color: 'yellow' },
  { id: 'FEES', title: 'Fees', icon: '💰', color: 'pink' },
  { id: 'PYQS', title: 'PYQs', icon: '📜', color: 'purple' },
];

interface BatchMenuScreenProps {
  onSelectItem: (item: BatchMenuItem) => void;
}

// A map of colors for easy access
const colors: { [key: string]: { bg: string; text: string; border: string } } = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
  green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
};

const BatchMenuScreen: React.FC<BatchMenuScreenProps> = ({ onSelectItem }) => {
  return (
    <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
            {menuItems.map(item => {
                const color = colors[item.color];
                return (
                    <button 
                        key={item.id} 
                        onClick={() => onSelectItem(item.id)} 
                        className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-2 transition-all active:scale-95 text-center"
                    >
                        <div className={`w-12 h-12 ${color.bg} ${color.text} rounded-lg flex items-center justify-center text-2xl border ${color.border} shrink-0`}>
                            {item.icon}
                        </div>
                        <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider">{item.title}</h4>
                    </button>
                );
            })}
        </div>
    </div>
  );
};

export default BatchMenuScreen;
