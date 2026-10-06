'use client';

import { Phone, ExternalLink, MapPin, Clock, ShieldCheck, HeartHandshake } from 'lucide-react';
import type { LocalResource } from '@/lib/types';

interface AidDirectoryProps {
  resources: LocalResource[];
}

export function AidDirectory({ resources }: AidDirectoryProps) {
  return (
    <div className="bg-surface border border-line rounded-2xl p-5 sm:p-7 space-y-5 shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-line pb-4">
        <div className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center">
          <HeartHandshake className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-base text-ink">
            Verified Free Legal Aid &amp; Emergency Assistance
          </h3>
          <p className="text-xs text-ink-muted">
            Non-profit and government organizations serving Austin &amp; Travis County residents:
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resources.map((resource, idx) => (
          <div
            key={idx}
            className="border border-line rounded-xl p-4 bg-paper-elevated/60 hover:bg-paper-elevated hover:border-line-strong transition-all flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-heading font-bold text-sm text-ink leading-tight">
                  {resource.name}
                </h4>
                {resource.isFree && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded shrink-0">
                    100% Free
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-muted leading-relaxed">
                {resource.description}
              </p>
            </div>

            <div className="pt-2 border-t border-line/60 space-y-2 text-xs">
              <div className="flex items-center justify-between text-ink-muted text-[11px]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  {resource.region}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-ink-muted" />
                  {resource.hours}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`tel:${resource.phone.replace(/[^0-9]/g, '')}`}
                  className="flex-1 py-1.5 px-3 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {resource.phone}</span>
                </a>
                {resource.website && (
                  <a
                    href={resource.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-2.5 bg-surface border border-line hover:bg-paper text-ink rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    title="Visit official website"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
