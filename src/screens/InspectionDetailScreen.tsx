import React, { useState } from 'react';
import { Inspection, AIDamageFinding, HumanApproval } from '../types';
import { useInspectionStore } from '../store/useInspectionStore';
import { InspectionStatusBadge } from '../components/InspectionStatusBadge';
import { DamageFindingCard } from '../components/DamageFindingCard';
import { HumanApprovalModal } from '../components/HumanApprovalModal';
import { PdfReportModal } from '../components/PdfReportModal';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Camera, 
  ClipboardCheck, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Plus, 
  Eye, 
  UserCheck,
  ZoomIn
} from 'lucide-react';

interface Props {
  inspectionId: string;
  onBack: () => void;
}

export const InspectionDetailScreen: React.FC<Props> = ({ inspectionId, onBack }) => {
  const { 
    inspections, 
    updateAIFinding, 
    addAIFinding, 
    approveInspection 
  } = useInspectionStore();

  const inspection = inspections.find((i) => i.id === inspectionId);
  const [activeTab, setActiveTab] = useState<'overview' | 'photos' | 'checklist' | 'findings' | 'reports'>('findings');
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showAddFindingModal, setShowAddFindingModal] = useState(false);

  // New Finding form state
  const [newType, setNewType] = useState<AIDamageFinding['type']>('dent');
  const [newSeverity, setNewSeverity] = useState<'minor' | 'moderate' | 'severe'>('minor');
  const [newLocation, setNewLocation] = useState('Front door bottom flange');
  const [newDesc, setNewDesc] = useState('Manual inspector finding: impact dent with coating scratch');

  if (!inspection) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>Inspection record not found.</p>
        <button onClick={onBack} className="mt-3 text-xs text-[#12A89D] font-bold">
          Return to ledger
        </button>
      </div>
    );
  }

  const handleCreateFinding = () => {
    addAIFinding(inspection.id, {
      type: newType,
      severity: newSeverity,
      confidence: 1.0,
      photoKey: 'front_doors',
      location: newLocation,
      description: newDesc,
      boundingBox: { x: 40, y: 50, width: 20, height: 20 },
      status: 'accepted',
      inspectorComment: 'Manually logged by certified surveyor during visual walkaround.',
    });
    setShowAddFindingModal(false);
  };

  const handleConfirmApproval = (approval: HumanApproval) => {
    approveInspection(inspection.id, approval);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Navigation & Status Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft size={16} />
          <span>All Inspections</span>
        </button>

        <div className="flex items-center gap-2">
          {inspection.status === 'APPROVED' ? (
            <button
              onClick={() => setShowPdfModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#142B45] text-white text-xs font-semibold rounded-lg hover:bg-[#203F5F] transition"
            >
              <FileText size={14} />
              <span>View Certificate PDF</span>
            </button>
          ) : (
            <button
              onClick={() => setShowApprovalModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#198754] text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition shadow-xs"
            >
              <ShieldCheck size={14} />
              <span>Sign Off & Approve</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Container Header Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E5EAF0] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {inspection.type} CONTAINER INSPECTION
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#142B45] font-mono-nums tracking-wide mt-0.5">
              {inspection.container.containerNumber}
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span className="font-mono-nums font-semibold">{inspection.referenceNumber}</span>
              <span>·</span>
              <span>{inspection.container.sizeType}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {inspection.container.location}
              </span>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1">
            <InspectionStatusBadge status={inspection.status} size="md" />
            <div className="text-[11px] font-mono-nums text-slate-400">
              Surveyed: {inspection.container.inspectionDate}
            </div>
          </div>
        </div>

        {/* 5 Tabs Navigation */}
        <div className="flex items-center gap-1 pt-3 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('findings')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'findings'
                ? 'bg-[#142B45] text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles size={14} className="text-[#12A89D]" />
            <span>AI Findings ({inspection.aiFindings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-[#142B45] text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'photos'
                ? 'bg-[#142B45] text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Camera size={14} />
            <span>Photographs ({inspection.photos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'checklist'
                ? 'bg-[#142B45] text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ClipboardCheck size={14} />
            <span>Checklist</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'reports'
                ? 'bg-[#142B45] text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText size={14} />
            <span>Certificate & Reports</span>
          </button>
        </div>
      </div>

      {/* TAB 1: AI FINDINGS & COMPUTER VISION ANNOTATIONS */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          {/* Annotated Photo Viewport with SVG Bounding Boxes */}
          <div className="p-4 bg-white rounded-2xl border border-[#E5EAF0] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#142B45] flex items-center gap-1.5">
                  <Sparkles size={16} className="text-[#12A89D]" />
                  <span>Computer Vision Damage Annotations</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Model trained on ISO 1496-1 maritime defect classifications with millimeter tolerances.
                </p>
              </div>

              <button
                onClick={() => setShowAddFindingModal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#12A89D] bg-teal-50 hover:bg-teal-100 rounded-lg transition"
              >
                <Plus size={13} />
                <span>Add Finding</span>
              </button>
            </div>

            {/* Interactive Image Frame with Overlay Boxes */}
            <div className="relative w-full aspect-16/10 rounded-xl overflow-hidden bg-slate-950 border border-slate-300">
              <img
                src={inspection.photos[1]?.uri || inspection.photos[0]?.uri || '/src/assets/images/container_damage_dent_1793341301946.jpg'}
                alt="Container Inspection Damage"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />

              {/* Render AI Bounding Boxes */}
              {inspection.aiFindings.map((finding) => {
                const isSelected = selectedFindingId === finding.id;
                const box = finding.boundingBox;
                const isDent = finding.type === 'dent';

                return (
                  <div
                    key={finding.id}
                    onClick={() => setSelectedFindingId(finding.id)}
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.width}%`,
                      height: `${box.height}%`,
                    }}
                    className={`absolute border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#12A89D] bg-[#12A89D]/25 ring-2 ring-white z-20'
                        : finding.status === 'accepted'
                        ? 'border-[#198754] bg-[#198754]/20'
                        : finding.status === 'rejected'
                        ? 'border-[#D9534F] bg-[#D9534F]/20 opacity-40 line-through'
                        : 'border-[#E6A23C] bg-[#E6A23C]/20 hover:border-white'
                    }`}
                  >
                    {/* Floating Label */}
                    <div className="absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight bg-slate-900/90 text-white whitespace-nowrap shadow-xs flex items-center gap-1">
                      <span className="capitalize">{finding.type}</span>
                      <span className="text-teal-300 font-mono-nums">
                        {Math.round(finding.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                );
              })}

              <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur-xs text-[10px] text-white flex items-center gap-2">
                <ZoomIn size={12} />
                <span>Tap any bounding box to focus finding</span>
              </div>
            </div>
          </div>

          {/* Finding Cards List */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Detected Defects & Surveyor Verification ({inspection.aiFindings.length})
            </div>

            {inspection.aiFindings.length === 0 ? (
              <div className="p-6 bg-white rounded-xl border border-[#E5EAF0] text-center text-xs text-slate-500">
                Zero structural defects detected by AI vision model. All panels within IICL tolerances.
              </div>
            ) : (
              inspection.aiFindings.map((finding) => (
                <DamageFindingCard
                  key={finding.id}
                  finding={finding}
                  isSelected={selectedFindingId === finding.id}
                  onSelect={() => setSelectedFindingId(finding.id)}
                  onAccept={() =>
                    updateAIFinding(inspection.id, finding.id, { status: 'accepted' })
                  }
                  onReject={() =>
                    updateAIFinding(inspection.id, finding.id, { status: 'rejected' })
                  }
                  onUpdate={(updates) =>
                    updateAIFinding(inspection.id, finding.id, updates)
                  }
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-[#E5EAF0] shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-[#142B45] pb-2 border-b border-slate-100">
              Container Specifications & Identity
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Owner Prefix</div>
                <div className="font-bold text-slate-800 font-mono-nums">{inspection.container.ownerCode} (MSC Mediterranean)</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Equipment Cat</div>
                <div className="font-bold text-slate-800 font-mono-nums">U — Freight Container</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Serial Number</div>
                <div className="font-bold text-slate-800 font-mono-nums">{inspection.container.serialNumber}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Check Digit</div>
                <div className="font-bold text-[#198754] font-mono-nums">{inspection.container.checkDigit} (Verified)</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Size & Type</div>
                <div className="font-bold text-slate-800">{inspection.container.sizeType}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">OCR Confidence</div>
                <div className="font-bold text-[#12A89D] font-mono-nums">{Math.round(inspection.ocrConfidence * 100)}%</div>
              </div>
            </div>

            {inspection.approval && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-900 mb-1">
                  <ShieldCheck size={18} className="text-[#198754]" />
                  <span>Official Surveyor Endorsement ({inspection.approval.finalVerdict})</span>
                </div>
                <p className="text-emerald-800 leading-relaxed">
                  {inspection.approval.notes}
                </p>
                <div className="mt-2 text-[11px] text-emerald-700 flex items-center justify-between font-mono-nums border-t border-emerald-200/60 pt-2">
                  <span>Signer: {inspection.approval.approvedBy} ({inspection.approval.surveyorLicense})</span>
                  <span>{inspection.approval.approvedAt}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PHOTOGRAPHS */}
      {activeTab === 'photos' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-[#E5EAF0] shadow-xs">
            <h3 className="font-bold text-sm text-[#142B45] mb-1">
              Captured Photographic Record ({inspection.photos.length} angles)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Original full-resolution captures saved with local sha256 checksums.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {inspection.photos.map((photo) => (
                <div key={photo.id} className="rounded-xl overflow-hidden border border-slate-200 bg-white">
                  <div className="aspect-4/3 bg-slate-900 relative">
                    <img
                      src={photo.uri}
                      alt={photo.label}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-2.5">
                    <div className="font-semibold text-xs text-[#142B45] truncate">{photo.label}</div>
                    <div className="text-[10px] text-slate-400 font-mono-nums mt-0.5">{photo.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-[#E5EAF0] shadow-xs">
            <h3 className="font-bold text-sm text-[#142B45] mb-3">
              Standard Physical Checklist Responses
            </h3>
            <div className="space-y-2">
              {inspection.checklist.map((item) => (
                <div key={item.id} className="p-3 rounded-lg border border-slate-100 bg-[#F5F7FA] text-xs flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800">{item.title}</div>
                    {item.comments && (
                      <div className="text-[11px] text-slate-500 mt-0.5">{item.comments}</div>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                    item.response === 'good'
                      ? 'bg-emerald-100 text-[#198754]'
                      : item.response === 'minor_damage'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-[#D9534F]'
                  }`}>
                    {item.response.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: REPORTS & CERTIFICATE */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="p-5 bg-white rounded-2xl border border-[#E5EAF0] shadow-xs text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#12A89D] flex items-center justify-center mx-auto">
              <FileText size={24} />
            </div>
            <h3 className="font-bold text-base text-[#142B45]">
              Maritime Container Inspection Certificate
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Authoritative survey report generated with ISO 6346 container validation, AI damage classification, and verified surveyor signature.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setShowPdfModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#142B45] text-white text-xs font-bold rounded-xl hover:bg-[#203F5F] transition shadow-xs"
              >
                <Eye size={15} />
                <span>Open Full Certificate PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Human Approval */}
      <HumanApprovalModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        inspection={inspection}
        onConfirmApproval={handleConfirmApproval}
      />

      {/* Modal: PDF Certificate */}
      <PdfReportModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        inspection={inspection}
      />

      {/* Modal: Add Manual Finding */}
      {showAddFindingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setShowAddFindingModal(false)} 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" 
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 z-10 space-y-3 text-xs">
            <h4 className="font-bold text-sm text-[#142B45]">Add Manual Surveyor Finding</h4>
            
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Defect Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full p-2 border rounded-lg bg-white"
              >
                <option value="dent">Dent</option>
                <option value="hole">Hole / Puncture</option>
                <option value="crack">Crack / Fracture</option>
                <option value="rust">Rust / Oxidation</option>
                <option value="corrosion">Corrosion</option>
                <option value="door_damage">Door / Hinge Damage</option>
                <option value="locking_mechanism">Locking Bar Wear</option>
                <option value="floor_damage">Plywood Floor Gouge</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Severity</label>
              <div className="grid grid-cols-3 gap-2">
                {(['minor', 'moderate', 'severe'] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setNewSeverity(sev)}
                    className={`py-1 rounded border capitalize ${
                      newSeverity === sev ? 'bg-[#142B45] text-white' : 'bg-white text-slate-700'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Component Location</label>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Finding Description</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                rows={2}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddFindingModal(false)}
                className="px-3 py-1.5 text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateFinding}
                className="px-4 py-1.5 bg-[#12A89D] text-white rounded-lg font-bold"
              >
                Log Finding
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
