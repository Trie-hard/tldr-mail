'use client';

import { useMemo } from 'react';
import { AlertTriangle, HeartHandshake, Info } from 'lucide-react';
import type { LetterAnalysis } from '@/lib/types';

interface TriageHeroProps {
  analysis: LetterAnalysis;
  onOpenDocFacsimile?: () => void;
}

export function TriageHero({ analysis, onOpenDocFacsimile }: TriageHeroProps) {
  // Reassurance messaging based on document category
  const reassurance = useMemo(() => {
    switch (analysis.category) {
      case 'eviction':
        return {
          title: 'You do NOT have to leave today.',
          subtitle:
            'Under Texas Property Code § 24.005, a Notice to Vacate is NOT an eviction order. A landlord cannot legally change your locks, remove doors, or put your property on the curb without winning a formal lawsuit in Justice of the Peace Court.',
          color: 'border-red-400 bg-red-50/80 text-red-950',
          badgeColor: 'bg-red-700 text-white',
        };
      case 'utility-shutoff':
        return {
          title: 'Power cannot be shut off without notice.',
          subtitle:
            'Austin Energy & Texas utilities cannot disconnect critical service without strict 10-day notice windows, during declared extreme weather alerts, or if you apply for the City of Austin Customer Assistance Program (CAP).',
          color: 'border-amber-400 bg-amber-50/80 text-amber-950',
          badgeColor: 'bg-amber-700 text-white',
        };
      case 'medical-bill':
        return {
          title: 'Do not pay full price immediately.',
          subtitle:
            'Under the Federal No Surprises Act and Texas Health and Safety Code, you have the right to request an itemized billing code review, dispute emergency out-of-network charges, and request non-profit charity care write-offs.',
          color: 'border-blue-400 bg-blue-50/80 text-blue-950',
          badgeColor: 'bg-blue-700 text-white',
        };
      case 'benefits-denial':
        return {
          title: 'Benefits can be restored via Fair Hearing.',
          subtitle:
            'Most Texas Medicaid/SNAP benefit cutoffs are caused by procedural form delays, not ineligibility. Requesting a 2-1-1 Fair Hearing can freeze your benefits while the state reviews your renewal packet.',
          color: 'border-emerald-400 bg-emerald-50/80 text-emerald-950',
          badgeColor: 'bg-emerald-700 text-white',
        };
      default:
        return {
          title: 'Take a breath. You have rights.',
          subtitle:
            'Official government and billing notices are intentionally written in dense legal language. You have statutory windows to respond, cure, or challenge this demand.',
          color: 'border-slate-400 bg-slate-50/80 text-slate-900',
          badgeColor: 'bg-slate-700 text-white',
        };
    }
  }, [analysis.category]);

  const urgencyBadge = useMemo(() => {
    if (analysis.urgency === 'critical') {
      return {
        bg: 'bg-emergency text-white',
        label: 'CRITICAL STATUTORY DEADLINE',
        border: 'border-red-300',
      };
    }
    if (analysis.urgency === 'action-required') {
      return {
        bg: 'bg-amber-600 text-white',
        label: 'ACTION REQUIRED SOON',
        border: 'border-amber-300',
      };
    }
    return {
      bg: 'bg-emerald-700 text-white',
      label: 'INFORMATIONAL NOTICE',
      border: 'border-emerald-300',
    };
  }, [analysis.urgency]);

  return (
    <div className="space-y-4">
      {/* 1. Header Alert Strip */}
      <div className="bg-surface border-2 border-line rounded-2xl overflow-hidden shadow-sm">
        <div className={`px-5 py-3 flex flex-wrap items-center justify-between gap-3 ${
          analysis.urgency === 'critical' ? 'bg-emergency text-white' : 'bg-primary text-white'
        }`}>
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-90 block">
                Official Document Analysis
              </span>
              <h2 className="text-sm sm:text-base font-heading font-bold">
                {analysis.sender || 'Official Central Texas Notice'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${urgencyBadge.bg}`}>
              {urgencyBadge.label}
            </span>
            {onOpenDocFacsimile && (
              <button
                onClick={onOpenDocFacsimile}
                className="text-[11px] font-bold px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors underline"
              >
                View Scanned Notice
              </button>
            )}
          </div>
        </div>

        {/* 2. Reassurance Card: "Calm in a Panic" */}
        <div className="p-5 sm:p-7 space-y-5">
          <div className={`rounded-xl border-2 p-4 sm:p-5 flex items-start gap-3.5 ${reassurance.color}`}>
            <HeartHandshake className="w-6 h-6 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${reassurance.badgeColor}`}>
                  Crucial Fact
                </span>
                <h3 className="font-heading font-bold text-base sm:text-lg">
                  {reassurance.title}
                </h3>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed opacity-95">
                {reassurance.subtitle}
              </p>
            </div>
          </div>

          {/* 3. The 6th-Grade Plain English Translation Box */}
          <div className="bg-amber-50/80 border-2 border-amber-300 rounded-xl p-5 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-700" />
                The 60-Second 6th-Grade Translation
              </span>
              <span className="text-[10px] font-bold bg-white text-amber-900 border border-amber-300 px-2 py-0.5 rounded shadow-2xs">
                Verified Plain English
              </span>
            </div>
            <p className="text-base sm:text-lg font-heading font-bold text-slate-900 leading-snug">
              &ldquo;{analysis.tldr}&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
