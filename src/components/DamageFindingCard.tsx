import React, { useState } from 'react';
import { AIDamageFinding } from '../types';
import { 
  Check, 
  X, 
  Edit3, 
  AlertTriangle, 
  Sparkles, 
  MessageSquare,
  ShieldAlert,
  Save
} from 'lucide-react';

interface Props {
  finding: AIDamageFinding;
  onAccept: () => void;
  onReject: () => void;
  onUpdate: (updates: Partial<AIDamageFinding>) => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const DamageFindingCard: React.FC<Props> = ({
  finding,
  onAccept,
  onReject,
  onUpdate,
  isSelected = false,
  onSelect,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editDesc, setEditDesc] = useState(finding.description);
  const [editSeverity, setEditSeverity] = useState(finding.severity);
  const [comment, setComment] = useState(finding.inspectorComment || '');
  const [showCommentBox, setShowCommentBox] = useState(!!finding.inspectorComment);

  const handleSaveEdit = () => {
    onUpdate({
      description: editDesc,
      severity: editSeverity,
      inspectorComment: comment,
      status: 'edited',
    });
    setIsEditing(false);
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'severe':
        return <span className="text-xs font-semibold text-[#D9534F]">Severe</span>;
      case 'moderate':
        return <span className="text-xs font-semibold text-[#E6A23C]">Moderate</span>;
      default:
        return <span className="text-xs font-medium text-slate-500">Minor</span>;
    }
  };

  const getStatusIndicator = () => {
    switch (finding.status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#198754]">
            <Check size={13} />
            <span>Surveyor Confirmed</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#D9534F]">
            <X size={13} />
            <span>Rejected by Surveyor</span>
          </span>
        );
      case 'edited':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600">
            <Edit3 size={13} />
            <span>Modified</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#12A89D]">
            <Sparkles size={13} />
            <span>AI Detected</span>
          </span>
        );
    }
  };

  return (
    <div 
      onClick={onSelect}
      className={`p-3.5 rounded-xl border bg-white transition cursor-pointer ${
        isSelected 
          ? 'border-[#12A89D] ring-2 ring-[#12A89D]/20 shadow-xs' 
          : 'border-[#E5EAF0] hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#142B45] capitalize">
              {finding.type.replace('_', ' ')}
            </span>
            <span className="text-slate-300">·</span>
            {getSeverityBadge(finding.severity)}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {finding.location}
          </div>
        </div>

        <div className="text-right">
          {getStatusIndicator()}
          <div className="text-[11px] font-mono-nums text-slate-400 mt-0.5">
            {Math.round(finding.confidence * 100)}% Confidence
          </div>
        </div>
      </div>

      {isEditing ? (
        <div className="mt-3 space-y-2 pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Severity</label>
            <div className="grid grid-cols-3 gap-2">
              {(['minor', 'moderate', 'severe'] as const).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => setEditSeverity(sev)}
                  className={`py-1 text-xs rounded border capitalize transition ${
                    editSeverity === sev
                      ? 'bg-[#142B45] text-white border-[#142B45] font-semibold'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Description</label>
            <textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              rows={2}
              className="w-full text-xs p-2 rounded border border-slate-200 focus:outline-hidden focus:border-[#12A89D]"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Surveyor Note / Tolerance</label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Cleared per IICL-6 standard"
              className="w-full text-xs p-2 rounded border border-slate-200 focus:outline-hidden focus:border-[#12A89D]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              className="inline-flex items-center gap-1 px-3 py-1 bg-[#12A89D] text-white rounded text-xs font-semibold hover:bg-[#0E8C83]"
            >
              <Save size={13} />
              <span>Save Finding</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-2 text-xs text-slate-700 leading-relaxed">
          <p>{finding.description}</p>
          {finding.inspectorComment && (
            <div className="mt-2 p-2 rounded bg-slate-50 border border-slate-200 text-slate-600 text-[11px] flex items-start gap-1.5">
              <MessageSquare size={13} className="text-[#12A89D] shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Inspector Note:</strong> {finding.inspectorComment}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {!isEditing && (
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs"
        >
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1 px-2 py-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 transition"
            >
              <Edit3 size={13} />
              <span>Edit</span>
            </button>

            {!showCommentBox && !finding.inspectorComment && (
              <button
                onClick={() => {
                  setShowCommentBox(true);
                  setIsEditing(true);
                }}
                className="inline-flex items-center gap-1 px-2 py-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 transition"
              >
                <MessageSquare size={13} />
                <span>Note</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onReject}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded transition ${
                finding.status === 'rejected'
                  ? 'bg-rose-100 text-[#D9534F] font-semibold'
                  : 'text-slate-600 hover:bg-rose-50 hover:text-[#D9534F]'
              }`}
            >
              <X size={13} />
              <span>Reject</span>
            </button>

            <button
              onClick={onAccept}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded transition ${
                finding.status === 'accepted'
                  ? 'bg-emerald-100 text-[#198754] font-semibold'
                  : 'bg-[#142B45] text-white hover:bg-[#203F5F]'
              }`}
            >
              <Check size={13} />
              <span>Confirm</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
