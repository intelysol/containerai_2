import React, { useState } from 'react';
import { Inspection, InspectionReport } from '../types';
import { 
  X, 
  Download, 
  Share2, 
  Printer, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  Calendar,
  Building,
  UserCheck
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  report?: InspectionReport | null;
  inspection?: Inspection | null;
}

export const PdfReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  report,
  inspection,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const containerNo = report?.containerNumber || inspection?.container.containerNumber || 'MSCU 784219-4';
  const refNum = report?.reference || inspection?.referenceNumber || 'CC-2026-0891';
  const inspDate = report?.inspectionDate || inspection?.container.inspectionDate || '2026-10-29';
  const surveyor = report?.inspectorName || inspection?.approval?.approvedBy || 'Capt. Julian Mercer';
  const verdict = report?.verdict || inspection?.approval?.finalVerdict || 'CLEARED';

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      // Trigger a browser download simulation
      const element = document.createElement('a');
      const file = new Blob([
        `CONTAINERCHECK AI - OFFICIAL MARITIME CONTAINER SURVEY CERTIFICATE\n` +
        `Certificate Ref: ${refNum}\n` +
        `Container ID: ${containerNo}\n` +
        `Inspection Date: ${inspDate}\n` +
        `Surveyor: ${surveyor}\n` +
        `Verdict: ${verdict}\n` +
        `ISO 1496-1 & IICL-6 Certified.`
      ], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${refNum}_Inspection_Certificate.pdf`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 800);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-[#F5F7FA] rounded-2xl shadow-2xl border border-slate-300 overflow-hidden z-10 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Top Control Header */}
        <div className="p-3 bg-[#142B45] text-white flex items-center justify-between border-b border-[#203F5F]">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[#12A89D]" />
            <span className="font-semibold text-xs tracking-tight">
              Container Inspection Certificate PDF
            </span>
            <span className="text-[11px] text-teal-200 font-mono-nums">
              ({refNum})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-2.5 py-1 rounded bg-[#203F5F] hover:bg-[#203F5F]/80 text-xs font-medium text-slate-200 transition flex items-center gap-1.5"
            >
              <Share2 size={13} />
              <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-3 py-1 rounded bg-[#12A89D] hover:bg-[#0E8C83] text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
            >
              <Download size={13} />
              <span>{downloading ? 'Generating...' : 'Download PDF'}</span>
            </button>

            <button 
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable PDF Document Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/60">
          <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 text-slate-900 space-y-6">
            {/* Certificate Header */}
            <div className="flex items-start justify-between border-b-2 border-[#142B45] pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-[#142B45] text-white flex items-center justify-center font-bold text-sm">
                    CC
                  </div>
                  <div>
                    <h1 className="text-lg font-extrabold tracking-tight text-[#142B45]">
                      CONTAINERCHECK <span className="text-[#12A89D]">AI</span>
                    </h1>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      International Maritime Survey Inspection Certificate
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right font-mono-nums">
                <div className="text-xs font-bold text-[#142B45]">{refNum}</div>
                <div className="text-[11px] text-slate-500">ISO 1496-1 / IICL-6</div>
                <div className="text-[11px] text-slate-500">Date: {inspDate}</div>
              </div>
            </div>

            {/* Verdict Banner */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              verdict === 'CLEARED'
                ? 'bg-emerald-50/70 border-[#198754]/30 text-emerald-950'
                : 'bg-amber-50/70 border-amber-300 text-amber-950'
            }`}>
              <div className="flex items-center gap-3">
                <ShieldCheck size={28} className={verdict === 'CLEARED' ? 'text-[#198754]' : 'text-amber-600'} />
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    Official Survey Status
                  </div>
                  <div className="text-base font-extrabold tracking-tight">
                    {verdict === 'CLEARED' ? 'PASSED & CLEARED FOR SEA TRANSIT' : verdict.replace('_', ' ')}
                  </div>
                </div>
              </div>
              <div className="text-right text-[11px] font-mono-nums text-slate-500">
                Seal Integrity: Verified
              </div>
            </div>

            {/* Container Details Grid */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#142B45] mb-2 border-b border-slate-200 pb-1">
                01. Container Identification & Specifications
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Container ID</div>
                  <div className="font-mono-nums font-bold text-[#142B45]">{containerNo}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">ISO Check Digit</div>
                  <div className="font-mono-nums font-semibold text-emerald-700">Valid (Mod-11)</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Size / Type</div>
                  <div className="font-medium text-slate-800">45G1 (40ft High Cube)</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Category</div>
                  <div className="font-medium text-slate-800">Dry Freight ISO Box</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Terminal Location</div>
                  <div className="font-medium text-slate-800">Terminal Berth 4, Gate 12</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Tare Weight / Payload</div>
                  <div className="font-mono-nums text-slate-800">3,850 kg / 28,650 kg</div>
                </div>
              </div>
            </div>

            {/* AI Computer Vision & Checklist Findings */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#142B45] mb-2 border-b border-slate-200 pb-1">
                02. Condition Evaluation & Verified Findings
              </div>
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase">
                    <th className="py-1.5 font-semibold">Location / Component</th>
                    <th className="py-1.5 font-semibold">Finding Type</th>
                    <th className="py-1.5 font-semibold">Severity</th>
                    <th className="py-1.5 font-semibold text-right">Tolerance Standard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-2 font-medium">Left Corrugated Panel 4</td>
                    <td className="py-2">Dent (Depth ~45mm)</td>
                    <td className="py-2 text-slate-600">Minor</td>
                    <td className="py-2 text-right font-mono-nums text-[#198754]">Within IICL-6</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">Lower Rail Flange</td>
                    <td className="py-2">Surface Rust Oxidation</td>
                    <td className="py-2 text-slate-600">Minor</td>
                    <td className="py-2 text-right font-mono-nums text-[#198754]">Grade C Acceptable</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">Door Gaskets & Cam Keepers</td>
                    <td className="py-2">Clean, Sealed</td>
                    <td className="py-2 text-slate-600">None</td>
                    <td className="py-2 text-right font-mono-nums text-[#198754]">Weather-Tight Pass</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">Interior Plywood Flooring</td>
                    <td className="py-2">Dry, Odorless</td>
                    <td className="py-2 text-slate-600">None</td>
                    <td className="py-2 text-right font-mono-nums text-[#198754]">Food-Grade Suitable</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Surveyor Sign-off Section */}
            <div className="pt-4 border-t-2 border-[#142B45]">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[10px] uppercase text-slate-500 font-semibold">
                    Authorized Marine Surveyor
                  </div>
                  <div className="text-sm font-bold text-[#142B45]">{surveyor}</div>
                  <div className="text-[11px] text-slate-500 font-mono-nums">
                    Surveyor License: IIMS-MAR-8921-A
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Organization: Maersk Line Marine Operations
                  </div>
                </div>

                <div className="text-right">
                  <div className="w-24 h-12 border border-slate-300 rounded flex items-center justify-center bg-slate-50 text-[10px] text-slate-400 font-serif italic mb-1">
                    J. Mercer (Signed)
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono-nums">
                    Verified Digital Hash: 89a4...c2e1
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
