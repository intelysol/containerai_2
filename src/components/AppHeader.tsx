import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useSyncStore } from '../store/useSyncStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { 
  Building2, 
  Wifi, 
  WifiOff, 
  Bell, 
  Menu, 
  Coins, 
  Check, 
  ChevronDown 
} from 'lucide-react';

interface Props {
  onOpenDrawer: () => void;
  onOpenNotifications: () => void;
  onNavigateToWallet: () => void;
}

export const AppHeader: React.FC<Props> = ({ 
  onOpenDrawer, 
  onOpenNotifications,
  onNavigateToWallet 
}) => {
  const { user, activeOrg, organizations, switchOrganization } = useAuthStore();
  const { isOnline } = useSyncStore();
  const { notifications } = useNotificationStore();
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-[#142B45] text-white border-b border-[#203F5F] px-4 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDrawer}
            aria-label="Open navigation menu"
            className="p-1.5 -ml-1 text-slate-300 hover:text-white rounded-lg hover:bg-[#203F5F]/60 transition"
          >
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#12A89D] flex items-center justify-center font-bold text-white text-sm shadow-xs">
              CC
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight leading-none text-white">
                ContainerCheck<span className="text-[#12A89D]"> AI</span>
              </span>
              <span className="text-[10px] text-slate-300 tracking-wide uppercase mt-0.5 font-medium">
                Maritime Surveyor Suite
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right: Organization Switcher & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Org Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowOrgDropdown(!showOrgDropdown)}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#203F5F]/80 hover:bg-[#203F5F] text-xs font-medium text-slate-200 transition border border-[#203F5F]"
            >
              <Building2 size={14} className="text-[#12A89D]" />
              <span className="max-w-[130px] truncate">{activeOrg.name}</span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {showOrgDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Active Organization
                </div>
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      switchOrganization(org.id);
                      setShowOrgDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition text-xs"
                  >
                    <div>
                      <div className="font-medium text-slate-900">{org.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono-nums">
                        {org.availableCredits} credits · {org.role}
                      </div>
                    </div>
                    {org.id === activeOrg.id && (
                      <Check size={14} className="text-[#12A89D] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Credits Quick Pill */}
          <button
            onClick={onNavigateToWallet}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#12A89D]/20 hover:bg-[#12A89D]/30 border border-[#12A89D]/40 text-xs text-teal-200 transition"
          >
            <Coins size={13} className="text-[#12A89D]" />
            <span className="font-mono-nums font-semibold text-white">{activeOrg.availableCredits}</span>
            <span className="text-[11px] text-slate-300 hidden xs:inline">cr</span>
          </button>

          {/* Network icon */}
          <div 
            title={isOnline ? 'Online - Cloud Sync Active' : 'Offline - Queued locally'}
            className="p-1.5 text-slate-300"
          >
            {isOnline ? (
              <Wifi size={17} className="text-[#12A89D]" />
            ) : (
              <WifiOff size={17} className="text-amber-400" />
            )}
          </div>

          {/* Notifications Trigger */}
          <button
            onClick={onOpenNotifications}
            aria-label="View notifications"
            className="relative p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-[#203F5F]/60 transition"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#12A89D]" />
            )}
          </button>

          {/* User Avatar */}
          <button
            onClick={onOpenDrawer}
            aria-label="Open profile settings"
            className="w-8 h-8 rounded-full overflow-hidden border border-slate-500/50 hover:border-[#12A89D] transition shrink-0 ml-0.5"
          >
            <img
              src={user?.avatarUrl}
              alt={user?.name || 'Surveyor'}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
