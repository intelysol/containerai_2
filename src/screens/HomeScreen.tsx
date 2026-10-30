import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useCreditStore } from '../store/useCreditStore';
import { useInspectionStore } from '../store/useInspectionStore';
import { useSyncStore } from '../store/useSyncStore';
import { InspectionStatusBadge } from '../components/InspectionStatusBadge';
import { 
  Box, 
  PackageCheck, 
  Coins, 
  ArrowRight, 
  RefreshCw, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  CloudOff,
  ChevronRight,
  FileText
} from 'lucide-react';
import { InspectionType } from '../types';

interface Props {
  onStartInspection: (type: InspectionType) => void;
  onViewInspection: (id: string) => void;
  onNavigateToWallet: () => void;
  onNavigateToSync: () => void;
  onNavigateToReports: () => void;
  onViewAllInspections: () => void;
}

export const HomeScreen: React.FC<Props> = ({
  onStartInspection,
  onViewInspection,
  onNavigateToWallet,
  onNavigateToSync,
  onNavigateToReports,
  onViewAllInspections,
}) => {
  const { user, activeOrg } = useAuthStore();
  const { availableCredits, reservedCredits, lastSynchronized } = useCreditStore();
  const { inspections } = useInspectionStore();
  const { isOnline, syncQueue, isSyncing, syncAll } = useSyncStore();

  const pendingSyncCount = syncQueue.filter((q) => q.status !== 'COMPLETED').length;
  const inAiReviewCount = inspections.filter((i) => i.status === 'PENDING_REVIEW' || i.status === 'PROCESSING_AI').length;
  const reportsCount = inspections.filter((i) => i.status === 'APPROVED').length;

  return (
    <div className="space-y-4 pb-20">
      {/* Surveyor Hero Welcome Strip */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#142B45] to-[#203F5F] text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-teal-300 font-semibold uppercase tracking-wider">
            Maritime Terminal Surveyor Portal
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-0.5">
            Welcome back, {user?.name?.split(' ')[0] || 'Surveyor'}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-md">
            Logged into <strong className="text-white">{activeOrg.name}</strong>. Ready for ISO 6346 container inspection and AI damage surveying.
          </p>
        </div>

        {/* Quick Launch Button */}
        <button
          onClick={() => onStartInspection('EMPTY')}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 bg-[#12A89D] hover:bg-[#0E8C83] text-white text-xs font-bold rounded-xl shadow-md transition shrink-0 active:scale-95"
        >
          <Plus size={16} className="stroke-[3px]" />
          <span>New Inspection</span>
        </button>
      </div>

      {/* Credit Wallet Summary Card */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5EAF0] shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#12A89D] flex items-center justify-center">
              <Coins size={18} />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900">Inspection Credits</div>
              <div className="text-[11px] text-slate-400 font-mono-nums">
                Last synced: {lastSynchronized}
              </div>
            </div>
          </div>

          <button
            onClick={onNavigateToWallet}
            className="text-xs font-semibold text-[#12A89D] hover:text-[#0E8C83] flex items-center gap-1"
          >
            <span>Buy Credits</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">
              Available Credits
            </div>
            <div className="text-2xl font-extrabold text-[#142B45] font-mono-nums mt-0.5">
              {availableCredits}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              1 credit per container survey
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">
              Reserved in Queue
            </div>
            <div className="text-2xl font-extrabold text-amber-600 font-mono-nums mt-0.5">
              {reservedCredits}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Held for offline uploads
            </div>
          </div>
        </div>
      </div>

      {/* Operational Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-white rounded-xl border border-[#E5EAF0] shadow-xs">
          <div className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
            Total Surveys
          </div>
          <div className="text-xl font-bold font-mono-nums text-[#142B45] mt-1">
            {inspections.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">This session & cloud</div>
        </div>

        <div 
          onClick={onNavigateToSync}
          className="p-3 bg-white rounded-xl border border-[#E5EAF0] shadow-xs cursor-pointer hover:border-amber-300 transition"
        >
          <div className="text-[10px] uppercase font-semibold text-amber-600 tracking-wider flex items-center justify-between">
            <span>Pending Sync</span>
            {pendingSyncCount > 0 && <CloudOff size={12} />}
          </div>
          <div className="text-xl font-bold font-mono-nums text-amber-700 mt-1">
            {pendingSyncCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Saved locally on device</div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E5EAF0] shadow-xs">
          <div className="text-[10px] uppercase font-semibold text-blue-600 tracking-wider">
            Needs Review
          </div>
          <div className="text-xl font-bold font-mono-nums text-blue-900 mt-1">
            {inAiReviewCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">AI findings pending</div>
        </div>

        <div 
          onClick={onNavigateToReports}
          className="p-3 bg-white rounded-xl border border-[#E5EAF0] shadow-xs cursor-pointer hover:border-emerald-300 transition"
        >
          <div className="text-[10px] uppercase font-semibold text-[#198754] tracking-wider flex items-center justify-between">
            <span>Reports Ready</span>
            <FileText size={12} />
          </div>
          <div className="text-xl font-bold font-mono-nums text-[#198754] mt-1">
            {reportsCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Signed PDF certificates</div>
        </div>
      </div>

      {/* Quick Inspection Launchers */}
      <div>
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5">
          Start Container Inspection
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Empty Container */}
          <button
            onClick={() => onStartInspection('EMPTY')}
            className="p-4 bg-white rounded-2xl border border-[#E5EAF0] hover:border-[#12A89D] hover:shadow-md transition text-left group flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#12A89D] flex items-center justify-center shrink-0 group-hover:bg-[#12A89D] group-hover:text-white transition">
              <Box size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-[#142B45] group-hover:text-[#12A89D] transition">
                Empty Container Inspection
              </div>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                Inspect structural condition, side walls, floor cleanliness, corrosion, odor and light-tightness.
              </p>
              <div className="mt-2 text-[11px] font-semibold text-[#12A89D] flex items-center gap-1">
                <span>Start empty survey</span>
                <ChevronRight size={13} />
              </div>
            </div>
          </button>

          {/* Loaded Container */}
          <button
            onClick={() => onStartInspection('LOADED')}
            className="p-4 bg-white rounded-2xl border border-[#E5EAF0] hover:border-[#203F5F] hover:shadow-md transition text-left group flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#203F5F] flex items-center justify-center shrink-0 group-hover:bg-[#203F5F] group-hover:text-white transition">
              <PackageCheck size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-[#142B45] group-hover:text-[#203F5F] transition">
                Loaded Container Inspection
              </div>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                Inspect exterior panels, bolt seal integrity, cargo lashing, weight limits, and moisture indicators.
              </p>
              <div className="mt-2 text-[11px] font-semibold text-[#203F5F] flex items-center gap-1">
                <span>Start loaded survey</span>
                <ChevronRight size={13} />
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Synchronization Summary Strip */}
      {pendingSyncCount > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <CloudOff size={18} className="text-amber-600 shrink-0" />
            <div className="text-xs min-w-0">
              <span className="font-bold text-amber-900 block truncate">
                {pendingSyncCount} Inspection{pendingSyncCount === 1 ? '' : 's'} Queued Locally
              </span>
              <span className="text-amber-700 text-[11px]">
                {isOnline ? 'Online connection ready — sync now.' : 'Network is offline — will upload when connected.'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (isOnline) syncAll();
              else onNavigateToSync();
            }}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Syncing...' : isOnline ? 'Sync All' : 'View Queue'}</span>
          </button>
        </div>
      )}

      {/* Recent Inspections List */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Recent Inspections
          </div>
          <button
            onClick={onViewAllInspections}
            className="text-xs font-semibold text-[#12A89D] hover:underline flex items-center gap-1"
          >
            <span>View All ({inspections.length})</span>
            <ChevronRight size={13} />
          </button>
        </div>

        <div className="space-y-2.5">
          {inspections.slice(0, 4).map((inspection) => (
            <div
              key={inspection.id}
              onClick={() => onViewInspection(inspection.id)}
              className="p-3.5 rounded-xl bg-white border border-[#E5EAF0] hover:border-slate-300 hover:shadow-xs transition cursor-pointer flex items-center gap-3.5"
            >
              {/* Thumbnail preview */}
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                <img
                  src={inspection.photos[0]?.uri || '/src/assets/images/container_front_doors_1793341301902.jpg'}
                  alt={inspection.container.containerNumber}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Inspection Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-mono-nums font-bold text-sm text-[#142B45] truncate">
                    {inspection.container.containerNumber}
                  </div>
                  <InspectionStatusBadge status={inspection.status} size="sm" />
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="font-mono-nums">{inspection.referenceNumber}</span>
                  <span>·</span>
                  <span>{inspection.type}</span>
                  <span>·</span>
                  <span>{inspection.container.sizeType}</span>
                </div>

                <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>{inspection.container.location}</span>
                  <span className="font-mono-nums">{inspection.container.inspectionDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
