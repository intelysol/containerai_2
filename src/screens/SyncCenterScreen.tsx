import React from 'react';
import { useSyncStore } from '../store/useSyncStore';
import { useCreditStore } from '../store/useCreditStore';
import { 
  Cloud, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Trash2, 
  ArrowRight,
  Database,
  Coins,
  Camera
} from 'lucide-react';

interface Props {
  onNavigateToWallet: () => void;
  onViewInspection: (id: string) => void;
}

export const SyncCenterScreen: React.FC<Props> = ({
  onNavigateToWallet,
  onViewInspection,
}) => {
  const { 
    isOnline, 
    isSimulatedOffline, 
    isSyncing, 
    lastSyncTime, 
    syncQueue, 
    syncAll, 
    retryItem, 
    removeItem, 
    toggleSimulatedOffline 
  } = useSyncStore();

  const { availableCredits } = useCreditStore();

  const pendingCount = syncQueue.filter((q) => q.status === 'PENDING').length;
  const uploadingCount = syncQueue.filter((q) => q.status === 'UPLOADING' || q.status === 'RESERVING').length;
  const completedCount = syncQueue.filter((q) => q.status === 'COMPLETED').length;
  const failedCount = syncQueue.filter((q) => q.status === 'FAILED').length;

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[#142B45] flex items-center gap-2">
            <RefreshCw size={24} className="text-[#12A89D]" />
            <span>Field Synchronization Center</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manages offline inspection SQLite queue and multi-part photo uploads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSimulatedOffline}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1.5 ${
              !isOnline
                ? 'bg-amber-500/20 text-amber-800 border-amber-300'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            {!isOnline ? <WifiOff size={14} /> : <Wifi size={14} className="text-[#12A89D]" />}
            <span>{isOnline ? 'Network Online' : 'Simulating Offline'}</span>
          </button>

          <button
            onClick={() => syncAll()}
            disabled={!isOnline || isSyncing || syncQueue.length === 0}
            className="px-4 py-1.5 bg-[#12A89D] text-white rounded-lg text-xs font-bold hover:bg-[#0E8C83] transition shadow-xs flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
            <span>{isSyncing ? 'Synchronizing...' : 'Sync All Queue'}</span>
          </button>
        </div>
      </div>

      {/* Connectivity & Last Sync Card */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5EAF0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
          }`}>
            {isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
          </div>
          <div>
            <div className="font-bold text-slate-900">
              {isOnline ? 'Cloud Service Connection Active' : 'Offline Mode — Local Cache Active'}
            </div>
            <div className="text-slate-500 font-mono-nums mt-0.5 text-[11px]">
              Last successful sync: {lastSyncTime}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Available Credits</div>
            <div className="font-bold font-mono-nums text-[#142B45] text-sm">{availableCredits} Credits</div>
          </div>
          {availableCredits === 0 && (
            <button
              onClick={onNavigateToWallet}
              className="px-2.5 py-1 bg-amber-600 text-white rounded text-xs font-semibold"
            >
              Add Credits
            </button>
          )}
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-white rounded-xl border border-[#E5EAF0] shadow-2xs">
          <div className="text-[10px] uppercase font-semibold text-slate-500">Pending Sync</div>
          <div className="text-2xl font-bold font-mono-nums text-slate-800 mt-1">{pendingCount}</div>
        </div>
        <div className="p-3 bg-white rounded-xl border border-[#E5EAF0] shadow-2xs">
          <div className="text-[10px] uppercase font-semibold text-blue-600">Uploading</div>
          <div className="text-2xl font-bold font-mono-nums text-blue-800 mt-1">{uploadingCount}</div>
        </div>
        <div className="p-3 bg-white rounded-xl border border-[#E5EAF0] shadow-2xs">
          <div className="text-[10px] uppercase font-semibold text-[#198754]">Completed</div>
          <div className="text-2xl font-bold font-mono-nums text-[#198754] mt-1">{completedCount}</div>
        </div>
        <div className="p-3 bg-white rounded-xl border border-[#E5EAF0] shadow-2xs">
          <div className="text-[10px] uppercase font-semibold text-[#D9534F]">Failed</div>
          <div className="text-2xl font-bold font-mono-nums text-[#D9534F] mt-1">{failedCount}</div>
        </div>
      </div>

      {/* Queue Items List */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Inspections in Local Synchronization Queue
        </div>

        {syncQueue.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#E5EAF0] text-slate-500 text-xs">
            <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
            <h4 className="font-bold text-slate-800">Queue is Clear</h4>
            <p className="text-slate-400 mt-0.5">
              All container inspections and captured photographs are synchronized with the cloud backend.
            </p>
          </div>
        ) : (
          syncQueue.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-[#E5EAF0] bg-white shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono-nums font-bold text-base text-[#142B45]">
                    {item.containerNumber}
                  </div>
                  <div className="text-xs text-slate-500 font-mono-nums mt-0.5 flex items-center gap-2">
                    <span>{item.referenceNumber}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Camera size={12} /> {item.photoCount} photos
                    </span>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="text-right">
                  <span className={`text-xs font-bold capitalize ${
                    item.status === 'COMPLETED'
                      ? 'text-[#198754]'
                      : item.status === 'FAILED'
                      ? 'text-[#D9534F]'
                      : item.status === 'UPLOADING'
                      ? 'text-blue-600'
                      : 'text-amber-700'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono-nums mt-0.5">
                    {item.lastAttempt ? `Attempted: ${item.lastAttempt}` : 'Queued'}
                  </div>
                </div>
              </div>

              {/* Upload Progress Bar */}
              {(item.status === 'UPLOADING' || item.status === 'RESERVING' || item.status === 'COMPLETED') && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono-nums text-slate-500">
                    <span>Upload & Verification Progress</span>
                    <span>{item.uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      style={{ width: `${item.uploadProgress}%` }}
                      className="h-full bg-[#12A89D] transition-all duration-300"
                    />
                  </div>
                </div>
              )}

              {/* Insufficient credit warning */}
              {availableCredits === 0 && item.status === 'PENDING' && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle size={14} className="text-[#D9534F] shrink-0" />
                    <span>Insufficient credits to submit. Needs 1 credit.</span>
                  </div>
                  <button
                    onClick={onNavigateToWallet}
                    className="font-bold underline text-xs"
                  >
                    Buy
                  </button>
                </div>
              )}

              {/* Actions row */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => onViewInspection(item.id)}
                  className="text-slate-600 hover:text-slate-900 font-medium"
                >
                  View Survey
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-[#D9534F] rounded transition"
                    title="Remove local draft"
                  >
                    <Trash2 size={15} />
                  </button>

                  <button
                    onClick={() => retryItem(item.id)}
                    disabled={!isOnline || isSyncing}
                    className="px-3 py-1 bg-[#142B45] text-white rounded-lg font-semibold hover:bg-[#203F5F] transition disabled:opacity-40"
                  >
                    Sync Now
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
