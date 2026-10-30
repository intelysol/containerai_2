import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { 
  User, 
  ShieldCheck, 
  Building2, 
  Key, 
  Smartphone, 
  Moon, 
  Sun, 
  Globe, 
  Check, 
  LogOut, 
  Info,
  Lock,
  BellRing,
  HelpCircle
} from 'lucide-react';

export const ProfileSettingsScreen: React.FC = () => {
  const { user, activeOrg, organizations, switchOrganization, toggle2FA, logout, updateUser } = useAuthStore();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [license, setLicense] = useState(user?.licenseNumber || '');
  const [language, setLanguage] = useState('English (Maritime Standard)');
  const [notificationSound, setNotificationSound] = useState(true);

  const handleSaveProfile = () => {
    updateUser({ name, phone, licenseNumber: license });
    setIsEditingProfile(false);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Profile Header Card */}
      <div className="p-5 rounded-2xl bg-white border border-[#E5EAF0] shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={user?.avatarUrl}
            alt={user?.name || 'Surveyor'}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#12A89D] shadow-xs"
            referrerPolicy="no-referrer"
          />
          <div>
            <h2 className="text-lg font-bold text-[#142B45]">{user?.name}</h2>
            <div className="text-xs text-slate-500 font-medium">{user?.role}</div>
            <div className="text-[11px] text-[#12A89D] font-mono-nums font-semibold mt-0.5">
              License: {user?.licenseNumber}
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsEditingProfile(!isEditingProfile)}
          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          {isEditingProfile ? 'Done' : 'Edit Profile'}
        </button>
      </div>

      {/* Edit Form */}
      {isEditingProfile && (
        <div className="p-4 rounded-2xl bg-white border border-[#12A89D] shadow-xs space-y-3 text-xs animate-in fade-in">
          <div className="font-bold text-sm text-[#142B45] pb-1 border-b border-slate-100">
            Edit Surveyor Credentials
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Telephone Contact</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Marine Surveyor License ID</label>
            <input
              type="text"
              value={license}
              onChange={(e) => setLicense(e.target.value)}
              className="w-full p-2 border rounded-lg font-mono-nums"
            />
          </div>
          <button
            onClick={handleSaveProfile}
            className="w-full py-2 bg-[#12A89D] text-white rounded-lg font-bold hover:bg-[#0E8C83] transition"
          >
            Save Changes
          </button>
        </div>
      )}

      {/* Organization Switching Context */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5EAF0] shadow-xs space-y-3">
        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-800">
          <Building2 size={16} className="text-[#12A89D]" />
          <span>Active Operating Organization</span>
        </div>
        <p className="text-xs text-slate-500">
          Switch between port alliance terminals or independent surveyor accounts.
        </p>

        <div className="space-y-2 pt-1">
          {organizations.map((org) => {
            const isSelected = org.id === activeOrg.id;
            return (
              <div
                key={org.id}
                onClick={() => switchOrganization(org.id)}
                className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between text-xs ${
                  isSelected
                    ? 'border-[#12A89D] bg-teal-50/40 ring-1 ring-[#12A89D]'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-900">{org.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono-nums mt-0.5">
                    Tier: {org.tier} · Role: {org.role} · Balance: {org.availableCredits} cr
                  </div>
                </div>
                {isSelected && <Check size={16} className="text-[#12A89D]" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Security & 2FA */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5EAF0] shadow-xs space-y-3">
        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-800">
          <ShieldCheck size={16} className="text-[#12A89D]" />
          <span>Security & Authentication</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-2.5 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-800">Two-Factor Authentication (2FA)</div>
              <div className="text-slate-500 text-[11px]">Requires 6-digit authenticator code on login</div>
            </div>
            <button
              onClick={() => toggle2FA(!user?.twoFactorEnabled)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                user?.twoFactorEnabled
                  ? 'bg-emerald-100 text-[#198754]'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-800">Registered Devices</div>
              <div className="text-slate-500 text-[11px]">3 authorized mobile and tablet terminals</div>
            </div>
            <span className="font-mono-nums font-semibold text-slate-600">3 active</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-800">Offline SQLite Cache</div>
              <div className="text-slate-500 text-[11px]">Capacity: up to 25 full container surveys</div>
            </div>
            <button 
              onClick={() => alert('Local cache verified. All SQLite tables in healthy state.')}
              className="text-xs text-[#12A89D] font-semibold hover:underline"
            >
              Verify DB
            </button>
          </div>
        </div>
      </div>

      {/* App Preferences */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5EAF0] shadow-xs space-y-3 text-xs">
        <div className="font-bold text-xs uppercase tracking-wider text-slate-800">
          Application Preferences
        </div>

        <div className="flex items-center justify-between py-1.5">
          <div className="flex items-center gap-2 text-slate-700">
            <Globe size={15} />
            <span>Inspection Terminology Language</span>
          </div>
          <span className="font-medium text-slate-500">English (ISO Standard)</span>
        </div>

        <div className="flex items-center justify-between py-1.5 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-700">
            <BellRing size={15} />
            <span>AI Completion Audio Tone</span>
          </div>
          <input
            type="checkbox"
            checked={notificationSound}
            onChange={(e) => setNotificationSound(e.target.checked)}
            className="rounded border-slate-300 text-[#12A89D]"
          />
        </div>

        <div className="flex items-center justify-between py-1.5 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-700">
            <Info size={15} />
            <span>ContainerCheck AI Mobile Version</span>
          </div>
          <span className="font-mono-nums text-slate-400">v2.4.1 (Build 419)</span>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="w-full py-3 bg-white border border-rose-200 text-[#D9534F] hover:bg-rose-50 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs"
      >
        <LogOut size={16} />
        <span>Sign Out of Surveyor Portal</span>
      </button>
    </div>
  );
};
