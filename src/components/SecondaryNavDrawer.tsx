import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useCreditStore } from '../store/useCreditStore';
import { useSyncStore } from '../store/useSyncStore';
import { 
  Building2, 
  Coins, 
  RefreshCw,
  Cloud,
  Bell, 
  ShieldCheck, 
  HelpCircle, 
  LogOut, 
  X, 
  Check, 
  ChevronRight,
  UserCheck
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: 'wallet' | 'sync' | 'notifications' | 'profile' | 'security' | 'help') => void;
}

export const SecondaryNavDrawer: React.FC<Props> = ({ isOpen, onClose, onNavigate }) => {
  const { user, activeOrg, organizations, switchOrganization, logout } = useAuthStore();
  const { availableCredits } = useCreditStore();
  const { syncQueue } = useSyncStore();
  const pendingSyncCount = syncQueue.filter((q) => q.status !== 'COMPLETED').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Drawer content */}
      <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-4 bg-[#142B45] text-white flex items-center justify-between border-b border-[#203F5F]">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatarUrl}
              alt={user?.name || 'Surveyor'}
              className="w-11 h-11 rounded-full object-cover border-2 border-[#12A89D]"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate">{user?.name}</div>
              <div className="text-[11px] text-teal-200 flex items-center gap-1 font-mono-nums">
                <UserCheck size={12} /> {user?.licenseNumber}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#203F5F] transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Organization Switcher Section */}
        <div className="p-4 border-b border-slate-100 bg-[#F5F7FA]">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Building2 size={13} className="text-[#12A89D]" />
            Active Organization
          </div>
          <div className="space-y-1.5">
            {organizations.map((org) => {
              const isActive = org.id === activeOrg.id;
              return (
                <button
                  key={org.id}
                  onClick={() => switchOrganization(org.id)}
                  className={`w-full text-left p-2.5 rounded-lg border transition flex items-center justify-between text-xs ${
                    isActive
                      ? 'bg-white border-[#12A89D] text-[#142B45] font-semibold shadow-xs'
                      : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="truncate">{org.name}</div>
                    <div className="text-[11px] font-normal text-slate-500 font-mono-nums">
                      {org.code} · {org.role}
                    </div>
                  </div>
                  {isActive && <Check size={14} className="text-[#12A89D] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <button
            onClick={() => { onNavigate('wallet'); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition text-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#12A89D] flex items-center justify-center">
                <Coins size={18} />
              </div>
              <span className="font-medium text-slate-800">Credit Wallet</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono-nums font-semibold text-xs text-[#12A89D]">
                {availableCredits} cr
              </span>
              <ChevronRight size={16} className="text-slate-400" />
            </div>
          </button>

          <button
            onClick={() => { onNavigate('sync'); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition text-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <RefreshCw size={18} />
              </div>
              <span className="font-medium text-slate-800">Synchronization Center</span>
            </div>
            <div className="flex items-center gap-2">
              {pendingSyncCount > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px] font-mono-nums">
                  {pendingSyncCount}
                </span>
              ) : (
                <span className="text-[11px] text-emerald-600 font-medium">Ready</span>
              )}
              <ChevronRight size={16} className="text-slate-400" />
            </div>
          </button>

          <button
            onClick={() => { onNavigate('notifications'); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition text-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Bell size={18} />
              </div>
              <span className="font-medium text-slate-800">Notifications</span>
            </div>
            <ChevronRight size={16} className="text-slate-400" />
          </button>

          <button
            onClick={() => { onNavigate('security'); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition text-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
              <span className="font-medium text-slate-800">Security & 2FA</span>
            </div>
            <ChevronRight size={16} className="text-slate-400" />
          </button>

          <button
            onClick={() => { onNavigate('help'); onClose(); }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition text-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                <HelpCircle size={18} />
              </div>
              <span className="font-medium text-slate-800">Help & ISO Standards</span>
            </div>
            <ChevronRight size={16} className="text-slate-400" />
          </button>
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-[#D9534F] transition text-sm font-medium"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
          <div className="text-center text-[10px] text-slate-400 mt-2 font-mono-nums">
            ContainerCheck AI v2.4.1 (Mobile Production)
          </div>
        </div>
      </div>
    </div>
  );
};
