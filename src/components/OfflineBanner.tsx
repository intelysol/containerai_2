import React from 'react';
import { useSyncStore } from '../store/useSyncStore';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const { isOnline, isSimulatedOffline, syncQueue, isSyncing, syncAll, toggleSimulatedOffline } = useSyncStore();
  const pendingCount = syncQueue.filter((i) => i.status !== 'COMPLETED').length;

  if (isOnline && !isSimulatedOffline && pendingCount === 0) {
    return null;
  }

  return (
    <div className={`px-4 py-2.5 transition-colors border-b ${
      !isOnline 
        ? 'bg-[#142B45] text-white border-amber-500/30' 
        : 'bg-emerald-50 text-emerald-900 border-emerald-200'
    }`}>
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <WifiOff size={15} className="text-amber-400 shrink-0" />
          ) : (
            <Wifi size={15} className="text-emerald-600 shrink-0" />
          )}
          <span>
            {!isOnline ? (
              <>
                <strong className="font-semibold">Offline Mode Active</strong> — Inspections will be saved locally in queue ({pendingCount} pending).
              </>
            ) : (
              <>
                <strong className="font-semibold">Online</strong> — Ready to synchronize {pendingCount} inspection{pendingCount === 1 ? '' : 's'}.
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isOnline && pendingCount > 0 && (
            <button
              onClick={() => syncAll()}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700 transition disabled:opacity-50"
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </button>
          )}

          <button
            onClick={toggleSimulatedOffline}
            title="Toggle offline simulator for testing"
            className={`px-2 py-1 rounded text-[11px] font-medium border transition ${
              !isOnline
                ? 'bg-amber-500/20 text-amber-200 border-amber-400/40 hover:bg-amber-500/30'
                : 'bg-slate-200/80 text-slate-700 border-slate-300 hover:bg-slate-300'
            }`}
          >
            {!isOnline ? 'Go Online' : 'Simulate Offline'}
          </button>
        </div>
      </div>
    </div>
  );
};
