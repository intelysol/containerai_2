import React from 'react';
import { Home, ClipboardList, Plus, FileText, User } from 'lucide-react';

export type NavTab = 'home' | 'inspections' | 'new-inspection' | 'reports' | 'profile';

interface Props {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const BottomNavigation: React.FC<Props> = ({ activeTab, onChangeTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#132233]/95 backdrop-blur-md border-t border-[#E5EAF0] dark:border-[#1E334A] pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-1">
        {/* 1. Home */}
        <button
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeTab === 'home'
              ? 'text-[#142B45] font-semibold dark:text-white'
              : 'text-[#748397] hover:text-[#172B40]'
          }`}
        >
          <Home size={20} className={activeTab === 'home' ? 'stroke-[2.5px] text-[#12A89D]' : ''} />
          <span className="text-[10px] tracking-tight mt-1">Home</span>
        </button>

        {/* 2. Inspections */}
        <button
          onClick={() => onChangeTab('inspections')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeTab === 'inspections'
              ? 'text-[#142B45] font-semibold dark:text-white'
              : 'text-[#748397] hover:text-[#172B40]'
          }`}
        >
          <ClipboardList size={20} className={activeTab === 'inspections' ? 'stroke-[2.5px] text-[#12A89D]' : ''} />
          <span className="text-[10px] tracking-tight mt-1">Inspections</span>
        </button>

        {/* 3. New Inspection (Prominent Center Action) */}
        <div className="flex items-center justify-center">
          <button
            onClick={() => onChangeTab('new-inspection')}
            aria-label="Start New Container Inspection"
            className="w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-[#142B45] to-[#203F5F] text-white flex items-center justify-center shadow-lg shadow-[#142B45]/25 border-2 border-white hover:scale-105 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-full bg-[#12A89D] flex items-center justify-center">
              <Plus size={22} className="stroke-[3px] text-white" />
            </div>
          </button>
        </div>

        {/* 4. Reports */}
        <button
          onClick={() => onChangeTab('reports')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeTab === 'reports'
              ? 'text-[#142B45] font-semibold dark:text-white'
              : 'text-[#748397] hover:text-[#172B40]'
          }`}
        >
          <FileText size={20} className={activeTab === 'reports' ? 'stroke-[2.5px] text-[#12A89D]' : ''} />
          <span className="text-[10px] tracking-tight mt-1">Reports</span>
        </button>

        {/* 5. Profile */}
        <button
          onClick={() => onChangeTab('profile')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            activeTab === 'profile'
              ? 'text-[#142B45] font-semibold dark:text-white'
              : 'text-[#748397] hover:text-[#172B40]'
          }`}
        >
          <User size={20} className={activeTab === 'profile' ? 'stroke-[2.5px] text-[#12A89D]' : ''} />
          <span className="text-[10px] tracking-tight mt-1">Profile</span>
        </button>
      </div>
    </nav>
  );
};
