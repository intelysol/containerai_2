import React from 'react';
import { useNotificationStore } from '../store/useNotificationStore';
import { 
  Bell, 
  CheckCheck, 
  Sparkles, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  Info
} from 'lucide-react';

interface Props {
  onSelectInspection?: (id: string) => void;
  onSelectReport?: (id: string) => void;
}

export const NotificationsScreen: React.FC<Props> = ({
  onSelectInspection,
  onSelectReport,
}) => {
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} className="text-[#198754]" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-[#E6A23C]" />;
      case 'error':
        return <AlertTriangle size={16} className="text-[#D9534F]" />;
      default:
        return <Sparkles size={16} className="text-[#12A89D]" />;
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[#142B45] flex items-center gap-2">
            <Bell size={22} className="text-[#12A89D]" />
            <span>Notification Center</span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time terminal alerts, AI computer vision updates and report readiness.
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#12A89D] hover:underline"
        >
          <CheckCheck size={14} />
          <span>Mark all read</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => {
              markAsRead(notif.id);
              if (notif.targetInspectionId && onSelectInspection) {
                onSelectInspection(notif.targetInspectionId);
              } else if (notif.targetReportId && onSelectReport) {
                onSelectReport(notif.targetReportId);
              }
            }}
            className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
              notif.read
                ? 'bg-white border-[#E5EAF0]'
                : 'bg-teal-50/30 border-[#12A89D]/40 ring-1 ring-[#12A89D]/20 shadow-2xs'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {getIcon(notif.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-bold truncate ${notif.read ? 'text-[#142B45]' : 'text-slate-900'}`}>
                  {notif.title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono-nums shrink-0">
                  {notif.timestamp}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {notif.message}
              </p>
            </div>

            <ChevronRight size={15} className="text-slate-300 shrink-0 self-center" />
          </div>
        ))}
      </div>
    </div>
  );
};
