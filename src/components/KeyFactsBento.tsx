'use client';

import { DollarSign, Clock, AlertOctagon, Scale, CalendarPlus, Download } from 'lucide-react';
import type { LetterAnalysis } from '@/lib/types';
import { generateICS, generateGoogleCalendarLink, downloadICS } from '@/lib/calendar';

interface KeyFactsBentoProps {
  analysis: LetterAnalysis;
}

export function KeyFactsBento({ analysis }: KeyFactsBentoProps) {
  const handleDownloadICS = () => {
    if (!analysis.deadlineDate) return;
    const title = `CRITICAL DEADLINE: ${analysis.sender}`;
    const desc = `${analysis.tldr}\n\nWhat it wants: ${analysis.whatItWants}\nConsequence: ${analysis.consequenceOfInaction}`;
    const icsContent = generateICS({ title, description: desc, date: analysis.deadlineDate });
    downloadICS(icsContent, 'deadline-reminder');
  };

  const handleGoogleCalendar = () => {
    if (!analysis.deadlineDate) return;
    const title = `CRITICAL DEADLINE: ${analysis.sender}`;
    const desc = `${analysis.tldr}\n\nWhat it wants: ${analysis.whatItWants}\nConsequence: ${analysis.consequenceOfInaction}`;
    const link = generateGoogleCalendarLink({ title, description: desc, date: analysis.deadlineDate });
    window.open(link, '_blank');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. What It Demands */}
      <div className="bg-surface border border-line rounded-xl p-4 flex flex-col justify-between shadow-2xs hover:border-line-strong transition-colors">
        <div>
          <div className="flex items-center justify-between text-ink-muted text-xs mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[10px]">1. What It Demands</span>
            <DollarSign className="w-4 h-4 text-accent" />
          </div>
          <div className="text-lg font-heading font-bold text-ink">
            {analysis.financialAmount || 'Specific Action Demanded'}
          </div>
          <p className="text-xs text-ink-muted mt-1 leading-relaxed">
            {analysis.whatItWants}
          </p>
        </div>
        <div className="mt-3 pt-2.5 border-t border-line/60">
          <span className="inline-block text-[10px] font-bold text-accent bg-accent-soft px-2 py-0.5 rounded">
            Immediate Obligation
          </span>
        </div>
      </div>

      {/* 2. Strict Legal Deadline */}
      <div className="bg-red-50/70 border border-red-300 rounded-xl p-4 flex flex-col justify-between shadow-2xs">
        <div>
          <div className="flex items-center justify-between text-red-700 text-xs mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[10px]">2. Strict Deadline</span>
            <Clock className="w-4 h-4 text-emergency" />
          </div>
          <div className="text-lg font-heading font-bold text-emergency">
            {analysis.deadline || 'Statutory Window'}
          </div>
          <p className="text-xs text-red-900 mt-1 leading-relaxed">
            {analysis.deadlineDate
              ? `Calendar deadline: ${analysis.deadlineDate}`
              : 'Failure to respond triggers immediate default escalation.'}
          </p>
        </div>
        <div className="mt-3 pt-2.5 border-t border-red-200 flex items-center justify-between gap-1.5">
          <button
            onClick={handleGoogleCalendar}
            className="flex-1 py-1 px-1.5 bg-white border border-red-300 hover:bg-red-100 text-red-800 text-[10px] font-bold rounded flex items-center justify-center gap-1 transition-colors"
            title="Add to Google Calendar"
          >
            <CalendarPlus className="w-3 h-3" />
            Google Cal
          </button>
          <button
            onClick={handleDownloadICS}
            className="py-1 px-1.5 bg-white border border-red-300 hover:bg-red-100 text-red-800 text-[10px] font-bold rounded flex items-center justify-center gap-1 transition-colors"
            title="Download Apple / Outlook .ics calendar file"
          >
            <Download className="w-3 h-3" />
            .ICS
          </button>
        </div>
      </div>

      {/* 3. Financial & Fee Flag */}
      <div className="bg-surface border border-line rounded-xl p-4 flex flex-col justify-between shadow-2xs hover:border-line-strong transition-colors">
        <div>
          <div className="flex items-center justify-between text-ink-muted text-xs mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[10px]">3. Financial Stakes</span>
            <Scale className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg font-heading font-bold text-ink">
            {analysis.financialAmount ? `${analysis.financialAmount} Stated` : 'Non-Monetary Rights'}
          </div>
          <p className="text-xs text-ink-muted mt-1 leading-relaxed">
            {analysis.keyFacts && analysis.keyFacts.length > 0
              ? analysis.keyFacts[0]
              : 'Check for disputable fees, interest, or unverified claims.'}
          </p>
        </div>
        <div className="mt-3 pt-2.5 border-t border-line/60">
          <span className="inline-block text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
            Verify Before Paying
          </span>
        </div>
      </div>

      {/* 4. Consequence If Ignored */}
      <div className="bg-surface border border-line rounded-xl p-4 flex flex-col justify-between shadow-2xs hover:border-line-strong transition-colors">
        <div>
          <div className="flex items-center justify-between text-ink-muted text-xs mb-1.5">
            <span className="font-bold uppercase tracking-wider text-[10px]">4. If Ignored</span>
            <AlertOctagon className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-lg font-heading font-bold text-ink">
            {analysis.category === 'eviction'
              ? 'Court Filing'
              : analysis.category === 'utility-shutoff'
              ? 'Service Shutoff'
              : 'Statutory Penalty'}
          </div>
          <p className="text-xs text-ink-muted mt-1 leading-relaxed line-clamp-3">
            {analysis.consequenceOfInaction}
          </p>
        </div>
        <div className="mt-3 pt-2.5 border-t border-line/60">
          <span className="inline-block text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
            Next Escalation Step
          </span>
        </div>
      </div>
    </div>
  );
}
