import React, { useState } from 'react';
import { useInspectionStore } from '../store/useInspectionStore';
import { useCreditStore } from '../store/useCreditStore';
import { useSyncStore } from '../store/useSyncStore';
import { ContainerNumberInput } from '../components/ContainerNumberInput';
import { CameraModal } from '../components/CameraModal';
import { 
  InspectionType, 
  PhotoCategoryKey, 
  PhotoCategoryConfig, 
  InspectionPhoto 
} from '../types';
import { 
  Box, 
  PackageCheck, 
  Camera, 
  Check, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  CloudOff, 
  Send,
  Calendar,
  MapPin,
  FileCheck,
  Coins,
  ShieldCheck,
  Plus
} from 'lucide-react';

const REQUIRED_CATEGORIES: PhotoCategoryConfig[] = [
  { key: 'front_doors', label: '01. Front / Doors', description: 'End doors, locking bars, hinges and handles', required: true, minPhotos: 1 },
  { key: 'rear', label: '02. Rear End Wall', description: 'End corrugated wall and top/bottom headers', required: true, minPhotos: 1 },
  { key: 'left_side', label: '03. Left Side Wall', description: 'Entire side panel corrugation and bottom side rail', required: true, minPhotos: 1 },
  { key: 'right_side', label: '04. Right Side Wall', description: 'Entire right side panel and top side rail', required: true, minPhotos: 1 },
  { key: 'roof', label: '05. Roof Panel', description: 'Roof corrugation, bows and corner castings', required: true, minPhotos: 1 },
  { key: 'interior', label: '06. Interior / Floor', description: 'Floorboards, interior side walls and cleanliness', required: true, minPhotos: 1 },
  { key: 'container_number', label: '07. Container Marking', description: 'ISO code markings and owner identification', required: true, minPhotos: 1 },
  { key: 'csc_plate', label: '08. CSC Safety Plate', description: 'CSC safety approval plate and payload limits', required: true, minPhotos: 1 },
  { key: 'additional_damage', label: 'Additional Damage Shot', description: 'Close-up of specific defects, rust or dents', required: false, minPhotos: 0 },
];

interface Props {
  onCancel: () => void;
  onFinished: (inspectionId: string) => void;
  onNavigateToWallet: () => void;
}

export const NewInspectionWizard: React.FC<Props> = ({
  onCancel,
  onFinished,
  onNavigateToWallet,
}) => {
  const { 
    wizard, 
    setWizardStep, 
    setWizardType, 
    updateContainerInfo, 
    applyOcrContainerNumber, 
    addPhoto, 
    removePhoto, 
    updateChecklistItem, 
    submitWizardInspection 
  } = useInspectionStore();

  const { availableCredits, reserveCredit, consumeReservedCredit } = useCreditStore();
  const { isOnline, addToQueue } = useSyncStore();

  // Active camera state
  const [cameraOpen, setCameraOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<PhotoCategoryKey>('front_doors');
  const [activeCategoryTitle, setActiveCategoryTitle] = useState('Front / Doors');
  const [isOcrScanMode, setIsOcrScanMode] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const step = wizard.step;

  // Validation checks for steps
  const isStep2Valid = wizard.container.containerNumber.length >= 10 && wizard.container.isCheckDigitValid;
  const capturedCategoryKeys = new Set(wizard.photos.map((p) => p.category));
  const requiredCategoriesMet = REQUIRED_CATEGORIES.filter((c) => c.required).every((c) =>
    capturedCategoryKeys.has(c.key)
  );

  const openCameraForCategory = (cat: PhotoCategoryConfig, isOcr = false) => {
    setActiveCategory(cat.key);
    setActiveCategoryTitle(cat.label);
    setIsOcrScanMode(isOcr);
    setCameraOpen(true);
  };

  const handlePhotoCaptured = (photo: InspectionPhoto, ocrNumber?: string) => {
    addPhoto(photo);
    if (ocrNumber) {
      applyOcrContainerNumber(ocrNumber);
    }
  };

  const handleFinalSubmit = () => {
    if (availableCredits < wizard.creditCost) {
      setSubmitError('Insufficient credits. You need 1 inspection credit to submit.');
      return;
    }

    // Reserve credit
    const reserved = reserveCredit(wizard.creditCost, wizard.container.containerNumber);
    if (!reserved) {
      setSubmitError('Could not reserve inspection credit.');
      return;
    }

    const createdInspection = submitWizardInspection(isOnline);

    if (!isOnline) {
      // Save locally to offline sync queue
      addToQueue({
        id: createdInspection.id,
        containerNumber: createdInspection.container.containerNumber,
        referenceNumber: createdInspection.referenceNumber,
        photoCount: createdInspection.photos.length,
      });
    } else {
      consumeReservedCredit(wizard.creditCost, createdInspection.referenceNumber);
    }

    onFinished(createdInspection.id);
  };

  return (
    <div className="pb-24 max-w-2xl mx-auto space-y-4">
      {/* Wizard Progress Stepper */}
      <div className="p-3.5 rounded-2xl bg-white border border-[#E5EAF0] shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
          <span>Step {step} of 5</span>
          <span className="font-bold text-[#142B45]">
            {step === 1 && 'Select Inspection Type'}
            {step === 2 && 'Container Information'}
            {step === 3 && 'Guided Photography'}
            {step === 4 && 'Inspection Checklist'}
            {step === 5 && 'Review & Submission'}
          </span>
        </div>

        {/* 5-Step Bar */}
        <div className="grid grid-cols-5 gap-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-colors ${
                s < step
                  ? 'bg-[#198754]'
                  : s === step
                  ? 'bg-[#12A89D]'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* STEP 1: SELECT INSPECTION TYPE */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="text-center py-2">
            <h2 className="text-lg font-bold text-[#142B45]">Select Inspection Protocol</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose the inspection standard appropriate for this container status.
            </p>
          </div>

          <div className="space-y-3">
            {/* EMPTY CONTAINER CARD */}
            <div
              onClick={() => setWizardType('EMPTY')}
              className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 ${
                wizard.type === 'EMPTY'
                  ? 'border-[#12A89D] bg-teal-50/40 ring-2 ring-[#12A89D]/20 shadow-xs'
                  : 'border-[#E5EAF0] bg-white hover:border-slate-300'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                wizard.type === 'EMPTY' ? 'bg-[#12A89D] text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                <Box size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-[#142B45]">
                    EMPTY CONTAINER INSPECTION
                  </div>
                  {wizard.type === 'EMPTY' && (
                    <span className="text-xs font-bold text-[#12A89D] flex items-center gap-1">
                      <CheckCircle2 size={15} /> Selected
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Inspect an empty shipping container for structural condition, cleanliness, corrosion, floorboard integrity, weather tightness and damage.
                </p>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
                  <span>11 Checklist Criteria</span>
                  <span>·</span>
                  <span>IICL-6 Standard</span>
                  <span>·</span>
                  <span>Light Ingress Test</span>
                </div>
              </div>
            </div>

            {/* LOADED CONTAINER CARD */}
            <div
              onClick={() => setWizardType('LOADED')}
              className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 ${
                wizard.type === 'LOADED'
                  ? 'border-[#203F5F] bg-blue-50/40 ring-2 ring-[#203F5F]/20 shadow-xs'
                  : 'border-[#E5EAF0] bg-white hover:border-slate-300'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                wizard.type === 'LOADED' ? 'bg-[#203F5F] text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                <PackageCheck size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-[#142B45]">
                    LOADED CONTAINER INSPECTION
                  </div>
                  {wizard.type === 'LOADED' && (
                    <span className="text-xs font-bold text-[#203F5F] flex items-center gap-1">
                      <CheckCircle2 size={15} /> Selected
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Inspect container exterior, high-security bolt seals, visible cargo condition, lashing straps and loading balance.
                </p>
                <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
                  <span>8 Checklist Criteria</span>
                  <span>·</span>
                  <span>ISO 17712 Bolt Seal</span>
                  <span>·</span>
                  <span>Lashing Security</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              Cancel Survey
            </button>
            <button
              type="button"
              onClick={() => setWizardStep(2)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#142B45] text-white text-xs font-bold rounded-xl hover:bg-[#203F5F] transition shadow-xs"
            >
              <span>Continue to Container Info</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CONTAINER INFORMATION */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-[#E5EAF0] shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-[#142B45] pb-2 border-b border-slate-100">
              Container Identification & Markings
            </h3>

            {/* Container Number Input with OCR trigger & Check Digit */}
            <ContainerNumberInput
              value={wizard.container.containerNumber}
              onChange={(num) => updateContainerInfo({ containerNumber: num })}
              onOpenScanner={() => openCameraForCategory(REQUIRED_CATEGORIES[0], true)}
            />

            {/* Size / Type & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Container Size / Type
                </label>
                <select
                  value={wizard.container.sizeType}
                  onChange={(e) => updateContainerInfo({ sizeType: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-[#142B45]"
                >
                  <option value="45G1 (40ft High Cube)">45G1 — 40ft High Cube (9ft 6in)</option>
                  <option value="42G1 (40ft Standard)">42G1 — 40ft Standard (8ft 6in)</option>
                  <option value="22G1 (20ft Standard)">22G1 — 20ft Standard Box</option>
                  <option value="45R1 (40ft High Cube Reefer)">45R1 — 40ft Reefer High Cube</option>
                  <option value="22U1 (20ft Open Top)">22U1 — 20ft Open Top</option>
                  <option value="42P1 (40ft Flat Rack)">42P1 — 40ft Flat Rack</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Container Category
                </label>
                <select
                  value={wizard.container.containerCategory}
                  onChange={(e) => updateContainerInfo({ containerCategory: e.target.value as any })}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-[#142B45]"
                >
                  <option value="Dry Freight">Dry Freight (General Cargo)</option>
                  <option value="Reefer">Reefer (Temperature Controlled)</option>
                  <option value="Open Top">Open Top Container</option>
                  <option value="Flat Rack">Flat Rack / Heavy Cargo</option>
                  <option value="Tank">Tank Container (Liquid/Gas)</option>
                </select>
              </div>
            </div>

            {/* Location & Inspection Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Terminal / Depot Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={wizard.container.location}
                    onChange={(e) => updateContainerInfo({ location: e.target.value })}
                    placeholder="e.g. Berth 4, Gate Bay 12"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-[#142B45] pl-8"
                  />
                  <MapPin size={14} className="text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Inspection Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={wizard.container.inspectionDate}
                    onChange={(e) => updateContainerInfo({ inspectionDate: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-[#142B45] pl-8"
                  />
                  <Calendar size={14} className="text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* If Loaded Container: Seal Number & Cargo Description */}
            {wizard.type === 'LOADED' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    High-Security Seal Number (ISO 17712)
                  </label>
                  <input
                    type="text"
                    value={wizard.container.sealNumber || ''}
                    onChange={(e) => updateContainerInfo({ sealNumber: e.target.value })}
                    placeholder="e.g. MSK-77192-H"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-[#142B45]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Cargo Description / Bill of Lading
                  </label>
                  <input
                    type="text"
                    value={wizard.container.cargoDescription || ''}
                    onChange={(e) => updateContainerInfo({ cargoDescription: e.target.value })}
                    placeholder="e.g. Industrial machinery parts"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-[#142B45]"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setWizardStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setWizardStep(3)}
              disabled={!isStep2Valid}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#142B45] text-white text-xs font-bold rounded-xl hover:bg-[#203F5F] transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Continue to Photography ({wizard.photos.length} captured)</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: GUIDED PHOTOGRAPHY */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="p-3.5 bg-white rounded-2xl border border-[#E5EAF0] shadow-xs flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#142B45]">
                Guided Inspection Angles
              </h3>
              <p className="text-xs text-slate-500">
                {wizard.photos.length} of {REQUIRED_CATEGORIES.filter((c) => c.required).length} required categories captured
              </p>
            </div>
            {/* Quick Demo Pre-Fill: allows instant 1-tap test capture of all 8 standard angles */}
            {wizard.photos.length < 8 && (
              <button
                type="button"
                onClick={() => {
                  REQUIRED_CATEGORIES.slice(0, 8).forEach((cat) => {
                    const existing = wizard.photos.find((p) => p.category === cat.key);
                    if (!existing) {
                      addPhoto({
                        id: `photo_${Date.now()}_${cat.key}`,
                        category: cat.key,
                        label: cat.label,
                        uri: cat.key === 'interior' 
                          ? '/src/assets/images/container_interior_cargo_1793341302281.jpg' 
                          : cat.key === 'left_side' || cat.key === 'right_side' 
                          ? '/src/assets/images/container_damage_dent_1793341301946.jpg' 
                          : '/src/assets/images/container_front_doors_1793341301902.jpg',
                        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                        syncStatus: 'local',
                      });
                    }
                  });
                }}
                className="px-2.5 py-1 text-[11px] font-semibold text-[#12A89D] bg-teal-50 hover:bg-teal-100 rounded-lg transition"
              >
                Auto-Capture Angles
              </button>
            )}
          </div>

          {/* Categories Grid */}
          <div className="space-y-2.5">
            {REQUIRED_CATEGORIES.map((cat) => {
              const categoryPhotos = wizard.photos.filter((p) => p.category === cat.key);
              const isCaptured = categoryPhotos.length > 0;

              return (
                <div
                  key={cat.key}
                  className={`p-3.5 rounded-xl border bg-white transition ${
                    isCaptured ? 'border-emerald-300 bg-emerald-50/20' : 'border-[#E5EAF0]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#142B45] truncate">
                          {cat.label}
                        </span>
                        {cat.required ? (
                          <span className="text-[10px] text-amber-700 font-semibold">
                            Required
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Optional</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {cat.description}
                      </div>
                    </div>

                    {/* Camera Trigger */}
                    <button
                      type="button"
                      onClick={() => openCameraForCategory(cat)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                        isCaptured
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-[#142B45] text-white hover:bg-[#203F5F]'
                      }`}
                    >
                      <Camera size={14} />
                      <span>{isCaptured ? 'Retake' : 'Capture'}</span>
                    </button>
                  </div>

                  {/* Thumbnail Row if captured */}
                  {categoryPhotos.length > 0 && (
                    <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-100">
                      {categoryPhotos.map((photo) => (
                        <div key={photo.id} className="relative group w-14 h-14 rounded-lg overflow-hidden border border-slate-200">
                          <img
                            src={photo.uri}
                            alt={photo.label}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(photo.id)}
                            aria-label="Remove photo"
                            className="absolute top-0.5 right-0.5 p-1 bg-black/60 text-white rounded hover:bg-rose-600 transition"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))}
                      <div className="text-[11px] text-[#198754] font-medium flex items-center gap-1">
                        <Check size={13} />
                        <span>Verified angle saved locally</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setWizardStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setWizardStep(4)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#142B45] text-white text-xs font-bold rounded-xl hover:bg-[#203F5F] transition shadow-xs"
            >
              <span>Continue to Checklist</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: INSPECTION CHECKLIST */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="p-3.5 bg-white rounded-2xl border border-[#E5EAF0] shadow-xs">
            <h3 className="font-bold text-sm text-[#142B45]">
              {wizard.type === 'EMPTY' ? 'Empty Container Physical Checklist' : 'Loaded Container Integrity Checklist'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Grade each inspection criteria per international ISO/IICL-6 damage standards.
            </p>
          </div>

          <div className="space-y-2.5">
            {wizard.checklist.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-[#E5EAF0] bg-white space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-[#142B45]">{item.title}</div>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold">{item.category}</span>
                </div>

                {/* Response Options */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {(['good', 'minor_damage', 'major_damage', 'not_applicable', 'not_inspected'] as const).map(
                    (resp) => {
                      const isSelected = item.response === resp;
                      return (
                        <button
                          key={resp}
                          type="button"
                          onClick={() => updateChecklistItem(item.id, { response: resp })}
                          className={`py-1.5 px-2 text-[11px] rounded-lg border font-medium capitalize transition text-center truncate ${
                            isSelected
                              ? resp === 'good'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : resp === 'minor_damage'
                                ? 'bg-amber-500 text-white border-amber-500'
                                : resp === 'major_damage'
                                ? 'bg-rose-600 text-white border-rose-600'
                                : 'bg-slate-700 text-white border-slate-700'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {resp.replace('_', ' ')}
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Optional Comments */}
                <div>
                  <input
                    type="text"
                    value={item.comments || ''}
                    onChange={(e) => updateChecklistItem(item.id, { comments: e.target.value })}
                    placeholder="Observations, dent depth in mm, or tolerance notes..."
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-[#142B45]"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setWizardStep(3)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setWizardStep(5)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#142B45] text-white text-xs font-bold rounded-xl hover:bg-[#203F5F] transition shadow-xs"
            >
              <span>Review & Submit</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: REVIEW AND SUBMIT */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-[#E5EAF0] shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-[#142B45] pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Final Inspection Audit</span>
              <span className="font-mono-nums text-xs text-[#12A89D]">
                Cost: {wizard.creditCost} Credit
              </span>
            </h3>

            {/* Container Details */}
            <div className="bg-[#F5F7FA] p-3 rounded-xl border border-[#E5EAF0] space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Container ID:</span>
                <span className="font-mono-nums font-bold text-[#142B45]">
                  {wizard.container.containerNumber} (Check Digit: {wizard.container.checkDigit})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Protocol:</span>
                <span className="font-semibold text-slate-800">{wizard.type} CONTAINER</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Size / Type:</span>
                <span className="font-medium text-slate-800">{wizard.container.sizeType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-medium text-slate-800">{wizard.container.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Photos Attached:</span>
                <span className="font-mono-nums font-semibold text-slate-800">
                  {wizard.photos.length} Photographs
                </span>
              </div>
            </div>

            {/* Credit Availability Notice */}
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Coins size={16} className="text-[#12A89D]" />
                <span className="text-teal-900">
                  Available in Wallet: <strong>{availableCredits} credits</strong>
                </span>
              </div>
              {availableCredits < wizard.creditCost && (
                <button
                  type="button"
                  onClick={onNavigateToWallet}
                  className="text-xs font-bold text-[#D9534F] hover:underline"
                >
                  Buy Credits
                </button>
              )}
            </div>

            {/* Online / Offline Sync Notice */}
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              isOnline
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}>
              {isOnline ? (
                <CheckCircle2 size={18} className="text-[#198754] shrink-0 mt-0.5" />
              ) : (
                <CloudOff size={18} className="text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <strong className="block font-semibold">
                  {isOnline ? 'Online Cloud Mode' : 'Offline Field Mode'}
                </strong>
                <p className="text-[11px] mt-0.5 leading-snug">
                  {isOnline
                    ? 'Inspection will be transmitted to the cloud API immediately and processed by AI computer vision.'
                    : 'Network is disconnected. Inspection and high-res photos will be securely persisted on-device in the synchronization queue.'}
                </p>
              </div>
            </div>

            {submitError && (
              <div className="p-3 rounded-lg bg-rose-50 text-[#D9534F] border border-rose-200 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
          </div>

          {/* Submission Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setWizardStep(4)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleFinalSubmit}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white shadow-md transition active:scale-95 ${
                isOnline
                  ? 'bg-[#12A89D] hover:bg-[#0E8C83]'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              {isOnline ? (
                <>
                  <Send size={15} />
                  <span>Submit for AI Analysis</span>
                </>
              ) : (
                <>
                  <CloudOff size={15} />
                  <span>Save for Synchronization</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Camera Modal */}
      <CameraModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        category={activeCategory}
        categoryTitle={activeCategoryTitle}
        isOcrMode={isOcrScanMode}
        onPhotoCaptured={handlePhotoCaptured}
      />
    </div>
  );
};
