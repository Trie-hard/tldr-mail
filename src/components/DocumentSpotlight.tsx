'use client';

import { useState } from 'react';
import { Sparkles, BookOpen, HelpCircle, Eye } from 'lucide-react';
import type { LetterAnalysis } from '@/lib/types';
import { getCivicKnowledge, JargonDefinition } from '@/lib/civic-knowledge';

interface DocumentSpotlightProps {
  analysis: LetterAnalysis;
  rawLetterText?: string;
  onOpenDocVisualizer?: () => void;
}

export function DocumentSpotlight({
  analysis,
  rawLetterText,
  onOpenDocVisualizer,
}: DocumentSpotlightProps) {
  const [activeTab, setActiveTab] = useState<'plain' | 'original'>('plain');
  const [selectedJargon, setSelectedJargon] = useState<JargonDefinition | null>(null);

  const civicPack = getCivicKnowledge(analysis.category);
  const jargonList = civicPack?.jargon || [];

  return (
    <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm space-y-0">
      {/* Tab Header & Spotlight Mode Switcher */}
      <div className="bg-paper-elevated px-4 sm:px-6 py-3 border-b border-line flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent" />
          <h3 className="font-heading font-bold text-sm text-ink">
            Document Spotlight &amp; Jargon Decoder
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="bg-surface border border-line rounded-lg p-0.5 flex text-xs font-semibold">
            <button
              onClick={() => setActiveTab('plain')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'plain'
                  ? 'bg-accent text-white shadow-2xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Plain Translation
            </button>
            <button
              onClick={() => setActiveTab('original')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'original'
                  ? 'bg-accent text-white shadow-2xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Original Notice Text
            </button>
          </div>

          {onOpenDocVisualizer && (
            <button
              onClick={onOpenDocVisualizer}
              className="text-xs font-bold px-2.5 py-1 text-accent bg-accent-soft hover:bg-accent/20 rounded-lg flex items-center gap-1 transition-colors"
              title="View scanned visual facsimile"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Scanned Facsimile</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Document Reader / Translator */}
        <div className="lg:col-span-7 space-y-4">
          {activeTab === 'plain' ? (
            <div className="space-y-4">
              <div className="bg-surface-ground border border-outline-variant p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-accent" />
                  What This Document Actually Means
                </div>
                <p className="text-sm sm:text-base font-body text-ink leading-relaxed">
                  {analysis.tldr}
                </p>
                <div className="bg-surface border border-line rounded-lg p-3 text-xs text-ink-muted space-y-1.5">
                  <div>
                    <strong className="text-ink">Demands Made: </strong>
                    {analysis.whatItWants}
                  </div>
                  <div>
                    <strong className="text-ink">Deadline Imposed: </strong>
                    <span className="text-red-700 font-semibold">{analysis.deadline || 'Immediate'}</span>
                  </div>
                  <div>
                    <strong className="text-ink">Stated Penalty: </strong>
                    {analysis.consequenceOfInaction}
                  </div>
                </div>
              </div>

              {/* Key Facts Bullet points */}
              {analysis.keyFacts && analysis.keyFacts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                    Critical Clauses Detected:
                  </h4>
                  <ul className="space-y-1.5">
                    {analysis.keyFacts.map((fact, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-ink bg-paper-elevated border border-line/60 rounded-lg p-2.5 flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-ink-muted">
                <span className="font-bold uppercase tracking-wider">Raw Text Extracted from Letter</span>
                <span className="font-mono text-[10px]">OCR Text View</span>
              </div>
              <div className="bg-paper-elevated border border-line rounded-xl p-4 font-mono text-xs text-ink whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto select-text">
                {rawLetterText || 'Original text available when sample or scanned document is selected.'}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Jargon Decoder Cards */}
        <div className="lg:col-span-5 bg-paper-elevated border border-line rounded-xl p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-accent" />
              Legal Terms Decoded
            </span>
            <span className="text-[10px] text-ink-muted">Click to reveal</span>
          </div>

          <div className="space-y-2">
            {jargonList.length > 0 ? (
              jargonList.map((jargon, idx) => {
                const isSelected = selectedJargon?.term === jargon.term;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedJargon(isSelected ? null : jargon)}
                    className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                      isSelected
                        ? 'border-accent bg-accent-soft text-ink font-semibold shadow-2xs'
                        : 'border-line/70 bg-surface hover:bg-paper-elevated text-ink'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-accent">&ldquo;{jargon.term}&rdquo;</span>
                      <span className="text-[10px] text-ink-muted font-normal">
                        {isSelected ? 'Hide' : 'Explain'}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="mt-2 pt-2 border-t border-accent/20 space-y-1.5 text-ink-muted font-normal text-[11px] leading-relaxed">
                        <p>
                          <strong className="text-ink">What it means: </strong>
                          {jargon.definition}
                        </p>
                        <p className="bg-surface p-1.5 rounded border border-line text-[10px] text-ink italic">
                          &ldquo;{jargon.inContext}&rdquo;
                        </p>
                      </div>
                    )}
                  </button>
                );
              })
            ) : (
              <p className="text-xs text-ink-muted italic">
                No complex jargon detected in this category.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
