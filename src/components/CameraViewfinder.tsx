'use client';

import { Camera, Upload, X, Lightbulb } from 'lucide-react';
import { useRef } from 'react';

interface CameraViewfinderProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
}

export function CameraViewfinder({ isOpen, onClose, onFileSelect }: CameraViewfinderProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-5 border border-line">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-ink-muted hover:text-ink rounded-lg"
          aria-label="Close scanner viewfinder"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent-soft px-2 py-0.5 rounded">
            Mobile Letter Scanner
          </span>
          <h3 className="font-heading font-bold text-lg text-ink">
            Frame Your Official Letter
          </h3>
          <p className="text-xs text-ink-muted">
            Align the 4 corners of the paper inside the guides for best OCR parsing.
          </p>
        </div>

        {/* Viewfinder Graphic Overlay */}
        <div className="relative aspect-3/4 max-h-64 bg-slate-900 rounded-xl overflow-hidden flex flex-col items-center justify-center border-2 border-slate-700 text-center p-4">
          {/* Corner Alignment Brackets */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-amber-400" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-amber-400" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-amber-400" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-amber-400" />

          <div className="space-y-2 text-slate-300">
            <Camera className="w-10 h-10 mx-auto text-amber-400/80 animate-pulse" />
            <p className="text-xs font-semibold text-slate-200">
              [ Align page borders within yellow corners ]
            </p>
            <p className="text-[11px] text-slate-400">
              Ensure text, dates, and account numbers are in sharp focus.
            </p>
          </div>
        </div>

        {/* Lighting tip */}
        <div className="flex items-center gap-2 bg-paper-elevated border border-line rounded-lg p-2.5 text-xs text-ink-muted">
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Tip: Flatten folded creases and avoid harsh shadows over the dates.</span>
        </div>

        {/* Action Trigger Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="btn-primary py-2.5 text-xs font-bold"
          >
            <Camera className="w-4 h-4 mr-1.5" />
            Open Camera
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary py-2.5 text-xs font-bold"
          >
            <Upload className="w-4 h-4 mr-1.5" />
            Upload File
          </button>
        </div>

        {/* Hidden inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFileSelect(f);
          }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFileSelect(f);
          }}
        />
      </div>
    </div>
  );
}
