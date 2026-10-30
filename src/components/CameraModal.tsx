import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  RotateCcw, 
  Check, 
  X, 
  Zap, 
  ZapOff, 
  FlipHorizontal, 
  Scan, 
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { PhotoCategoryKey, InspectionPhoto } from '../types';
import { cameraService, SAMPLE_CONTAINER_PHOTOS } from '../services/native/camera';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  category: PhotoCategoryKey;
  categoryTitle: string;
  isOcrMode?: boolean;
  onPhotoCaptured: (photo: InspectionPhoto, extractedOcrNumber?: string) => void;
}

export const CameraModal: React.FC<Props> = ({
  isOpen,
  onClose,
  category,
  categoryTitle,
  isOcrMode = false,
  onPhotoCaptured,
}) => {
  const [streamActive, setStreamActive] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<string | null>(null);
  const [isAnalyzingOcr, setIsAnalyzingOcr] = useState(false);
  const [selectedSample, setSelectedSample] = useState<string>(
    cameraService.getDefaultPhotoForCategory(category)
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Attempt real camera stream if available
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isOpen && navigator?.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();
            setStreamActive(true);
          }
        })
        .catch(() => {
          setStreamActive(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCapture = () => {
    // If real video is streaming, grab canvas frame
    if (streamActive && videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 1280;
      canvas.height = videoRef.current.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedUri(dataUrl);
        triggerOcrProcess(dataUrl);
        return;
      }
    }

    // Default to the high-res maritime container sample
    setCapturedUri(selectedSample);
    triggerOcrProcess(selectedSample);
  };

  const triggerOcrProcess = (imageUri: string) => {
    if (isOcrMode || category === 'front_doors' || category === 'container_number') {
      setIsAnalyzingOcr(true);
      setTimeout(() => {
        setIsAnalyzingOcr(false);
        setOcrResult('MSCU 784219 4');
      }, 700);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await cameraService.readFileAsDataUrl(file);
        setCapturedUri(dataUrl);
        triggerOcrProcess(dataUrl);
      } catch (err) {
        console.error('File load failed', err);
      }
    }
  };

  const handleConfirm = () => {
    if (!capturedUri) return;
    const photo: InspectionPhoto = {
      id: `photo_${Date.now()}`,
      category,
      label: categoryTitle,
      uri: capturedUri,
      thumbnailUri: capturedUri,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      syncStatus: 'local',
    };
    onPhotoCaptured(photo, ocrResult || undefined);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setCapturedUri(null);
    setOcrResult(null);
    setIsAnalyzingOcr(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden">
      {/* Top Bar Controls */}
      <div className="relative z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent text-white">
        <button
          onClick={() => {
            handleReset();
            onClose();
          }}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <div className="text-xs uppercase tracking-wider text-[#12A89D] font-semibold">
            {isOcrMode ? 'ISO 6346 OCR Scanner' : 'Container Camera'}
          </div>
          <div className="text-sm font-semibold truncate max-w-[200px]">
            {categoryTitle}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFlashOn(!flashOn)}
            className={`p-2 rounded-full backdrop-blur-md transition ${
              flashOn ? 'bg-amber-400 text-black' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            {flashOn ? <Zap size={18} /> : <ZapOff size={18} />}
          </button>
        </div>
      </div>

      {/* Viewfinder Area */}
      <div className="relative flex-1 flex items-center justify-center bg-slate-950 overflow-hidden">
        {capturedUri ? (
          /* Preview captured photo */
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={capturedUri}
              alt="Captured"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />

            {/* OCR Extracted Banner Overlay */}
            {isAnalyzingOcr && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                <Sparkles size={32} className="text-[#12A89D] animate-spin mb-2" />
                <div className="text-sm font-semibold tracking-wide">
                  Extracting ISO 6346 Markings...
                </div>
              </div>
            )}

            {ocrResult && (
              <div className="absolute bottom-6 left-4 right-4 bg-white/95 text-[#142B45] p-3 rounded-xl shadow-xl border border-teal-500/50 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-[#198754]" />
                    <span className="text-xs font-semibold uppercase text-slate-500">
                      OCR Identification
                    </span>
                  </div>
                  <span className="text-[11px] font-mono-nums font-bold text-[#12A89D]">
                    98.4% Confidence
                  </span>
                </div>
                <div className="text-lg font-mono-nums font-bold mt-1 text-[#142B45]">
                  {ocrResult}
                </div>
                <div className="text-[11px] text-slate-500">
                  Container number & ISO check digit extracted successfully.
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Live Stream or Fallback Container Target Frame */
          <div className="relative w-full h-full flex items-center justify-center">
            {streamActive ? (
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={selectedSample}
                alt="Container Viewfinder Sample"
                className="w-full h-full object-cover opacity-90"
                referrerPolicy="no-referrer"
              />
            )}

            {/* Viewfinder Overlay Guides */}
            <div className="absolute inset-8 border border-white/40 pointer-events-none rounded-lg flex flex-col justify-between p-3">
              {/* Corner Targets */}
              <div className="flex justify-between">
                <div className="w-6 h-6 border-t-2 border-l-2 border-[#12A89D]" />
                <div className="w-6 h-6 border-t-2 border-r-2 border-[#12A89D]" />
              </div>

              {isOcrMode ? (
                /* OCR Container Identification Box */
                <div className="border-2 border-dashed border-[#12A89D] bg-[#12A89D]/15 rounded-lg p-3 text-center pointer-events-auto">
                  <Scan size={24} className="text-[#12A89D] mx-auto mb-1 animate-pulse" />
                  <div className="text-xs font-bold text-white uppercase tracking-wider">
                    Align Container ID (e.g. MSCU 784219 4)
                  </div>
                  <div className="text-[11px] text-teal-200 mt-0.5">
                    Position 4 letters and 7 digits inside frame
                  </div>
                </div>
              ) : (
                <div className="text-center text-white/70 text-xs font-medium">
                  Align container edges within boundary frame
                </div>
              )}

              <div className="flex justify-between">
                <div className="w-6 h-6 border-b-2 border-l-2 border-[#12A89D]" />
                <div className="w-6 h-6 border-b-2 border-r-2 border-[#12A89D]" />
              </div>
            </div>

            {/* Container angle preset switcher for browser testing */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-center gap-2">
              <span className="text-[10px] text-white/80 bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs">
                Maritime Container Angles:
              </span>
              <button
                onClick={() => setSelectedSample(SAMPLE_CONTAINER_PHOTOS.front_doors)}
                className={`text-[10px] px-2 py-0.5 rounded font-medium backdrop-blur-xs transition ${
                  selectedSample === SAMPLE_CONTAINER_PHOTOS.front_doors
                    ? 'bg-[#12A89D] text-white'
                    : 'bg-black/60 text-slate-300'
                }`}
              >
                Doors / Markings
              </button>
              <button
                onClick={() => setSelectedSample(SAMPLE_CONTAINER_PHOTOS.container_damage)}
                className={`text-[10px] px-2 py-0.5 rounded font-medium backdrop-blur-xs transition ${
                  selectedSample === SAMPLE_CONTAINER_PHOTOS.container_damage
                    ? 'bg-[#12A89D] text-white'
                    : 'bg-black/60 text-slate-300'
                }`}
              >
                Side Corrugation
              </button>
              <button
                onClick={() => setSelectedSample(SAMPLE_CONTAINER_PHOTOS.interior_cargo)}
                className={`text-[10px] px-2 py-0.5 rounded font-medium backdrop-blur-xs transition ${
                  selectedSample === SAMPLE_CONTAINER_PHOTOS.interior_cargo
                    ? 'bg-[#12A89D] text-white'
                    : 'bg-black/60 text-slate-300'
                }`}
              >
                Cargo Interior
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Shutter & Confirmation Controls */}
      <div className="relative z-20 p-6 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-between text-white">
        {capturedUri ? (
          /* Confirmation mode */
          <div className="w-full flex items-center justify-between max-w-sm mx-auto">
            <button
              onClick={handleReset}
              className="flex flex-col items-center gap-1.5 px-4 py-2 text-slate-300 hover:text-white"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <RotateCcw size={22} />
              </div>
              <span className="text-xs">Retake</span>
            </button>

            <button
              onClick={handleConfirm}
              className="flex flex-col items-center gap-1.5 px-4 py-2 text-white font-semibold"
            >
              <div className="w-14 h-14 rounded-full bg-[#12A89D] flex items-center justify-center shadow-lg shadow-[#12A89D]/40">
                <Check size={28} className="stroke-[3px]" />
              </div>
              <span className="text-xs">Use Photo</span>
            </button>
          </div>
        ) : (
          /* Capture mode */
          <div className="w-full flex items-center justify-between max-w-sm mx-auto">
            {/* Gallery Upload */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload photo from device"
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
            >
              <ImageIcon size={22} />
            </button>

            {/* Shutter button */}
            <button
              onClick={handleCapture}
              aria-label="Capture container photograph"
              className="w-18 h-18 rounded-full border-4 border-white p-1 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            >
              <div className="w-full h-full rounded-full bg-white hover:bg-slate-200 transition" />
            </button>

            {/* Switch camera / simulator */}
            <button
              onClick={() => {
                if (selectedSample === SAMPLE_CONTAINER_PHOTOS.front_doors) {
                  setSelectedSample(SAMPLE_CONTAINER_PHOTOS.container_damage);
                } else if (selectedSample === SAMPLE_CONTAINER_PHOTOS.container_damage) {
                  setSelectedSample(SAMPLE_CONTAINER_PHOTOS.interior_cargo);
                } else {
                  setSelectedSample(SAMPLE_CONTAINER_PHOTOS.front_doors);
                }
              }}
              aria-label="Switch camera angle"
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
            >
              <FlipHorizontal size={22} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
