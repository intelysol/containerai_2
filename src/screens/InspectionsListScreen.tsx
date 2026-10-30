import React, { useState, useMemo } from 'react';
import { useInspectionStore } from '../store/useInspectionStore';
import { InspectionStatusBadge } from '../components/InspectionStatusBadge';
import { 
  Search, 
  Filter, 
  Box, 
  PackageCheck, 
  Calendar, 
  ChevronRight, 
  FileCheck,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { InspectionType, InspectionStatus } from '../types';

interface Props {
  onSelectInspection: (id: string) => void;
  onStartNewInspection: () => void;
}

export const InspectionsListScreen: React.FC<Props> = ({
  onSelectInspection,
  onStartNewInspection,
}) => {
  const { inspections } = useInspectionStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const filtered = useMemo(() => {
    return inspections.filter((insp) => {
      const matchSearch = 
        insp.container.containerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insp.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        insp.container.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchType = selectedType === 'ALL' || insp.type === selectedType;
      const matchStatus = selectedStatus === 'ALL' || insp.status === selectedStatus;

      return matchSearch && matchType && matchStatus;
    });
  }, [inspections, searchTerm, selectedType, selectedStatus]);

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header & Search */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-[#142B45]">
            Inspection Ledger
          </h2>
          <p className="text-xs text-slate-500">
            {filtered.length} of {inspections.length} total container surveys
          </p>
        </div>

        <button
          onClick={onStartNewInspection}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#12A89D] text-white text-xs font-bold rounded-xl hover:bg-[#0E8C83] transition shadow-xs"
        >
          <Plus size={15} />
          <span>New Survey</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by container ID (e.g. MSCU), reference, or terminal..."
          className="w-full text-xs p-3 pl-9 rounded-xl border border-[#E5EAF0] bg-white focus:outline-hidden focus:border-[#142B45] shadow-2xs font-mono-nums"
        />
        <Search size={16} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Tabs / Segmented Controls */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
          Type:
        </span>
        {['ALL', 'EMPTY', 'LOADED'].map((t) => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              selectedType === t
                ? 'bg-[#142B45] text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t === 'ALL' ? 'All Types' : `${t} Containers`}
          </button>
        ))}

        <div className="w-px h-4 bg-slate-300 mx-1 hidden sm:block" />

        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 ml-1">
          Status:
        </span>
        {[
          { key: 'ALL', label: 'All Status' },
          { key: 'APPROVED', label: 'Approved' },
          { key: 'PENDING_REVIEW', label: 'Needs Review' },
          { key: 'PENDING_SYNC', label: 'Queued' },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setSelectedStatus(s.key)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              selectedStatus === s.key
                ? 'bg-[#12A89D] text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Inspections Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#E5EAF0] text-slate-500">
            <Box size={36} className="mx-auto text-slate-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No inspections match filter</h4>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search criteria or start a new survey.
            </p>
          </div>
        ) : (
          filtered.map((inspection) => (
            <div
              key={inspection.id}
              onClick={() => onSelectInspection(inspection.id)}
              className="p-4 rounded-2xl bg-white border border-[#E5EAF0] hover:border-slate-300 hover:shadow-sm transition cursor-pointer flex items-center gap-4 group"
            >
              {/* Thumbnail with overlay status badge */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative">
                <img
                  src={inspection.photos[0]?.uri || '/src/assets/images/container_front_doors_1793341301902.jpg'}
                  alt={inspection.container.containerNumber}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Information */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-mono-nums font-bold text-base text-[#142B45] truncate">
                    {inspection.container.containerNumber}
                  </div>
                  <InspectionStatusBadge status={inspection.status} size="sm" />
                </div>

                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="font-mono-nums font-medium text-slate-700">
                    {inspection.referenceNumber}
                  </span>
                  <span>·</span>
                  <span>{inspection.type}</span>
                  <span>·</span>
                  <span>{inspection.container.sizeType}</span>
                </div>

                <div className="text-[11px] text-slate-400 mt-1.5 flex items-center justify-between">
                  <span className="truncate max-w-[200px]">
                    {inspection.container.location}
                  </span>
                  <span className="font-mono-nums shrink-0">
                    {inspection.container.inspectionDate}
                  </span>
                </div>

                {/* Findings Preview Pills */}
                {inspection.aiFindings.length > 0 && (
                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center gap-2 text-[11px]">
                    <span className="text-slate-500 font-medium">
                      {inspection.aiFindings.length} AI finding{inspection.aiFindings.length === 1 ? '' : 's'}:
                    </span>
                    <span className="text-amber-700 font-semibold capitalize">
                      {inspection.aiFindings[0].type} ({inspection.aiFindings[0].severity})
                    </span>
                    {inspection.aiFindings.length > 1 && (
                      <span className="text-slate-400">+{inspection.aiFindings.length - 1} more</span>
                    )}
                  </div>
                )}
              </div>

              <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-600 transition shrink-0" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
