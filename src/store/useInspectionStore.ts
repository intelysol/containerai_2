import { create } from 'zustand';
import { 
  Inspection, 
  InspectionType, 
  ContainerInfo, 
  InspectionPhoto, 
  ChecklistItem, 
  AIDamageFinding, 
  PhotoCategoryKey,
  HumanApproval
} from '../types';
import { 
  INITIAL_INSPECTIONS, 
  STANDARD_EMPTY_CHECKLIST, 
  STANDARD_LOADED_CHECKLIST 
} from '../services/mockData';
import { validateIso6346 } from '../utils/iso6346';

interface WizardState {
  step: 1 | 2 | 3 | 4 | 5;
  type: InspectionType;
  container: ContainerInfo;
  photos: InspectionPhoto[];
  checklist: ChecklistItem[];
  creditCost: number;
}

const defaultContainer: ContainerInfo = {
  containerNumber: 'MSCU7842194',
  ownerCode: 'MSC',
  categoryIdentifier: 'U',
  serialNumber: '784219',
  checkDigit: 4,
  isCheckDigitValid: true,
  sizeType: '45G1 (40ft High Cube)',
  containerCategory: 'Dry Freight',
  location: 'Gate In 3, Berth 7',
  inspectionDate: new Date().toISOString().split('T')[0],
  inspectorName: 'Capt. Julian Mercer',
  sealNumber: '',
  cargoDescription: '',
};

interface InspectionStore {
  inspections: Inspection[];
  wizard: WizardState;
  activeInspectionId: string | null;

  // Wizard actions
  setWizardStep: (step: 1 | 2 | 3 | 4 | 5) => void;
  setWizardType: (type: InspectionType) => void;
  updateContainerInfo: (updates: Partial<ContainerInfo>) => void;
  applyOcrContainerNumber: (fullNumber: string) => void;
  addPhoto: (photo: InspectionPhoto) => void;
  removePhoto: (photoId: string) => void;
  updateChecklistItem: (itemId: string, updates: Partial<ChecklistItem>) => void;
  resetWizard: () => void;
  submitWizardInspection: (isOnline: boolean) => Inspection;

  // Detail & Approval actions
  setActiveInspection: (id: string | null) => void;
  updateAIFinding: (inspectionId: string, findingId: string, updates: Partial<AIDamageFinding>) => void;
  addAIFinding: (inspectionId: string, finding: Omit<AIDamageFinding, 'id'>) => void;
  approveInspection: (inspectionId: string, approval: HumanApproval) => void;
}

export const useInspectionStore = create<InspectionStore>((set, get) => ({
  inspections: INITIAL_INSPECTIONS,
  activeInspectionId: 'insp_01',
  wizard: {
    step: 1,
    type: 'EMPTY',
    container: { ...defaultContainer },
    photos: [],
    checklist: [...STANDARD_EMPTY_CHECKLIST],
    creditCost: 1,
  },

  setWizardStep: (step) => {
    set((state) => ({ wizard: { ...state.wizard, step } }));
  },

  setWizardType: (type) => {
    const defaultList = type === 'EMPTY' ? STANDARD_EMPTY_CHECKLIST : STANDARD_LOADED_CHECKLIST;
    set((state) => ({
      wizard: {
        ...state.wizard,
        type,
        checklist: JSON.parse(JSON.stringify(defaultList)),
      },
    }));
  },

  updateContainerInfo: (updates) => {
    set((state) => {
      const merged = { ...state.wizard.container, ...updates };
      // If containerNumber changed, run validation
      if (updates.containerNumber !== undefined) {
        const parsed = validateIso6346(updates.containerNumber);
        merged.ownerCode = parsed.ownerCode;
        merged.categoryIdentifier = parsed.category;
        merged.serialNumber = parsed.serialNumber;
        merged.checkDigit = parsed.calculatedCheckDigit;
        merged.isCheckDigitValid = parsed.isValid;
      }
      return {
        wizard: {
          ...state.wizard,
          container: merged,
        },
      };
    });
  },

  applyOcrContainerNumber: (fullNumber: string) => {
    const parsed = validateIso6346(fullNumber);
    set((state) => ({
      wizard: {
        ...state.wizard,
        container: {
          ...state.wizard.container,
          containerNumber: fullNumber.toUpperCase().replace(/\s/g, ''),
          ownerCode: parsed.ownerCode,
          categoryIdentifier: parsed.category,
          serialNumber: parsed.serialNumber,
          checkDigit: parsed.calculatedCheckDigit,
          isCheckDigitValid: parsed.isValid,
        },
      },
    }));
  },

  addPhoto: (photo) => {
    set((state) => ({
      wizard: {
        ...state.wizard,
        photos: [...state.wizard.photos, photo],
      },
    }));
  },

  removePhoto: (photoId) => {
    set((state) => ({
      wizard: {
        ...state.wizard,
        photos: state.wizard.photos.filter((p) => p.id !== photoId),
      },
    }));
  },

  updateChecklistItem: (itemId, updates) => {
    set((state) => ({
      wizard: {
        ...state.wizard,
        checklist: state.wizard.checklist.map((item) =>
          item.id === itemId ? { ...item, ...updates } : item
        ),
      },
    }));
  },

  resetWizard: () => {
    set({
      wizard: {
        step: 1,
        type: 'EMPTY',
        container: { ...defaultContainer },
        photos: [],
        checklist: [...STANDARD_EMPTY_CHECKLIST],
        creditCost: 1,
      },
    });
  },

  submitWizardInspection: (isOnline: boolean) => {
    const { wizard, inspections } = get();
    const newId = `insp_${Date.now()}`;
    const refNum = `CC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInspection: Inspection = {
      id: newId,
      referenceNumber: refNum,
      type: wizard.type,
      status: isOnline ? 'PROCESSING_AI' : 'PENDING_SYNC',
      container: { ...wizard.container },
      photos: [...wizard.photos],
      checklist: [...wizard.checklist],
      aiFindings: isOnline ? [
        {
          id: `find_${Date.now()}`,
          type: 'dent',
          severity: 'minor',
          confidence: 0.95,
          photoKey: 'front_doors',
          location: 'Right door panel, lower rib',
          description: 'Localized impact dent ~28mm, finish intact.',
          boundingBox: { x: 30, y: 40, width: 25, height: 20 },
          status: 'ai_detected',
        }
      ] : [],
      ocrConfidence: 0.97,
      overallSeverity: 'minor',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      localDraft: !isOnline,
      creditCost: 1,
      organizationId: 'org_maersk_ops',
    };

    set({
      inspections: [newInspection, ...inspections],
      activeInspectionId: newId,
    });

    get().resetWizard();
    return newInspection;
  },

  setActiveInspection: (id) => {
    set({ activeInspectionId: id });
  },

  updateAIFinding: (inspectionId, findingId, updates) => {
    set((state) => ({
      inspections: state.inspections.map((insp) => {
        if (insp.id !== inspectionId) return insp;
        return {
          ...insp,
          aiFindings: insp.aiFindings.map((f) =>
            f.id === findingId ? { ...f, ...updates } : f
          ),
        };
      }),
    }));
  },

  addAIFinding: (inspectionId, finding) => {
    set((state) => ({
      inspections: state.inspections.map((insp) => {
        if (insp.id !== inspectionId) return insp;
        const newFinding: AIDamageFinding = {
          ...finding,
          id: `find_custom_${Date.now()}`,
        };
        return {
          ...insp,
          aiFindings: [...insp.aiFindings, newFinding],
        };
      }),
    }));
  },

  approveInspection: (inspectionId, approval) => {
    set((state) => ({
      inspections: state.inspections.map((insp) => {
        if (insp.id !== inspectionId) return insp;
        return {
          ...insp,
          status: 'APPROVED',
          approval,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },
}));
