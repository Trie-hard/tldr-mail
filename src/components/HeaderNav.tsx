'use client';

import Image from 'next/image';
import { Phone, RotateCcw, Volume2, Shield } from 'lucide-react';
import type { SupportedLanguage } from '@/lib/types';
import { LANGUAGE_NAMES } from '@/lib/types';

interface HeaderNavProps {
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onReset: () => void;
  showScanAnother: boolean;
  fontSize: 'normal' | 'large' | 'xlarge';
  onFontSizeChange: (size: 'normal' | 'large' | 'xlarge') => void;
}

export function HeaderNav({
  language,
  onLanguageChange,
  onReset,
  showScanAnother,
  fontSize,
  onFontSizeChange,
}: HeaderNavProps) {
  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-line shadow-xs no-print">
      {/* Top Urgent Emergency Alert Strip */}
      <div className="bg-primary text-white text-[11px] font-medium py-1 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center bg-red-600 text-white rounded-full px-2 py-0.5 font-bold uppercase tracking-wider text-[9px] animate-pulse">
              Emergency Hotline
            </span>
            <span>
              Austin Tenant Eviction Defense &amp; Housing Rights:{' '}
              <a href="tel:5124741961" className="font-bold underline hover:text-amber-200 ml-1">
                (512) 474-1961
              </a>{' '}
              (Free Counseling)
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-slate-300 text-[10px]">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-400" />
              100% Client-Side Privacy (Zero Data Retention)
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-3 text-left rounded-lg p-1 hover:opacity-90 transition-opacity"
        >
          <div className="w-10 h-10 rounded-xl bg-accent text-surface flex items-center justify-center overflow-hidden ring-1 ring-line shadow-xs">
            <Image src="/logo.png" alt="TL;DR Mail" width={40} height={40} className="object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-bold text-ink block leading-tight">
                TL;DR Mail
              </span>
              <span className="hidden md:inline-block text-[10px] font-semibold text-primary bg-primary-container px-1.5 py-0.2 rounded border border-blue-200">
                Austin &amp; Travis Co.
              </span>
            </div>
            <span className="hidden sm:block text-[11px] text-ink-muted">
              Plain-language decoder for official notices &amp; legal mail
            </span>
          </div>
        </button>

        {/* Right Controls & Accessibility Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Font Sizing Accessibility Toggle */}
          <div
            className="flex items-center bg-paper-elevated border border-line rounded-lg p-0.5"
            title="Adjust text size for easier reading"
            aria-label="Text size"
          >
            <button
              onClick={() => onFontSizeChange('normal')}
              className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${
                fontSize === 'normal' ? 'bg-surface text-ink shadow-2xs' : 'text-ink-muted hover:text-ink'
              }`}
            >
              A
            </button>
            <button
              onClick={() => onFontSizeChange('large')}
              className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${
                fontSize === 'large' ? 'bg-surface text-ink shadow-2xs' : 'text-ink-muted hover:text-ink'
              }`}
            >
              A+
            </button>
            <button
              onClick={() => onFontSizeChange('xlarge')}
              className={`px-2 py-1 text-sm font-bold rounded-md transition-colors ${
                fontSize === 'xlarge' ? 'bg-surface text-ink shadow-2xs' : 'text-ink-muted hover:text-ink'
              }`}
            >
              A++
            </button>
          </div>

          {/* Language Selector */}
          <select
            aria-label="Select Language"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
            className="text-xs font-semibold bg-surface border border-line rounded-lg py-1.5 pl-2.5 pr-7 text-ink focus:ring-2 focus:ring-accent/40 focus:outline-none cursor-pointer"
          >
            <option value="en">English (US)</option>
            <option value="es">Español (Texas)</option>
            <option value="vi">Tiếng Việt (Austin)</option>
            <option value="zh">中文</option>
            <option value="ar">العربية</option>
          </select>

          {/* Scan Another Button (When in Results) */}
          {showScanAnother && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-ink hover:bg-ink/90 text-surface rounded-lg transition-transform active:scale-95 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Decode Another</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
