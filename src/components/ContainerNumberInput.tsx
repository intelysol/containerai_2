import React, { useState } from 'react';
import { validateIso6346 } from '../utils/iso6346';
import { CheckCircle2, AlertCircle, Scan, Sparkles } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onOpenScanner: () => void;
  disabled?: boolean;
}

export const ContainerNumberInput: React.FC<Props> = ({
  value,
  onChange,
  onOpenScanner,
  disabled = false,
}) => {
  const [touched, setTouched] = useState(false);
  const result = validateIso6346(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase();
    onChange(raw);
    if (!touched) setTouched(true);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-[#172B40] uppercase tracking-wider flex items-center gap-1.5">
          <span>ISO 6346 Container Number</span>
          <span className="text-[#D9534F]">*</span>
        </label>
        <button
          type="button"
          onClick={onOpenScanner}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#12A89D] bg-teal-50 hover:bg-teal-100 rounded-md transition"
        >
          <Scan size={13} />
          <span>Scan Number (OCR)</span>
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          disabled={disabled}
          placeholder="e.g. MSCU 784219 4"
          maxLength={13}
          className={`w-full font-mono-nums text-base tracking-wider uppercase px-3.5 py-2.5 rounded-lg border bg-white focus:outline-hidden transition ${
            touched && !result.isValid
              ? 'border-[#D9534F] focus:ring-2 focus:ring-[#D9534F]/20'
              : touched && result.isValid
              ? 'border-[#198754] focus:ring-2 focus:ring-[#198754]/20'
              : 'border-[#E5EAF0] focus:border-[#142B45] focus:ring-2 focus:ring-[#142B45]/15'
          }`}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {touched && result.isValid && (
            <CheckCircle2 size={18} className="text-[#198754]" />
          )}
          {touched && !result.isValid && value.length > 0 && (
            <AlertCircle size={18} className="text-[#D9534F]" />
          )}
        </div>
      </div>

      {/* Structured parsed preview */}
      <div className="bg-[#F5F7FA] p-2.5 rounded-lg border border-[#E5EAF0] text-xs">
        <div className="grid grid-cols-4 gap-2 text-center font-mono-nums">
          <div className="p-1.5 bg-white rounded border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase">Owner</div>
            <div className="font-bold text-[#142B45]">{result.ownerCode || '---'}</div>
          </div>
          <div className="p-1.5 bg-white rounded border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase">Cat</div>
            <div className="font-bold text-[#142B45]">{result.category || 'U'}</div>
          </div>
          <div className="p-1.5 bg-white rounded border border-slate-200">
            <div className="text-[10px] text-slate-400 uppercase">Serial</div>
            <div className="font-bold text-[#142B45]">{result.serialNumber || '------'}</div>
          </div>
          <div className={`p-1.5 rounded border ${
            result.isValid 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
              : 'bg-white border-slate-200 text-slate-700'
          }`}>
            <div className="text-[10px] text-slate-400 uppercase">Check</div>
            <div className="font-bold font-mono-nums">
              {result.calculatedCheckDigit >= 0 ? result.calculatedCheckDigit : '-'}
            </div>
          </div>
        </div>

        {/* Validation message */}
        {touched && result.errorMessage && (
          <div className="text-[11px] text-[#D9534F] mt-2 flex items-center gap-1.5">
            <AlertCircle size={13} className="shrink-0" />
            <span>{result.errorMessage}</span>
          </div>
        )}

        {touched && result.isValid && (
          <div className="text-[11px] text-[#198754] mt-2 flex items-center gap-1.5">
            <CheckCircle2 size={13} className="shrink-0" />
            <span>ISO 6346 Check Digit Verified (Modulus 11 Match)</span>
          </div>
        )}
      </div>
    </div>
  );
};
