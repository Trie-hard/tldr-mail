'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, ListChecks, PhoneCall, Copy, Check } from 'lucide-react';
import type { LetterAnalysis } from '@/lib/types';
import { getCivicKnowledge } from '@/lib/civic-knowledge';

interface ActionRoadmapProps {
  analysis: LetterAnalysis;
  completedSteps: Record<number, boolean>;
  onToggleStep: (stepOrder: number) => void;
  completedPrepDocs: Record<number, boolean>;
  onTogglePrepDoc: (index: number) => void;
  activePlayingStep?: number | null;
}

export function ActionRoadmap({
  analysis,
  completedSteps,
  onToggleStep,
  completedPrepDocs,
  onTogglePrepDoc,
  activePlayingStep,
}: ActionRoadmapProps) {
  const [callScriptCopied, setCallScriptCopied] = useState(false);
  const civicPack = getCivicKnowledge(analysis.category);

  const totalSteps = analysis.steps.length;
  const doneCount = analysis.steps.filter((s) => completedSteps[s.order]).length;
  const progressPercent = totalSteps > 0 ? Math.round((doneCount / totalSteps) * 100) : 0;

  const handleCopyCallScript = () => {
    if (!civicPack?.prep?.callScript) return;
    navigator.clipboard.writeText(civicPack.prep.callScript);
    setCallScriptCopied(true);
    setTimeout(() => setCallScriptCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Legal Process Stepper Roadmap */}
      {civicPack?.timeline && civicPack.timeline.length > 0 && (
        <div className="bg-surface border border-line rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-ink">
                Legal Process Roadmap
              </h3>
              <p className="text-xs text-ink-muted">
                Where you stand right now in the statutory process:
              </p>
            </div>
            <span className="text-xs font-bold text-accent bg-accent-soft px-3 py-1 rounded-full border border-accent/20">
              Stage 1 of {civicPack.timeline.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
            {civicPack.timeline.map((stage, idx) => {
              const isCurrent = idx === 0;
              return (
                <div
                  key={stage.step}
                  className={`rounded-xl p-3.5 border transition-all ${
                    isCurrent
                      ? 'border-accent bg-accent-soft/40 shadow-xs'
                      : 'border-line/70 bg-paper-elevated opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                        isCurrent
                          ? 'bg-accent text-white'
                          : 'bg-paper text-ink-muted border border-line'
                      }`}
                    >
                      {stage.step}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isCurrent ? 'text-accent' : 'text-ink-muted'
                      }`}
                    >
                      {isCurrent ? 'Current Phase' : stage.timeframe}
                    </span>
                  </div>
                  <h4 className="font-heading font-bold text-xs text-ink">
                    {stage.title}
                  </h4>
                  <p className="text-[11px] text-ink-muted mt-1 leading-relaxed">
                    {stage.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Interactive Action Checklist */}
      <div className="bg-surface border border-line rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ListChecks className="w-5 h-5 text-accent" />
            <div>
              <h3 className="font-heading font-bold text-base text-ink">
                Your Recommended Action Steps
              </h3>
              <p className="text-xs text-ink-muted">
                Clear 6th-grade instructions to resolve this notice safely:
              </p>
            </div>
          </div>

          {/* Progress Tracker Pill */}
          <div className="flex items-center gap-2">
            <div className="w-24 bg-paper rounded-full h-2 overflow-hidden border border-line">
              <div
                className="bg-accent h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-accent">
              {doneCount}/{totalSteps} Done
            </span>
          </div>
        </div>

        {/* Step Cards */}
        <div className="space-y-2.5">
          {analysis.steps.map((step) => {
            const isCompleted = !!completedSteps[step.order];
            const isPlaying = activePlayingStep === step.order;

            return (
              <div
                key={step.order}
                onClick={() => onToggleStep(step.order)}
                className={`p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 select-none ${
                  isPlaying
                    ? 'border-accent bg-accent-soft ring-2 ring-accent/30 shadow-xs'
                    : isCompleted
                    ? 'border-line/70 bg-paper-elevated opacity-70'
                    : 'border-line bg-surface hover:border-line-strong hover:bg-paper-elevated shadow-2xs'
                }`}
              >
                <button
                  type="button"
                  className="mt-0.5 text-accent hover:opacity-80 transition-opacity"
                  aria-label={`Mark step ${step.order} ${isCompleted ? 'incomplete' : 'complete'}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-5 h-5 text-line-strong" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-xs font-bold ${
                        isCompleted ? 'line-through text-ink-muted' : 'text-ink'
                      }`}
                    >
                      Step {step.order}: {step.action}
                    </span>
                    <span className="text-[10px] font-bold text-accent bg-accent-soft px-2 py-0.5 rounded">
                      {step.timeframe}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Call Script & Clinic Prep */}
      {civicPack?.prep && (
        <div className="bg-paper-elevated border border-line rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-accent" />
              <h3 className="font-heading font-bold text-sm text-ink">
                What to Say When You Call Legal Aid or Leasing
              </h3>
            </div>
            <button
              onClick={handleCopyCallScript}
              className="text-xs font-bold text-accent bg-surface border border-line hover:bg-paper px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
            >
              {callScriptCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {callScriptCopied ? 'Copied' : 'Copy Script'}
            </button>
          </div>

          <div className="bg-surface border border-line rounded-xl p-4 text-xs text-ink italic leading-relaxed">
            &ldquo;{civicPack.prep.callScript}&rdquo;
          </div>

          {civicPack.prep.documentsToBring.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Documents to Have in Front of You:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {civicPack.prep.documentsToBring.map((doc, idx) => {
                  const isChecked = !!completedPrepDocs[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => onTogglePrepDoc(idx)}
                      className="p-2.5 rounded-lg border border-line/70 bg-surface hover:bg-paper cursor-pointer flex items-center gap-2 text-xs transition-colors"
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-line-strong shrink-0" />
                      )}
                      <span className={isChecked ? 'line-through text-ink-muted' : 'text-ink'}>
                        {doc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
