import React, { useState } from 'react';
import { InspectionReport } from '../types';
import { INITIAL_REPORTS } from '../services/mockData';
import { useInspectionStore } from '../store/useInspectionStore';
import { PdfReportModal } from '../components/PdfReportModal';
import { 
  FileText, 
  Download, 
  Eye, 
  CheckCircle2, 
  ShieldCheck, 
  Search, 
  Calendar,
  Share2,
  HardDrive
} from 'lucide-react';

export const ReportsScreen: React.FC = () => {
  const { inspections } = useInspectionStore();
  const [reports] = useState<InspectionReport[]>(INITIAL_REPORTS);
  const [selectedReport, setSelectedReport] = useState<InspectionReport | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Combine approved inspections with ready reports
  const approvedSurveys = inspections.filter((i) => i.status === 'APPROVED');

  const filteredReports = reports.filter((r) =>
    r.containerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[#142B45] flex items-center gap-2">
            <FileText size={22} className="text-[#12A89D]" />
            <span>Inspection Certificate Library</span>
          </h2>
          <p className="text-xs text-slate-500">
            Official ISO 1496-1 signed surveyor certificates and PDF exports.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter reports by container number or certificate reference..."
          className="w-full text-xs p-3 pl-9 rounded-xl border border-[#E5EAF0] bg-white focus:outline-hidden focus:border-[#142B45] font-mono-nums shadow-2xs"
        />
        <Search size={16} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="p-4 rounded-2xl bg-white border border-[#E5EAF0] hover:border-slate-300 hover:shadow-xs transition space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#12A89D] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div className="font-mono-nums font-bold text-base text-[#142B45]">
                    {report.containerNumber}
                  </div>
                  <div className="text-xs text-slate-500 font-mono-nums mt-0.5 flex items-center gap-2">
                    <span className="font-semibold text-slate-700">{report.reference}</span>
                    <span>·</span>
                    <span>{report.version}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#198754]">
                  <CheckCircle2 size={13} />
                  <span>{report.verdict}</span>
                </span>
                <div className="text-[11px] text-slate-400 font-mono-nums mt-0.5">
                  {report.inspectionDate}
                </div>
              </div>
            </div>

            {/* Metadata Footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="text-slate-500 text-[11px] flex items-center gap-3">
                <span>Inspector: <strong className="text-slate-700">{report.inspectorName}</strong></span>
                <span>·</span>
                <span className="font-mono-nums">{(report.fileSizeBytes / 1024 / 1024).toFixed(1)} MB</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedReport(report)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition flex items-center gap-1.5"
                >
                  <Eye size={13} />
                  <span>Preview PDF</span>
                </button>

                <button
                  onClick={() => setSelectedReport(report)}
                  className="px-3 py-1.5 rounded-lg bg-[#142B45] hover:bg-[#203F5F] text-white font-semibold transition flex items-center gap-1.5"
                >
                  <Download size={13} />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PDF Viewer Modal */}
      <PdfReportModal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        report={selectedReport}
      />
    </div>
  );
};
