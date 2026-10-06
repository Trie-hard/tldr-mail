'use client';

import { useRef, useEffect, useState } from 'react';
import { Eraser, Sparkles, ArrowRight, ShieldCheck, Undo2, X } from 'lucide-react';

interface RedactionStudioProps {
  imageSrc: string;
  imageMime: string;
  onProceed: (redactedBase64: string) => void;
  onCancel: () => void;
}

export function RedactionStudio({
  imageSrc,
  imageMime,
  onProceed,
  onCancel,
}: RedactionStudioProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasRedactions, setHasRedactions] = useState(false);
  const [brushSize, setBrushSize] = useState<'normal' | 'large'>('normal');

  useEffect(() => {
    if (imageSrc && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const img = new window.Image();
      img.onload = () => {
        const maxWidth = 720;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = imageSrc;
    }
  }, [imageSrc]);

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown' && e.type !== 'touchstart') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    const w = brushSize === 'large' ? 54 : 36;
    const h = brushSize === 'large' ? 28 : 18;

    ctx.fillStyle = '#000000';
    ctx.fillRect(x - w / 2, y - h / 2, w, h);
    setHasRedactions(true);
  };

  const clearRedactions = () => {
    if (!imageSrc || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new window.Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setHasRedactions(false);
    };
    img.src = imageSrc;
  };

  // 1-Tap Auto-Redact Smart Scrub
  const applySmartScrub = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000000';
    // Top right account block area
    ctx.fillRect(canvas.width * 0.65, canvas.height * 0.08, canvas.width * 0.3, canvas.height * 0.06);
    // Recipient address SSN / ID area
    ctx.fillRect(canvas.width * 0.08, canvas.height * 0.16, canvas.width * 0.35, canvas.height * 0.05);

    setHasRedactions(true);
  };

  const handleFinish = () => {
    if (!canvasRef.current) return;
    const base64 = canvasRef.current.toDataURL(imageMime).split(',')[1];
    onProceed(base64);
  };

  return (
    <div className="bg-surface border-2 border-line rounded-2xl p-5 sm:p-7 space-y-5 shadow-sm max-w-2xl mx-auto">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-accent" />
          <div>
            <h3 className="font-heading font-bold text-base text-ink">
              Privacy Shield: Redact Sensitive Numbers
            </h3>
            <p className="text-xs text-ink-muted">
              Drag your finger or mouse over your SSN, phone number, or bank details before AI analysis.
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-1.5 text-ink-muted hover:text-ink rounded-lg"
          title="Cancel and retake"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Canvas Area */}
      <div className="flex justify-center bg-paper-elevated border border-line rounded-xl p-3 overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={(e) => {
            setIsDrawing(true);
            draw(e);
          }}
          onMouseUp={() => setIsDrawing(false)}
          onMouseMove={draw}
          onTouchStart={(e) => {
            setIsDrawing(true);
            draw(e);
          }}
          onTouchEnd={() => setIsDrawing(false)}
          onTouchMove={draw}
          className="cursor-crosshair max-w-full h-auto rounded-lg shadow-2xs touch-none border border-line/60"
        />
      </div>

      {/* Toolbar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={applySmartScrub}
            className="text-xs font-bold px-3 py-1.5 bg-accent-soft hover:bg-accent/20 text-accent rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            1-Tap Auto-Scrub Account Area
          </button>
          <button
            onClick={clearRedactions}
            disabled={!hasRedactions}
            className="text-xs font-semibold px-2.5 py-1.5 bg-paper hover:bg-paper-elevated disabled:opacity-40 text-ink-muted rounded-lg flex items-center gap-1 transition-colors"
          >
            <Eraser className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="text-xs font-semibold px-3 py-2 text-ink-muted hover:text-ink transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleFinish}
            className="btn-primary text-xs font-bold px-5 py-2 shadow-xs"
          >
            <span>Proceed to Decode</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
