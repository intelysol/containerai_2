import React from 'react';
import { InspectionStatus } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  CloudOff, 
  AlertTriangle, 
  XCircle, 
  Loader2, 
  FileCheck 
} from 'lucide-react';

interface Props {
  status: InspectionStatus;
  size?: 'sm' | 'md';
}

export const InspectionStatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const isSm = size === 'sm';
  const iconSize = isSm ? 13 : 15;

  switch (status) {
    case 'APPROVED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium text-[#198754] ${isSm ? 'text-xs' : 'text-xs tracking-wide'}`}>
          <CheckCircle2 size={iconSize} className="shrink-0" />
          <span>Approved</span>
        </span>
      );
    case 'PENDING_REVIEW':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium text-[#E6A23C] ${isSm ? 'text-xs' : 'text-xs tracking-wide'}`}>
          <AlertTriangle size={iconSize} className="shrink-0" />
          <span>Needs Review</span>
        </span>
      );
    case 'PROCESSING_AI':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium text-[#12A89D] ${isSm ? 'text-xs' : 'text-xs tracking-wide'}`}>
          <Loader2 size={iconSize} className="shrink-0 animate-spin" />
          <span>AI Analyzing</span>
        </span>
      );
    case 'PENDING_SYNC':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium text-amber-700 ${isSm ? 'text-xs' : 'text-xs tracking-wide'}`}>
          <CloudOff size={iconSize} className="shrink-0" />
          <span>Queued Offline</span>
        </span>
      );
    case 'UPLOADING':
    case 'RESERVING_CREDIT':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium text-[#203F5F] ${isSm ? 'text-xs' : 'text-xs tracking-wide'}`}>
          <Loader2 size={iconSize} className="shrink-0 animate-spin" />
          <span>Uploading</span>
        </span>
      );
    case 'REJECTED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium text-[#D9534F] ${isSm ? 'text-xs' : 'text-xs tracking-wide'}`}>
          <XCircle size={iconSize} className="shrink-0" />
          <span>Rejected</span>
        </span>
      );
    case 'DRAFT':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium text-slate-500 ${isSm ? 'text-xs' : 'text-xs tracking-wide'}`}>
          <Clock size={iconSize} className="shrink-0" />
          <span>Draft</span>
        </span>
      );
  }
};
