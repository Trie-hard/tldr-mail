'use client';

import { Upload, Camera, Shield, Sparkles, Scale } from 'lucide-react';
import { SAMPLE_LETTERS, SampleLetter } from '@/lib/sample-letters';

interface HeroUploadZoneProps {
  onOpenFileSelect: (file: File) => void;
  onOpenCamera: () => void;
  onSelectSample: (sample: SampleLetter) => void;
}

export function HeroUploadZone({
  onOpenFileSelect,
  onOpenCamera,
  onSelectSample,
}: HeroUploadZoneProps) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) onOpenFileSelect(file);
  };

  return (
    <div className="space-y-10 max-w-2xl mx-auto pt-6 sm:pt-10">
      {/* 1. Header Typography */}
      <div className="space-y-3 text-left sm:text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-soft text-accent border border-accent/20 rounded-full text-xs font-bold">
          <Scale className="w-3.5 h-3.5" />
          <span>Austin &amp; Travis County Public Civic Shield</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-ink leading-tight">
          Understand the letter before the deadline passes.
        </h1>
        <p className="text-sm sm:text-base text-ink-muted leading-relaxed max-w-lg sm:mx-auto">
          Upload a photo or PDF from your landlord, the city, a hospital, or benefits office. Get a <strong>6th-grade summary</strong>, exact deadlines that matter, and free local legal aid in under 60 seconds.
        </p>
      </div>

      {/* 2. Upload Card / Dropzone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="bg-surface border-2 border-dashed border-line-strong hover:border-accent rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm transition-colors text-center"
      >
        <div className="w-14 h-14 mx-auto rounded-2xl bg-accent-soft text-accent flex items-center justify-center shadow-xs">
          <Upload className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <h2 className="font-heading font-bold text-lg text-ink">
            Add Your Official Notice
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted max-w-sm mx-auto">
            Drag a file here, or choose from your phone or computer. Photos, scans, and PDFs work.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onOpenCamera}
            className="btn-primary py-2.5 px-5 text-xs font-bold"
          >
            <Camera className="w-4 h-4 mr-1.5" />
            <span>Take Photo with Camera</span>
          </button>
          <label className="btn-secondary py-2.5 px-5 text-xs font-bold cursor-pointer">
            <Upload className="w-4 h-4 mr-1.5" />
            <span>Upload Photo or PDF</span>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onOpenFileSelect(f);
              }}
            />
          </label>
        </div>

        {/* Trust Badges */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-[11px] text-ink-muted">
          <span className="flex items-center gap-1 bg-paper px-2.5 py-1 rounded-md border border-line">
            <Shield className="w-3 h-3 text-emerald-600" />
            100% Client-Side Privacy (Zero retention)
          </span>
          <span className="flex items-center gap-1 bg-paper px-2.5 py-1 rounded-md border border-line">
            <Sparkles className="w-3 h-3 text-accent" />
            Texas Property &amp; Civil Code Aware
          </span>
        </div>
      </div>

      {/* 3. Preloaded Realistic Central Texas Letters */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
            Or test instantly with real Central Texas notices:
          </span>
          <span className="text-[11px] text-ink-muted">1-Click Demo</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SAMPLE_LETTERS.map((letter) => (
            <button
              key={letter.id}
              onClick={() => onSelectSample(letter)}
              className="text-left p-3.5 rounded-xl border border-line bg-surface hover:bg-paper-elevated hover:border-line-strong transition-all flex items-start gap-3 shadow-2xs group"
            >
              <span className="text-2xl mt-0.5 group-hover:scale-110 transition-transform">
                {letter.emoji}
              </span>
              <div className="min-w-0">
                <h4 className="font-heading font-bold text-xs text-ink group-hover:text-accent transition-colors">
                  {letter.title}
                </h4>
                <p className="text-[11px] text-ink-muted line-clamp-1 mt-0.5">
                  {letter.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
