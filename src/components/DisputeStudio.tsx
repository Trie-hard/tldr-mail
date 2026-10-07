'use client';

import { useState } from 'react';
import { Gavel, Copy, Check, Printer, FileCheck, Sparkles, Loader2 } from 'lucide-react';
import type { LetterAnalysis } from '@/lib/types';

interface DisputeStudioProps {
  analysis: LetterAnalysis;
  appealLetter: string | null;
  onGenerateAppeal: () => void;
  isLoading: boolean;
}

export function DisputeStudio({
  analysis,
  appealLetter,
  onGenerateAppeal,
  isLoading,
}: DisputeStudioProps) {
  const [copied, setCopied] = useState(false);
  const [editedLetter, setEditedLetter] = useState<string | null>(null);

  const currentContent = editedLetter !== null ? editedLetter : appealLetter;

  const handleCopy = () => {
    if (!currentContent) return;
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatutePill = () => {
    switch (analysis.category) {
      case 'eviction':
        return 'Texas Property Code § 24.005 & § 92.019 (Late Fee Caps & Cure Rights)';
      case 'medical-bill':
        return 'Federal No Surprises Act & Texas Health Code § 311.002 (Itemized Review)';
      case 'debt-collection':
        return '15 U.S.C. § 1692g (FDCPA Written Debt Validation Demand)';
      case 'utility-shutoff':
        return '16 TAC § 25.483 (Texas Extreme Weather & Medical Necessity Disconnection Rules)';
      default:
        return 'Texas Civil Practice and Remedies Code (Formal Written Notice to Cure)';
    }
  };

  return (
    <div className="bg-surface border border-line rounded-2xl p-5 sm:p-7 space-y-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center">
            <Gavel className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-ink">
              1-Click Formal Legal Dispute Draft
            </h3>
            <p className="text-xs text-ink-muted">
              Auto-tailored formal response letter citing relevant consumer statutes:
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentContent && (
            <>
              <button
                onClick={handleCopy}
                className="btn-secondary py-1.5 px-3 text-xs font-bold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="btn-secondary py-1.5 px-3 text-xs font-bold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Statutory Protection Banner */}
      <div className="bg-paper-elevated border border-line rounded-xl p-3 flex items-center gap-2 text-xs text-ink-muted">
        <FileCheck className="w-4 h-4 text-accent shrink-0" />
        <span>
          Statutory Basis:{' '}
          <strong className="text-ink">{getStatutePill()}</strong>
        </span>
      </div>

      {/* Draft Content / Trigger */}
      {currentContent ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span className="font-semibold">Review &amp; Edit Before Mailing:</span>
            <span className="text-[11px] italic">Fill in [BRACKETED] fields with your name and address</span>
          </div>

          <textarea
            value={currentContent}
            onChange={(e) => setEditedLetter(e.target.value)}
            rows={14}
            className="w-full font-mono text-xs p-4 bg-paper-elevated border border-line rounded-xl text-ink leading-relaxed focus:ring-2 focus:ring-accent/40 focus:outline-none resize-y"
          />

          <p className="text-[11px] text-ink-muted">
            Tip: Send via Certified Mail with Return Receipt Requested, or hand-deliver to the office and ask the receptionist to stamp your copy with today&apos;s date.
          </p>
        </div>
      ) : (
        <div className="bg-paper-elevated border border-dashed border-line-strong rounded-xl p-8 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-accent mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="font-heading font-bold text-sm text-ink">
              Generate Formal Response to {analysis.sender}
            </h4>
            <p className="text-xs text-ink-muted">
              Creates a tailored dispute letter demanding payment verification, invoking Texas statutory rights, and requesting a formal meeting.
            </p>
          </div>
          <button
            onClick={onGenerateAppeal}
            disabled={isLoading}
            className="btn-primary py-2.5 px-6 text-xs font-bold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Drafting Formal Letter...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Draft Legal Response Letter
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
