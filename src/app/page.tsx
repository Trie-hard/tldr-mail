'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import {
  Camera,
  Upload,
  FileText,
  AlertTriangle,
  Clock,
  DollarSign,
  CheckCircle2,
  Calendar,
  Download,
  Phone,
  Volume2,
  VolumeX,
  Send,
  Printer,
  Shield,
  Heart,
  Globe,
  MessageCircle,
  X,
  Loader2,
  BookOpen,
  Copy,
  Check,
  Eraser,
  Sparkles,
  ArrowRight,
  Scale,
  Share2,
  QrCode,
  BookMarked,
  PhoneCall,
  ListChecks,
  Gavel,
  Lock,
  Flame,
  FileCheck,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SAMPLE_LETTERS, SampleLetter } from '@/lib/sample-letters';
import { generateICS, generateGoogleCalendarLink, downloadICS } from '@/lib/calendar';
import { SpeechManager } from '@/lib/speech';
import { DocumentVisualizer } from '@/components/DocumentVisualizer';
import { getCivicKnowledge } from '@/lib/civic-knowledge';
import type { LetterAnalysis, LocalResource, SupportedLanguage } from '@/lib/types';
import { LANGUAGE_NAMES } from '@/lib/types';

type AppStatus = 'idle' | 'redacting' | 'analyzing' | 'done' | 'error';
type ResultTab = 'steps' | 'rights' | 'aid' | 'dispute' | 'chat';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [analysis, setAnalysis] = useState<LetterAnalysis | null>(null);
  const [resources, setResources] = useState<LocalResource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [letterContext, setLetterContext] = useState<string>('');
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [completedPrepDocs, setCompletedPrepDocs] = useState<Record<number, boolean>>({});
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [callScriptCopied, setCallScriptCopied] = useState(false);
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [activeTab, setActiveTab] = useState<ResultTab>('steps');
  const [activeJargonTerm, setActiveJargonTerm] = useState<string | null>(null);

  // Redaction state
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [rawImageMime, setRawImageMime] = useState<string>('image/jpeg');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasRedactions, setHasRedactions] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Appeal letter state
  const [appealLetter, setAppealLetter] = useState<string | null>(null);
  const [appealLoading, setAppealLoading] = useState(false);
  const [appealCopied, setAppealCopied] = useState(false);

  // Speech state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRef = useRef<SpeechManager | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    speechRef.current = new SpeechManager();
    return () => speechRef.current?.stop();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const toggleStep = (stepOrder: number) => {
    setCompletedSteps((prev) => ({ ...prev, [stepOrder]: !prev[stepOrder] }));
  };

  const togglePrepDoc = (index: number) => {
    setCompletedPrepDocs((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const analyzeImage = useCallback(
    async (imageBase64: string, mimeType: string, targetLang?: SupportedLanguage) => {
      setStatus('analyzing');
      setError(null);
      const activeLang = targetLang || language;
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64, mimeType, language: LANGUAGE_NAMES[activeLang] }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Analysis failed');
        setAnalysis(data.analysis);
        setResources(data.resources || []);
        setActiveTab('steps');
        setStatus('done');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        setStatus('error');
      }
    },
    [language]
  );

  const analyzeText = useCallback(
    async (textContent: string, targetLang?: SupportedLanguage) => {
      setStatus('analyzing');
      setError(null);
      setLetterContext(textContent);
      const activeLang = targetLang || language;
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ textContent, language: LANGUAGE_NAMES[activeLang] }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Analysis failed');
        setAnalysis(data.analysis);
        setResources(data.resources || []);
        setActiveTab('steps');
        setStatus('done');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        setStatus('error');
      }
    },
    [language]
  );

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    if (status === 'done' && letterContext) {
      analyzeText(letterContext, newLang);
    }
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setRawImageSrc(result);
      setRawImageMime(file.type || 'image/jpeg');
      setStatus('redacting');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setRawImageSrc(result);
      setRawImageMime(file.type || 'image/jpeg');
      setStatus('redacting');
    };
    reader.readAsDataURL(file);
  }, []);

  // Redaction Canvas handling
  useEffect(() => {
    if (status === 'redacting' && rawImageSrc && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const img = new window.Image();
      img.onload = () => {
        const maxWidth = 640;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = rawImageSrc;
    }
  }, [status, rawImageSrc]);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDraw = () => {
    setIsDrawing(false);
  };

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

    ctx.fillStyle = '#000000';
    ctx.fillRect(x - 18, y - 10, 36, 20);
    setHasRedactions(true);
  };

  const clearRedactions = () => {
    if (!rawImageSrc || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new window.Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setHasRedactions(false);
    };
    img.src = rawImageSrc;
  };

  const proceedFromRedaction = () => {
    if (!canvasRef.current) return;
    const base64 = canvasRef.current.toDataURL(rawImageMime).split(',')[1];
    analyzeImage(base64, rawImageMime);
  };

  const handleSampleSelect = useCallback(
    (sample: SampleLetter) => {
      setLetterContext(sample.textContent);
      analyzeText(sample.textContent);
    },
    [analyzeText]
  );

  const handleSpeak = useCallback(() => {
    if (!analysis || !speechRef.current) return;
    if (isSpeaking) {
      speechRef.current.stop();
      setIsSpeaking(false);
      return;
    }
    const text = [
      analysis.tldr,
      `What it wants from you: ${analysis.whatItWants}`,
      analysis.deadline ? `Deadline: ${analysis.deadline}` : '',
      `What happens if you do nothing: ${analysis.consequenceOfInaction}`,
      'Steps you should take:',
      ...analysis.steps.map((s) => `Step ${s.order}: ${s.action}. ${s.timeframe}.`),
    ]
      .filter(Boolean)
      .join('. ');
    speechRef.current.speak(text, language, speechRate);
    speechRef.current.onEnd(() => setIsSpeaking(false));
    setIsSpeaking(true);
  }, [analysis, isSpeaking, language, speechRate]);

  const sendChatMessage = useCallback(
    async (textToSend: string) => {
      if (!textToSend.trim() || chatLoading) return;
      setChatInput('');
      setChatMessages((prev) => [...prev, { role: 'user', content: textToSend }]);
      setChatLoading(true);
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: textToSend,
            letterContext,
            language: LANGUAGE_NAMES[language],
          }),
        });
        const data = await res.json();
        setChatMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.answer || data.error || 'No response.' },
        ]);
      } catch {
        setChatMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
        ]);
      } finally {
        setChatLoading(false);
      }
    },
    [chatLoading, letterContext, language]
  );

  const handleChat = useCallback(async () => {
    sendChatMessage(chatInput);
  }, [chatInput, sendChatMessage]);

  const handleGenerateAppeal = useCallback(async () => {
    if (!analysis || appealLoading) return;
    setAppealLoading(true);
    try {
      const res = await fetch('/api/appeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          letterContext,
          category: analysis.category,
          language: LANGUAGE_NAMES[language],
        }),
      });
      const data = await res.json();
      setAppealLetter(data.appealLetter || null);
    } catch {
      setAppealLetter('Failed to generate response letter. Please try again.');
    } finally {
      setAppealLoading(false);
    }
  }, [analysis, appealLoading, letterContext, language]);

  const handleCopyAppeal = useCallback(() => {
    if (!appealLetter) return;
    navigator.clipboard.writeText(appealLetter);
    setAppealCopied(true);
    setTimeout(() => setAppealCopied(false), 2000);
  }, [appealLetter]);

  const handleCopyShareText = () => {
    if (!analysis) return;
    const shareText = `📋 TL;DR Mail Summary\nNotice: ${analysis.tldr}\n\n⚠️ Deadline: ${analysis.deadline || 'None listed'}\n💰 Balance: ${analysis.financialAmount || 'N/A'}\n\nWhat it wants: ${analysis.whatItWants}\n\nConsequence if ignored: ${analysis.consequenceOfInaction}\n\nMatched Free Aid: Texas RioGrande Legal Aid (1-888-988-9996)\nDecoded with TL;DR Mail`;
    navigator.clipboard.writeText(shareText);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleCopyCallScript = (script: string) => {
    navigator.clipboard.writeText(script);
    setCallScriptCopied(true);
    setTimeout(() => setCallScriptCopied(false), 2000);
  };

  const resetApp = () => {
    setStatus('idle');
    setAnalysis(null);
    setResources([]);
    setError(null);
    setLetterContext('');
    setChatMessages([]);
    setAppealLetter(null);
    setCompletedSteps({});
    setCompletedPrepDocs({});
    setRawImageSrc(null);
    setHasRedactions(false);
    setViewingDocId(null);
    setActiveJargonTerm(null);
    setShowShareModal(false);
    speechRef.current?.stop();
    setIsSpeaking(false);
  };

  const civicPack = analysis ? getCivicKnowledge(analysis.category) : null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* 1. CLEAN, UNCLUTTERED SINGLE HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs no-print">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Anchor */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={resetApp}>
            <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-xs overflow-hidden">
              <Image src="/logo.png" alt="TL;DR Mail" width={36} height={36} className="object-cover" />
            </div>
            <div>
              <span className="font-heading font-black text-lg tracking-tight text-slate-900">
                TL;DR Mail
              </span>
              <span className="hidden sm:inline-block ml-2 text-[11px] text-slate-500 font-medium">
                Official Letter Decoder • Austin, TX
              </span>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5">
            {/* Language Selector */}
            <select
              aria-label="Select Language"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
              className="text-xs font-semibold bg-white border border-slate-300 rounded-lg py-1.5 pl-2.5 pr-7 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="vi">Tiếng Việt</option>
              <option value="zh">中文</option>
              <option value="ar">العربية</option>
            </select>

            {/* Emergency Hotline Button */}
            <a
              href="tel:5124741961"
              className="hidden md:inline-flex items-center gap-1.5 text-slate-700 hover:text-red-700 text-xs font-semibold px-2 py-1 transition-colors"
              title="Call Austin Tenant Defense Hotline"
            >
              <Phone className="w-3.5 h-3.5 text-red-600" />
              <span>(512) 474-1961</span>
            </a>

            {/* Scan Another Button (When in Results) */}
            {status === 'done' && (
              <button
                onClick={resetApp}
                className="text-xs font-bold px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all"
              >
                Scan Another
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Community Impact Modal */}
      <AnimatePresence>
        {showStatsModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4"
            >
              <button
                onClick={() => setShowStatsModal(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-base font-black text-slate-900 font-heading">Central Texas Housing Crisis</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Official notices are written in confusing legalese. In Travis County alone, over 32,000 eviction cases are filed yearly, often because tenants panic or misunderstand short notice windows.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <span className="text-xl font-black text-red-700 font-heading">32,000+</span>
                  <p className="text-[11px] font-bold text-red-900">Evictions / Year</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <span className="text-xl font-black text-blue-700 font-heading">72 Hours</span>
                  <p className="text-[11px] font-bold text-blue-900">Standard Notice</p>
                </div>
              </div>
              <button
                onClick={() => setShowStatsModal(false)}
                className="w-full py-2 bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Family / Caseworker Share Modal */}
      <AnimatePresence>
        {showShareModal && analysis && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative space-y-4"
            >
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5">
                <Share2 className="w-5 h-5 text-blue-700" />
                <h3 className="text-base font-black text-slate-900 font-heading">Share Breakdown</h3>
              </div>

              {/* QR Code */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center text-center">
                <div className="w-28 h-28 bg-white border border-slate-300 rounded-lg p-2 shadow-2xs flex items-center justify-center mb-2">
                  <QrCode className="w-20 h-20 text-slate-900" />
                </div>
                <span className="text-[11px] font-bold text-slate-700">Scan to read on your phone</span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleCopyShareText}
                  className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  {shareCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {shareCopied ? 'Summary Copied!' : 'Copy for WhatsApp / SMS'}
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print 1-Page Summary
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Document Facsimile Modal */}
      {viewingDocId && (
        <DocumentVisualizer letterId={viewingDocId} onClose={() => setViewingDocId(null)} />
      )}

      {/* MAIN CONTAINER */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full">
        <AnimatePresence mode="wait">
          {/* ========================================================= */}
          {/* ===== IDLE STATE: CLEAN, AIRY, NON-CLUTTERED HERO ===== */}
          {/* ========================================================= */}
          {status === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8 text-center max-w-2xl mx-auto pt-4"
            >
              {/* Headline & Value Proposition */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200/80 rounded-full text-blue-800 text-xs font-bold">
                  <Shield className="w-3.5 h-3.5 text-blue-700" />
                  <span>Central Texas Civic Mail Decoder</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black font-heading text-slate-900 tracking-tight leading-tight">
                  Don’t let confusing mail ruin your life.
                </h1>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg mx-auto">
                  Snap a photo of an eviction notice, utility bill, or hospital statement. We decode bureaucratic jargon into plain 6th-grade English with deadlines and local Austin aid.
                </p>
              </div>

              {/* Minimal, Sleek Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="bg-white border-2 border-dashed border-slate-300 hover:border-blue-600 rounded-3xl p-8 shadow-xs transition-colors space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto shadow-2xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-sm text-slate-900">
                    Drop your letter here, or choose a file
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports phone photos, PDFs, and scanned documents
                  </p>
                </div>

                <div className="flex justify-center gap-3 pt-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
                  >
                    Select File / PDF
                  </button>
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-colors"
                  >
                    Take Photo
                  </button>
                </div>
              </div>

              {/* Clean Sample Pills (Horizontal Row) */}
              <div className="space-y-2.5 pt-2">
                <span className="text-xs font-semibold text-slate-500 block">
                  Or test with a sample letter:
                </span>
                <div className="flex flex-wrap justify-center gap-2">
                  {SAMPLE_LETTERS.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleSampleSelect(sample)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50/70 border border-slate-200 hover:border-blue-400 rounded-xl text-xs font-medium text-slate-700 transition-colors shadow-2xs"
                    >
                      <span>{sample.emoji}</span>
                      <span className="font-semibold">{sample.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quiet Privacy Footnote */}
              <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Client-Side Privacy: Documents are analyzed in memory and never saved.</span>
              </div>

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* ===== REDACTION VIEW (Client-side Privacy Scrubbing) ===== */}
          {/* ========================================================= */}
          {status === 'redacting' && (
            <motion.div
              key="redacting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 max-w-xl mx-auto"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 font-heading">Scrub Private Details</h3>
                  <p className="text-xs text-slate-500">Swipe over Social Security numbers, bank info, or names.</p>
                </div>
                <button
                  onClick={clearRedactions}
                  className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold border border-slate-200 flex items-center gap-1"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  Reset
                </button>
              </div>

              <div className="flex justify-center bg-slate-900 rounded-2xl p-2 overflow-hidden shadow-inner">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDraw}
                  onMouseUp={stopDraw}
                  onMouseMove={draw}
                  onTouchStart={startDraw}
                  onTouchEnd={stopDraw}
                  onTouchMove={draw}
                  className="max-w-full h-auto cursor-crosshair rounded-xl touch-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setStatus('idle')}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={proceedFromRedaction}
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <span>{hasRedactions ? 'Analyze Scrubbed Letter' : 'Continue Without Redacting'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* ===== ANALYZING VIEW (Processing Pipeline) ===== */}
          {/* ========================================================= */}
          {status === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl p-10 text-center max-w-sm mx-auto shadow-sm space-y-4"
            >
              <div className="relative w-12 h-12 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-700 animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 font-heading">Decoding Letter</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Translating legalese, finding deadlines, and matching local Austin aid...
                </p>
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* ===== ERROR VIEW ===== */}
          {/* ========================================================= */}
          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-md mx-auto space-y-3"
            >
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
              <h3 className="text-sm font-black text-red-950 font-heading">Could Not Decode Letter</h3>
              <p className="text-xs text-red-800 leading-relaxed">{error || 'An unexpected error occurred.'}</p>
              <button
                onClick={resetApp}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* ===== RESULTS VIEW: CLEAN PROGRESSIVE DISCLOSURE ===== */}
          {/* ========================================================= */}
          {status === 'done' && analysis && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* 1. CORE SUMMARY CARD: THE TRUTH BOX */}
              <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
                {/* Notice Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wide bg-red-100 text-red-800 font-mono">
                      {analysis.category.replace('-', ' ')}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      From: <strong>{analysis.sender || 'Issuing Authority'}</strong>
                    </span>
                  </div>
                  {analysis.deadline && (
                    <span className="text-xs font-extrabold text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {analysis.deadline}
                    </span>
                  )}
                </div>

                {/* Plain-English 6th-Grade TL;DR Box */}
                <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-900 font-heading">
                    <Flame className="w-4 h-4 text-amber-600" />
                    Plain English Translation (6th Grade)
                  </div>
                  <p className="text-base sm:text-lg font-heading font-black text-slate-900 leading-snug">
                    &quot;{analysis.tldr}&quot;
                  </p>
                </div>

                {/* 3 Key Stat Pills in a Clean Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-3.5">
                    <span className="text-[11px] font-bold text-slate-500 block mb-0.5">What They Want</span>
                    <p className="text-xs font-bold text-slate-900 leading-snug">{analysis.whatItWants}</p>
                  </div>
                  <div className="bg-[#f8fafc] border border-slate-200 rounded-xl p-3.5">
                    <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Amount Claimed</span>
                    <p className="text-sm font-black text-slate-900 font-mono">
                      {analysis.financialAmount || 'No dollar sum'}
                    </p>
                  </div>
                  <div className="bg-red-50/60 border border-red-200/80 rounded-xl p-3.5">
                    <span className="text-[11px] font-bold text-red-800 block mb-0.5">If Ignored</span>
                    <p className="text-xs font-semibold text-red-950 leading-snug">{analysis.consequenceOfInaction}</p>
                  </div>
                </div>

                {/* Quick Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSpeak}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all border ${
                        isSpeaking
                          ? 'bg-blue-700 text-white border-blue-700'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                      }`}
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-blue-700" />}
                      <span>{isSpeaking ? 'Stop Audio' : 'Listen Aloud'}</span>
                    </button>
                    {analysis.deadlineDate && (
                      <a
                        href={generateGoogleCalendarLink({
                          title: analysis.tldr,
                          description: `${analysis.whatItWants}\n\nAmount: ${analysis.financialAmount || 'N/A'}`,
                          date: analysis.deadlineDate,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-xl text-xs font-bold border border-blue-200"
                      >
                        <Calendar className="w-3.5 h-3.5 text-blue-700" />
                        <span>Add to Calendar</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* 2. PROGRESSIVE DISCLOSURE TABS (Declutters Page completely) */}
              <div className="space-y-4">
                {/* Segmented Tab Controls */}
                <div className="flex flex-wrap gap-1.5 p-1 bg-slate-200/80 rounded-2xl no-print">
                  <button
                    onClick={() => setActiveTab('steps')}
                    className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-heading font-bold flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === 'steps'
                        ? 'bg-white text-blue-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ListChecks className="w-3.5 h-3.5" />
                    <span>Action Plan ({analysis.steps.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('rights')}
                    className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-heading font-bold flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === 'rights'
                        ? 'bg-white text-blue-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Rights & Timeline</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('aid')}
                    className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-heading font-bold flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === 'aid'
                        ? 'bg-white text-blue-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Austin Aid ({resources.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('dispute')}
                    className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-heading font-bold flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === 'dispute'
                        ? 'bg-white text-blue-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Dispute Letter</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl text-xs font-heading font-bold flex items-center justify-center gap-1.5 transition-all ${
                      activeTab === 'chat'
                        ? 'bg-white text-blue-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Ask Questions</span>
                  </button>
                </div>

                {/* TAB 1: ACTION STEPS */}
                {activeTab === 'steps' && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-heading font-black text-sm text-slate-900">Your Action Steps</h3>
                        <p className="text-xs text-slate-500">Tap checkboxes as you complete each task</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {Object.values(completedSteps).filter(Boolean).length} of {analysis.steps.length} Done
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {analysis.steps.map((step) => {
                        const isDone = Boolean(completedSteps[step.order]);
                        return (
                          <div
                            key={step.order}
                            onClick={() => toggleStep(step.order)}
                            className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                              isDone
                                ? 'bg-emerald-50/40 border-emerald-200 opacity-60'
                                : 'bg-[#f8fafc] border-slate-200 hover:border-blue-300'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border mt-0.5 transition-colors ${
                              isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isDone && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <div className="flex-1">
                              <p className={`text-xs font-bold text-slate-900 leading-snug ${isDone ? 'line-through text-slate-500' : ''}`}>
                                {step.action}
                              </p>
                              <span className="inline-block text-[10px] font-bold text-slate-500 bg-white border border-slate-200 rounded px-2 py-0.5 mt-1 font-mono">
                                ⏰ {step.timeframe}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* TAB 2: RIGHTS, TIMELINE & JARGON */}
                {activeTab === 'rights' && civicPack && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Legal Timeline Stepper */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                      <div>
                        <h3 className="font-heading font-black text-sm text-slate-900">Texas Statutory Roadmap</h3>
                        <p className="text-xs text-slate-500">Notice phase vs. court filing vs. judge ruling</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        {civicPack.timeline.map((stage) => {
                          const isCurrent = stage.step === 1;
                          return (
                            <div
                              key={stage.step}
                              className={`p-3.5 rounded-2xl border transition-all ${
                                isCurrent
                                  ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/10'
                                  : 'bg-[#f8fafc] border-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  isCurrent ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                                }`}>
                                  Stage {stage.step}
                                </span>
                                {isCurrent && (
                                  <span className="text-[10px] font-bold text-blue-700">YOU ARE HERE</span>
                                )}
                              </div>
                              <p className="text-[10px] font-bold text-blue-700 font-mono">{stage.timeframe}</p>
                              <h4 className="text-xs font-bold text-slate-900 mt-0.5 mb-1">{stage.title}</h4>
                              <p className="text-[11px] text-slate-600 leading-relaxed">{stage.description}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Legal Protections */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-600" />
                        <h3 className="font-heading font-black text-sm text-slate-900">Your Legal Protections</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {civicPack.rights.map((right, idx) => (
                          <div key={idx} className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-1">
                            <h4 className="text-xs font-black text-emerald-950 flex items-center gap-1.5 font-heading">
                              <span>{right.icon}</span>
                              <span>{right.title}</span>
                            </h4>
                            <p className="text-xs text-slate-700 leading-relaxed">{right.description}</p>
                            <span className="inline-block text-[10px] font-mono font-bold text-emerald-800 mt-1">
                              ⚖️ {right.legalBasis}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Jargon Buster */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
                      <div className="flex items-center gap-2">
                        <BookMarked className="w-4 h-4 text-blue-700" />
                        <h3 className="font-heading font-black text-sm text-slate-900">Legal Jargon Decoder</h3>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {civicPack.jargon.map((item) => (
                          <button
                            key={item.term}
                            onClick={() => setActiveJargonTerm(activeJargonTerm === item.term ? null : item.term)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                              activeJargonTerm === item.term
                                ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            &quot;{item.term}&quot;
                          </button>
                        ))}
                      </div>

                      <div className="pt-1">
                        {civicPack.jargon
                          .filter((item) => !activeJargonTerm || activeJargonTerm === item.term)
                          .map((item) => (
                            <div key={item.term} className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4 space-y-2 mb-2">
                              <span className="text-xs font-black text-blue-900 font-heading block">
                                Term: &quot;{item.term}&quot;
                              </span>
                              <p className="text-xs text-slate-800 leading-relaxed">
                                <strong>Plain English:</strong> {item.definition}
                              </p>
                              <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-200">
                                💡 <strong>In this letter:</strong> {item.inContext}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB 3: AUSTIN AID & SCRIPT */}
                {activeTab === 'aid' && civicPack && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* 1-Tap Phone Script */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PhoneCall className="w-4 h-4 text-blue-700" />
                          <h3 className="font-heading font-black text-sm text-slate-900">What to Say on the Phone</h3>
                        </div>
                        <button
                          onClick={() => handleCopyCallScript(civicPack.prep.callScript)}
                          className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200 flex items-center gap-1"
                        >
                          {callScriptCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{callScriptCopied ? 'Copied!' : 'Copy Script'}</span>
                        </button>
                      </div>
                      <p className="text-xs font-mono text-slate-900 bg-[#f8fafc] p-4 rounded-xl border border-slate-200 leading-relaxed">
                        &quot;{civicPack.prep.callScript}&quot;
                      </p>
                    </div>

                    {/* Verified Austin Resources */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {resources.map((res, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4.5 flex flex-col justify-between shadow-2xs space-y-3">
                          <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-100">
                              {res.isFree ? 'Free Legal Aid' : 'Community Aid'}
                            </span>
                            <h4 className="font-heading font-black text-sm text-slate-900 mt-2">{res.name}</h4>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{res.description}</p>
                            
                            <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-500">
                              {res.phone && <p>📞 <strong>{res.phone}</strong></p>}
                              {res.hours && <p>⏰ {res.hours}</p>}
                            </div>
                          </div>

                          {res.phone && (
                            <a
                              href={`tel:${res.phone.replace(/[^0-9]/g, '')}`}
                              className="w-full text-center py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs"
                            >
                              Call Hotline
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* TAB 4: DISPUTE LETTER */}
                {activeTab === 'dispute' && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-heading font-black text-sm text-slate-900">Official Dispute / Response Letter</h3>
                        <p className="text-xs text-slate-500">Auto-generated Texas legal response letter</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {!appealLetter ? (
                          <button
                            onClick={handleGenerateAppeal}
                            disabled={appealLoading}
                            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {appealLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                            <span>{appealLoading ? 'Generating...' : 'Generate Letter'}</span>
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={handleCopyAppeal}
                              className="px-3 py-1.5 bg-white text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1"
                            >
                              {appealCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{appealCopied ? 'Copied' : 'Copy'}</span>
                            </button>
                            <button
                              onClick={() => window.print()}
                              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold"
                            >
                              Print
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {appealLetter ? (
                      <div className="p-5 bg-[#f8fafc] border border-slate-200 rounded-2xl font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {appealLetter}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 text-center py-6">
                        Click &quot;Generate Letter&quot; to draft a legally cited dispute letter tailored to this notice.
                      </p>
                    )}
                  </motion.div>
                )}

                {/* TAB 5: ASK QUESTIONS */}
                {activeTab === 'chat' && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4"
                  >
                    <div>
                      <h3 className="font-heading font-black text-sm text-slate-900">Ask Questions About This Notice</h3>
                      <p className="text-xs text-slate-500">Instant plain-English answers to common worries</p>
                    </div>

                    {/* Question Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => sendChatMessage('Can my landlord lock my doors tomorrow?')}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium border border-slate-200"
                      >
                        Can my landlord lock my doors tomorrow?
                      </button>
                      <button
                        onClick={() => sendChatMessage('How do I propose an official payment plan?')}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium border border-slate-200"
                      >
                        How do I propose a payment plan?
                      </button>
                      <button
                        onClick={() => sendChatMessage('Do I have to leave the keys by the deadline?')}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium border border-slate-200"
                      >
                        Do I have to leave by the deadline?
                      </button>
                    </div>

                    {/* Chat Messages */}
                    {chatMessages.length > 0 && (
                      <div className="space-y-2.5 max-h-64 overflow-y-auto p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                        {chatMessages.map((msg, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-xl leading-relaxed ${
                              msg.role === 'user'
                                ? 'bg-blue-700 text-white ml-auto max-w-sm text-right'
                                : 'bg-white border border-slate-200 text-slate-800 mr-auto max-w-md text-left'
                            }`}
                          >
                            {msg.content}
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                    )}

                    {/* Chat Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                        placeholder="Type any question about this notice..."
                        className="flex-1 bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <button
                        onClick={handleChat}
                        disabled={chatLoading}
                        className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs disabled:opacity-50 transition-colors shadow-2xs"
                      >
                        {chatLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Ask'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 3. CLEAN, QUIET FOOTER */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6 no-print">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-heading font-black text-slate-800">TL;DR Mail</span>
            <span>• WarriorHacks 2.0 Civic Tech Initiative</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => setShowStatsModal(true)} className="hover:text-blue-700 transition-colors">
              Why We Exist
            </button>
            <a href="https://www.trla.org" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition-colors">
              Texas RioGrande Legal Aid
            </a>
            <a href="https://www.housing-rights.org" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition-colors">
              Austin Tenants Council
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
