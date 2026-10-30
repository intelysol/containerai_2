import React, { useState } from 'react';
import { Inspection, HumanApproval } from '../types';
import { useAuthStore } from '../store/useAuthStore';
import { 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  AlertCircle, 
  FileCheck,
  Award
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  inspection: Inspection;
  onConfirmApproval: (approval: HumanApproval) => void;
}

export const HumanApprovalModal: React.FC<Props> = ({
  isOpen,
  onClose,
  inspection,
  onConfirmApproval,
}) => {
  const { user } = useAuthStore();
  const [verdict, setVerdict] = useState<HumanApproval['finalVerdict']>('CLEARED');
  const [notes, setNotes] = useState(
    'I have reviewed the container photographs, verified ISO markings, and evaluated AI damage findings against IICL-6 standard tolerances. Approved for sea transit.'
  );
  const [confirmedDeclaration, setConfirmedDeclaration] = useState(false);

  if (!isOpen) return null;

  const handleApprove = () => {
    if (!confirmedDeclaration) return;

    const approval: HumanApproval = {
      approvedBy: user?.name || 'Capt. Julian Mercer',
      inspectorRole: user?.role || 'Senior Marine Cargo Surveyor',
      approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      finalVerdict: verdict,
      notes,
      surveyorLicense: user?.licenseNumber || 'IIMS-MAR-8921-A',
      digitalSignatureRef: `SIG-DIG-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    onConfirmApproval(approval);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-[#142B45] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#12A89D]/30 border border-[#12A89D] flex items-center justify-center">
              <ShieldCheck size={20} className="text-[#12A89D]" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white">
                Human Review & Surveyor Sign-Off
              </h3>
              <p className="text-[11px] text-teal-200 font-mono-nums">
                {inspection.container.containerNumber} · {inspection.referenceNumber}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Summary Box */}
          <div className="bg-[#F5F7FA] p-3 rounded-xl border border-[#E5EAF0] space-y-1.5">
            <div className="font-semibold text-slate-700 uppercase tracking-wider text-[10px]">
              Survey Assessment Summary
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-200/60">
              <span className="text-slate-500">Container Type:</span>
              <span className="font-medium text-slate-800">{inspection.container.sizeType}</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-200/60">
              <span className="text-slate-500">Survey Mode:</span>
              <span className="font-medium text-slate-800">{inspection.type} Container</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-200/60">
              <span className="text-slate-500">Photographs Captured:</span>
              <span className="font-mono-nums text-slate-800">{inspection.photos.length} angles verified</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-slate-500">AI Findings Audited:</span>
              <span className="font-mono-nums font-semibold text-slate-800">
                {inspection.aiFindings.length} detected ({inspection.aiFindings.filter(f => f.status === 'accepted').length} confirmed)
              </span>
            </div>
          </div>

          {/* Verdict Selection */}
          <div>
            <label className="font-semibold text-slate-800 block mb-2 uppercase tracking-wider text-[10px]">
              Surveyor Verdict Determination
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVerdict('CLEARED')}
                className={`p-2.5 rounded-lg border text-left transition ${
                  verdict === 'CLEARED'
                    ? 'border-[#198754] bg-emerald-50/50 text-[#198754] font-semibold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} />
                  <span>Cleared for Transit</span>
                </div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                  Full IICL-6 compliance
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVerdict('CONDITIONAL_APPROVAL')}
                className={`p-2.5 rounded-lg border text-left transition ${
                  verdict === 'CONDITIONAL_APPROVAL'
                    ? 'border-[#E6A23C] bg-amber-50/50 text-amber-800 font-semibold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <AlertCircle size={15} className="text-[#E6A23C]" />
                  <span>Conditional Transit</span>
                </div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                  Minor wear / 1-way reposition
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVerdict('REPAIR_REQUIRED')}
                className={`p-2.5 rounded-lg border text-left transition ${
                  verdict === 'REPAIR_REQUIRED'
                    ? 'border-[#D9534F] bg-rose-50/50 text-[#D9534F] font-semibold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <AlertCircle size={15} />
                  <span>Repair Required</span>
                </div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                  Send to depot maintenance
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVerdict('REJECTED')}
                className={`p-2.5 rounded-lg border text-left transition ${
                  verdict === 'REJECTED'
                    ? 'border-[#D9534F] bg-rose-50/50 text-[#D9534F] font-semibold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <X size={15} />
                  <span>Rejected / Detain</span>
                </div>
                <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                  Severe structural violation
                </div>
              </button>
            </div>
          </div>

          {/* Surveyor Certificate Notes */}
          <div>
            <label className="font-semibold text-slate-800 block mb-1 uppercase tracking-wider text-[10px]">
              Surveyor Official Endorsement Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-hidden focus:border-[#142B45] leading-relaxed"
            />
          </div>

          {/* Inspector Credentials */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-[#12A89D]" />
              <div>
                <div className="font-semibold text-slate-800">{user?.name}</div>
                <div className="text-[11px] text-slate-500 font-mono-nums">
                  License: {user?.licenseNumber}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono-nums text-slate-400">
              Cert No. CC-MAR-2026
            </span>
          </div>

          {/* Required Explicit Confirmation Checkbox */}
          <label className="flex items-start gap-2.5 p-3 rounded-lg bg-teal-50/60 border border-teal-200 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmedDeclaration}
              onChange={(e) => setConfirmedDeclaration(e.target.checked)}
              className="mt-0.5 rounded border-teal-400 text-[#12A89D] focus:ring-[#12A89D]"
            />
            <span className="text-xs text-slate-700 leading-snug">
              I certify under professional maritime surveyor regulations that this container inspection was conducted in compliance with ISO standards, and that all AI findings were personally reviewed and endorsed.
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            disabled={!confirmedDeclaration}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#142B45] text-white rounded-lg text-xs font-semibold hover:bg-[#203F5F] transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileCheck size={15} />
            <span>Approve & Sign Certificate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
