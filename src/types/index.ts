export type InspectionType = 'EMPTY' | 'LOADED';

export type InspectionStatus = 
  | 'DRAFT' 
  | 'PENDING_SYNC' 
  | 'RESERVING_CREDIT' 
  | 'UPLOADING' 
  | 'PROCESSING_AI' 
  | 'PENDING_REVIEW' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'FAILED';

export type DamageSeverity = 'none' | 'minor' | 'moderate' | 'severe';

export type PhotoCategoryKey = 
  | 'front_doors' 
  | 'rear' 
  | 'left_side' 
  | 'right_side' 
  | 'roof' 
  | 'interior' 
  | 'container_number' 
  | 'csc_plate' 
  | 'additional_damage';

export interface PhotoCategoryConfig {
  key: PhotoCategoryKey;
  label: string;
  description: string;
  required: boolean;
  minPhotos: number;
}

export interface InspectionPhoto {
  id: string;
  category: PhotoCategoryKey;
  label: string;
  uri: string;
  thumbnailUri?: string;
  timestamp: string;
  syncStatus: 'local' | 'uploading' | 'synced' | 'failed';
  notes?: string;
  width?: number;
  height?: number;
}

export interface ChecklistItem {
  id: string;
  title: string;
  category: string;
  response: 'good' | 'minor_damage' | 'major_damage' | 'not_applicable' | 'not_inspected';
  comments?: string;
  photoIds?: string[];
}

export interface AIDamageFinding {
  id: string;
  type: 
    | 'dent' 
    | 'hole' 
    | 'crack' 
    | 'bulge' 
    | 'rust' 
    | 'corrosion' 
    | 'door_damage' 
    | 'locking_mechanism' 
    | 'floor_damage' 
    | 'water_ingress'
    | 'seal_tamper';
  severity: 'minor' | 'moderate' | 'severe';
  confidence: number;
  photoKey: PhotoCategoryKey;
  location: string;
  description: string;
  boundingBox: {
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    width: number; // percentage 0-100
    height: number; // percentage 0-100
  };
  status: 'ai_detected' | 'accepted' | 'rejected' | 'edited';
  inspectorComment?: string;
}

export interface ContainerInfo {
  containerNumber: string; // e.g. MSCU7842194
  ownerCode: string; // 3 letters (e.g. MSC)
  categoryIdentifier: string; // 'U', 'J', 'Z'
  serialNumber: string; // 6 digits (e.g. 784219)
  checkDigit: number; // calculated 1 digit (e.g. 4)
  isCheckDigitValid: boolean;
  sizeType: string; // e.g. '40HC', '20GP', '45HC', '40RF'
  containerCategory: 'Dry Freight' | 'Reefer' | 'Open Top' | 'Flat Rack' | 'Tank';
  location: string; // Port / Depot code or GPS
  inspectionDate: string;
  inspectorName: string;
  sealNumber?: string;
  cargoDescription?: string;
}

export interface HumanApproval {
  approvedBy: string;
  inspectorRole: string;
  approvedAt: string;
  finalVerdict: 'CLEARED' | 'CONDITIONAL_APPROVAL' | 'REPAIR_REQUIRED' | 'REJECTED';
  notes: string;
  surveyorLicense: string;
  digitalSignatureRef?: string;
}

export interface Inspection {
  id: string;
  referenceNumber: string; // e.g. CC-2026-0891
  type: InspectionType;
  status: InspectionStatus;
  container: ContainerInfo;
  photos: InspectionPhoto[];
  checklist: ChecklistItem[];
  aiFindings: AIDamageFinding[];
  ocrConfidence: number;
  overallSeverity: DamageSeverity;
  approval?: HumanApproval;
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
  localDraft?: boolean;
  uploadProgress?: number;
  syncErrorMessage?: string;
  creditCost: number;
  organizationId: string;
}

export interface Organization {
  id: string;
  name: string;
  code: string;
  tier: 'Enterprise' | 'Terminal Operator' | 'Independent Depot';
  role: 'Surveyor' | 'Senior Inspector' | 'Operations Manager' | 'Admin';
  creditBalance: number;
  availableCredits: number;
  reservedCredits: number;
  totalInspections: number;
  logoUrl?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  avatarUrl: string;
  role: string;
  organizationId: string;
  twoFactorEnabled: boolean;
  trustedDevicesCount: number;
  offlineQueueLimit: number;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  priceUSD: number;
  unitPriceUSD: number;
  description: string;
  badge?: string;
  popular?: boolean;
}

export interface CreditTransaction {
  id: string;
  date: string;
  amount: number;
  type: 'PURCHASE' | 'INSPECTION_CONSUMPTION' | 'RESERVATION' | 'REFUND' | 'PROMO';
  reference: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  description: string;
}

export interface InspectionReport {
  id: string;
  reference: string;
  containerNumber: string;
  inspectionId: string;
  inspectionDate: string;
  generatedDate: string;
  version: string;
  verdict: 'CLEARED' | 'CONDITIONAL_APPROVAL' | 'REPAIR_REQUIRED' | 'REJECTED';
  inspectorName: string;
  findingsCount: number;
  fileSizeBytes: number;
  pdfUrl: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  targetInspectionId?: string;
  targetReportId?: string;
}
