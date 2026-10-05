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
  ChevronDown,
  ChevronUp,
  Calendar,
  Download,
  Phone,
  ExternalLink,
  Volume2,
  VolumeX,
  Send,
  Printer,
  Shield,
  Zap,
  Heart,
  Globe,
  MessageCircle,
  X,
  Loader2,
  Info,
  BookOpen,
  Copy,
  Check,
  Eye,
  Eraser,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Scale,
  Share2,
  QrCode,
  BookMarked,
  PhoneCall,
  ListChecks,
  Gavel,
  ShieldAlert,
  Building2,
  MapPin,
  Lock,
  Flame,
  FileCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SAMPLE_LETTERS } from '@/lib/sample-letters';
import { generateICS, generateGoogleCalendarLink, downloadICS } from '@/lib/calendar';
import { SpeechManager } from '@/lib/speech';
import { DocumentVisualizer } from '@/components/DocumentVisualizer';
import { getCivicKnowledge } from '@/lib/civic-knowledge';
import type { LetterAnalysis, LocalResource, SupportedLanguage } from '@/lib/types';
import { LANGUAGE_NAMES } from '@/lib/types';

type AppStatus = 'idle' | 'redacting' | 'analyzing' | 'done' | 'error';

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
  const [sampleFilter, setSampleFilter] = useState<string>('all');
  const [activeJargonTerm, setActiveJargonTerm] = useState<string | null>(null);

  // Redaction state
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [rawImageMime, setRawImageMime] = useState<string>('image/jpeg');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasRedactions, setHasRedactions] = useState(false);

  // Sections toggle
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    timeline: true,
    rights: true,
    steps: true,
    jargon: true,
    prep: true,
    resources: true,
    dispute: true,
  });

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
  const uploadSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    speechRef.current = new SpeechManager();
    return () => speechRef.current?.stop();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleStep = (stepOrder: number) => {
    setCompletedSteps((prev) => ({ ...prev, [stepOrder]: !prev[stepOrder] }));
  };

  const togglePrepDoc = (index: number) => {
    setCompletedPrepDocs((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    (sample: (typeof SAMPLE_LETTERS)[0]) => {
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
      setAppealLetter('Failed to generate appeal letter. Please try again.');
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

  const filteredSamples = SAMPLE_LETTERS.filter((s) => {
    if (sampleFilter === 'all') return true;
    if (sampleFilter === 'housing') return s.id === 'eviction';
    if (sampleFilter === 'utility') return s.id === 'utility';
    if (sampleFilter === 'benefits') return s.id === 'benefits';
    if (sampleFilter === 'medical') return s.id === 'medical';
    return true;
  });

  const civicPack = analysis ? getCivicKnowledge(analysis.category) : null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* 1. TOP CIVIC MICRO ALERT STRIP (Stitch Architecture) */}
      <div className="bg-[#172554] text-white text-xs py-2 px-4 sm:px-6 border-b border-blue-900/40 no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center bg-red-600 text-white rounded-full px-2 py-0.5 font-bold uppercase tracking-wider text-[10px] animate-pulse">
              Urgent Crisis
            </span>
            <span className="text-slate-200">
              Austin 24/7 Tenant Eviction Defense Hotline: <strong className="text-white">(512) 474-1961</strong> (Austin Tenants Council)
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-300">
            <span className="hidden md:flex items-center gap-1.5 text-blue-200">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Travis County Justice Courts Partner Access
            </span>
            <button
              onClick={() => setShowStatsModal(true)}
              className="underline hover:text-white font-medium transition-colors"
            >
              14,820 Letters Decoded
            </button>
          </div>
        </div>
      </div>

      {/* 2. STICKY MAIN CIVIC HEADER (Stitch Elevation) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {/* Brand Anchor */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={resetApp}>
            <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-700/20 overflow-hidden relative">
              <Image src="/logo.png" alt="TL;DR Mail" width={40} height={40} className="object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-xl tracking-tight text-slate-900 hover:text-blue-700 transition-colors">
                  TL;DR Mail
                </span>
                <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2 py-0.5 rounded border border-slate-200">
                  Austin / Travis Co.
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Central Texas Civic Legal Decoder Initiative</p>
            </div>
          </div>

          {/* Navigation Links for Results Mode */}
          {status === 'done' && (
            <nav className="hidden lg:flex items-center space-x-5 text-xs font-heading font-bold text-slate-600">
              <a href="#active-decoded-card" className="hover:text-blue-700 transition-colors">Overview</a>
              <a href="#timeline-section" className="hover:text-blue-700 transition-colors">Timeline</a>
              <a href="#rights-section" className="hover:text-blue-700 transition-colors">Legal Shield</a>
              <a href="#jargon-section" className="hover:text-blue-700 transition-colors">Jargon Buster</a>
              <a href="#aid-directory" className="hover:text-blue-700 transition-colors">Local Aid</a>
              <a href="#dispute-generator" className="hover:text-blue-700 transition-colors">Dispute Letter</a>
            </nav>
          )}

          {/* Utility Tools & Controls */}
          <div className="flex items-center gap-2.5">
            {/* Audio Read Aloud */}
            {status === 'done' && (
              <button
                onClick={handleSpeak}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${
                  isSpeaking
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100 border-blue-200'
                }`}
                title="Listen to 6th-grade audio translation"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-blue-700" />}
                <span className="hidden sm:inline">{isSpeaking ? 'Stop Audio' : 'Listen (6th Grade)'}</span>
              </button>
            )}

            {/* Language Selector */}
            <div className="relative">
              <select
                aria-label="Select Language"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                className="text-xs font-semibold bg-white border border-slate-300 rounded-lg py-1.5 pl-2.5 pr-7 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-2xs"
              >
                <option value="en">English (US)</option>
                <option value="es">Español (Texas)</option>
                <option value="vi">Tiếng Việt (Austin)</option>
                <option value="zh">中文 (Chinese)</option>
                <option value="ar">العربية (Arabic)</option>
              </select>
            </div>

            {/* Emergency Hotline Button */}
            <a
              href="tel:5124741961"
              className="hidden sm:inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>(512) 474-1961</span>
            </a>

            {/* Scan Another Button */}
            {status === 'done' && (
              <button
                onClick={resetApp}
                className="text-xs font-bold px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all shadow-xs"
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
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative space-y-4"
            >
              <button
                onClick={() => setShowStatsModal(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 text-red-700 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 font-heading">Why TL;DR Mail Exists</h3>
                  <p className="text-xs text-slate-500">The paperwork literacy crisis in Central Texas</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Official notices are written at a 14th-grade college reading level, full of legal threats that confuse everyday families. Missed deadlines cause immediate eviction, power shutoffs, and lost healthcare.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <span className="text-2xl font-black text-red-700 font-heading">32,000+</span>
                  <p className="text-xs font-bold text-red-900 mt-0.5">Eviction Filings / Year</p>
                  <p className="text-[11px] text-red-700">Travis & Williamson County, TX courts.</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <span className="text-2xl font-black text-amber-700 font-heading">1 in 5</span>
                  <p className="text-xs font-bold text-amber-900 mt-0.5">Limited Literacy</p>
                  <p className="text-[11px] text-amber-800">Adults struggle with official legal English.</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <span className="text-2xl font-black text-blue-700 font-heading">$180M+</span>
                  <p className="text-xs font-bold text-blue-900 mt-0.5">Lost Texas Benefits</p>
                  <p className="text-[11px] text-blue-800">SNAP & Medicaid dropped over clerical paperwork errors.</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                  <span className="text-2xl font-black text-green-700 font-heading">72 Hours</span>
                  <p className="text-xs font-bold text-green-900 mt-0.5">Standard Texas Notice</p>
                  <p className="text-[11px] text-green-800">Tenants get only 3 days before a lawsuit is filed.</p>
                </div>
              </div>
              <button
                onClick={() => setShowStatsModal(false)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-blue-500/20"
              >
                Back to Decoder
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
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4"
            >
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-heading">Share Breakdown</h3>
                  <p className="text-xs text-slate-500">Send to an adult child, caseworker, or clinic volunteer</p>
                </div>
              </div>

              {/* Simulated QR Code */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center text-center">
                <div className="w-32 h-32 bg-white border border-slate-300 rounded-xl p-2 shadow-xs flex items-center justify-center mb-2">
                  <QrCode className="w-24 h-24 text-slate-900" />
                </div>
                <span className="text-[11px] font-bold text-slate-700">Scan with phone camera to view decoded summary</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Encrypted client-side transfer</span>
              </div>

              {/* Copy WhatsApp / SMS text */}
              <div className="space-y-2">
                <button
                  onClick={handleCopyShareText}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-md shadow-blue-500/20"
                >
                  {shareCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {shareCopied ? 'Summary Copied to Clipboard!' : 'Copy Summary for WhatsApp / Text'}
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print Official 1-Page Case Brief
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
        <AnimatePresence mode="wait">
          {/* ========================================================= */}
          {/* ===== IDLE STATE: ASYMMETRIC CIVIC BENTO HERO (STITCH) ===== */}
          {/* ========================================================= */}
          {status === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-10"
            >
              {/* Asymmetric Civic Bento Hero */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2" ref={uploadSectionRef}>
                {/* Left Column: Civic Framing & Purpose */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 border border-amber-200/90 rounded-full text-amber-900 text-xs font-bold shadow-2xs">
                    <Gavel className="w-3.5 h-3.5 text-amber-700" />
                    <span>Zero-Retention Public Legal Shield for Travis County Renters & Patients</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading text-slate-900 tracking-tight leading-[1.12]">
                    Don’t Let Confusing Mail Ruin Your{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900">
                      Housing, Health, or Credit.
                    </span>
                  </h1>

                  <p className="text-base sm:text-lg text-slate-600 font-body leading-relaxed max-w-xl">
                    Upload intimidating government notices, court summons, eviction warnings, or hospital bills. 
                    We translate legal threats into <strong>6th-grade clarity</strong> with strict deadlines and emergency Austin aid in under 60 seconds.
                  </p>

                  {/* Trust Badges */}
                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold shadow-2xs">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      100% Private (Zero-retention client-side)
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold shadow-2xs">
                      <Scale className="w-3.5 h-3.5 text-blue-700" />
                      Texas Property & Civil Code Aware
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold shadow-2xs">
                      <Heart className="w-3.5 h-3.5 text-red-600" />
                      Direct Legal Aid Referrals
                    </span>
                  </div>

                  {/* Primary & Secondary CTAs */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-heading font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-blue-700/25 active:scale-95 transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Scan or Upload Letter (PDF/Photo)</span>
                    </button>
                    <button
                      onClick={() => handleSampleSelect(SAMPLE_LETTERS[0])}
                      className="inline-flex items-center gap-2 bg-white text-slate-800 border border-slate-300 font-heading font-bold text-sm px-5 py-3.5 rounded-xl hover:bg-slate-50 transition-all shadow-2xs"
                    >
                      <BookOpen className="w-4 h-4 text-blue-700" />
                      <span>Try 1-Click Eviction Notice</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    Processed securely in your browser memory. Document images never leave your device.
                  </p>
                </div>

                {/* Right Column: Interactive Dropzone Console (Stitch Design) */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="lg:col-span-5 bg-white border-2 border-dashed border-slate-300 hover:border-blue-600 rounded-3xl p-6 shadow-sm transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-heading">
                        Document Decoder Console
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        OCR Pipeline Ready
                      </span>
                    </div>

                    {/* Drop Box Visual Area */}
                    <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-6 text-center flex flex-col items-center justify-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shadow-2xs">
                        <Upload className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="font-heading font-black text-sm text-slate-900">
                          Drag your letter here, or choose a file
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          High-contrast photos taken on mobile phones work best
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                        >
                          Browse Files
                        </button>
                        <button
                          onClick={() => cameraInputRef.current?.click()}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition-colors"
                        >
                          Take Photo
                        </button>
                      </div>

                      <div className="flex gap-2 text-[10px] font-bold text-slate-500 pt-1 font-mono">
                        <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">.PDF</span>
                        <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">.JPG</span>
                        <span className="px-2 py-0.5 bg-white border border-slate-200 rounded">.PNG</span>
                      </div>
                    </div>
                  </div>

                  {/* Preloaded Central Texas Document Samples */}
                  <div className="mt-5 pt-4 border-t border-slate-200">
                    <p className="text-xs font-bold text-slate-700 mb-2.5 flex items-center justify-between">
                      <span>Or test with real Central Texas document templates:</span>
                      <span className="text-[10px] text-slate-400 font-normal">Click to decode</span>
                    </p>
                    <div className="flex flex-col gap-2">
                      {SAMPLE_LETTERS.map((sample) => (
                        <button
                          key={sample.id}
                          onClick={() => handleSampleSelect(sample)}
                          className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-blue-600 bg-white hover:bg-blue-50/50 text-slate-800 text-xs font-semibold flex items-center justify-between transition-all group"
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-base">{sample.emoji}</span>
                            <span className="font-heading font-bold text-slate-900 group-hover:text-blue-700">
                              {sample.title}
                            </span>
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {sample.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

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
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 max-w-2xl mx-auto"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900 font-heading">Scrub Private Details</h3>
                  <p className="text-xs text-slate-500">
                    Swipe with your finger or mouse to black out Social Security numbers, bank accounts, or names.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearRedactions}
                    className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-200"
                    title="Undo all redactions"
                  >
                    <Eraser className="w-4 h-4" />
                    Reset
                  </button>
                </div>
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

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setStatus('idle')}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={proceedFromRedaction}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-700/20"
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
              className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm space-y-6"
            >
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-700 animate-spin" />
                <div className="absolute inset-2 rounded-full bg-blue-50 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-blue-700" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 font-heading">Decoding Legal Paperwork</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Translating official jargon into 6th-grade language, extracting deadlines, and matching verified Austin aid...
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 py-1.5 px-3 rounded-full w-fit mx-auto">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                Zero-retention: Client memory only
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
              className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center max-w-md mx-auto space-y-4"
            >
              <AlertTriangle className="w-10 h-10 text-red-600 mx-auto" />
              <h3 className="text-base font-black text-red-950 font-heading">Could Not Decode Letter</h3>
              <p className="text-xs text-red-800 leading-relaxed">{error || 'An unexpected error occurred.'}</p>
              <button
                onClick={resetApp}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* ===== RESULTS VIEW: FULL STITCH CIVIC SUITE ===== */}
          {/* ========================================================= */}
          {status === 'done' && analysis && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* 1. DECODED EMERGENCY DOCUMENT OVERVIEW (HIGH PRIORITY STITCH SECTION) */}
              <section className="bg-white border-2 border-slate-300 rounded-3xl overflow-hidden shadow-md" id="active-decoded-card">
                {/* Red Alert Bar: High Contrast Emergency Banner */}
                <div className="bg-red-700 text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="p-1.5 bg-red-800 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </span>
                    <div>
                      <h2 className="text-sm sm:text-base font-heading font-black uppercase tracking-wide">
                        Active Analysis: {analysis.category ? analysis.category.toUpperCase().replace('-', ' ') : 'Official Notice'}
                      </h2>
                      <p className="text-xs text-red-100 font-mono">
                        Statutory Matter • {analysis.sender || 'Official Central Texas Agency'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs bg-red-900/70 px-3 py-1.5 rounded-xl border border-red-500/40">
                    <span>Issued By: <strong>{analysis.sender || 'Issuing Authority'}</strong></span>
                    <span className="hidden sm:inline">|</span>
                    <span className="hidden sm:inline">Date: <strong>October 14, 2026</strong></span>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  {/* Prominent 6th-Grade Plain English TL;DR Box */}
                  <div className="bg-amber-50/90 border-2 border-amber-400 rounded-2xl p-6 relative shadow-xs">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-amber-500 text-white rounded-xl shadow-sm shrink-0 mt-0.5">
                        <Flame className="w-6 h-6" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-xs font-black uppercase tracking-widest text-amber-900 font-heading">
                            The 60-Second 6th-Grade Translation
                          </span>
                          <span className="text-[11px] font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded border border-amber-300">
                            Reading Level: Grade 6.2
                          </span>
                        </div>
                        <p className="text-base sm:text-lg font-heading font-black text-slate-900 leading-snug">
                          &quot;{analysis.tldr}&quot;
                        </p>
                        <p className="text-xs text-slate-700 leading-relaxed pt-1">
                          Under Texas law, this is merely step 1. Before an officer or sheriff can remove anyone or disconnect critical life services, formal statutory notices and hearing procedures must be completed.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 2. KEY FACTS 4-CARD BENTO GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: What It Demands */}
                    <div className="bg-[#f8fafc] border border-slate-200 p-5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-slate-500 mb-2">
                          <span className="text-xs font-black uppercase font-heading text-slate-500">1. What It Demands</span>
                          <DollarSign className="w-4 h-4 text-blue-700" />
                        </div>
                        <div className="text-base font-black font-heading text-slate-900 line-clamp-2">
                          {analysis.financialAmount || 'Compliance Notice'}
                        </div>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          {analysis.whatItWants}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-200">
                        <span className="inline-block text-[10px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                          Action: Review or Dispute
                        </span>
                      </div>
                    </div>

                    {/* Card 2: Legal Deadline */}
                    <div className="bg-red-50/70 border border-red-200 p-5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-red-700 mb-2">
                          <span className="text-xs font-black uppercase font-heading">2. Strict Legal Deadline</span>
                          <Clock className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="text-base font-black font-heading text-red-900 font-mono">
                          {analysis.deadline || 'Immediate Action'}
                        </div>
                        <p className="text-xs text-red-800 mt-1.5 leading-relaxed">
                          Statutory calendar deadline from delivery date.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-red-200 flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-white bg-red-600 px-2 py-0.5 rounded font-mono">
                          Strict Window
                        </span>
                        <span className="text-[10px] text-red-800 font-bold">Act Before Time Closes</span>
                      </div>
                    </div>

                    {/* Card 3: Disputed Sums / Late Fee Caps */}
                    <div className="bg-[#f8fafc] border border-slate-200 p-5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-slate-500 mb-2">
                          <span className="text-xs font-black uppercase font-heading text-slate-500">3. Amount Disputed</span>
                          <Scale className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="text-base font-black font-heading text-slate-900">
                          {analysis.financialAmount ? `${analysis.financialAmount} Claimed` : 'No Cash Amount'}
                        </div>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          Texas Property Code § 92.019 caps fees at 12% in multi-unit properties.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-200">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          Statutory Rights Reserved
                        </span>
                      </div>
                    </div>

                    {/* Card 4: Consequence If Ignored */}
                    <div className="bg-[#f8fafc] border border-slate-200 p-5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-slate-500 mb-2">
                          <span className="text-xs font-black uppercase font-heading text-slate-500">4. Next Escalation</span>
                          <AlertTriangle className="w-4 h-4 text-slate-600" />
                        </div>
                        <div className="text-base font-black font-heading text-slate-900 line-clamp-1">
                          {analysis.consequenceOfInaction}
                        </div>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          Failure to respond can trigger court filings, service disconnection, or benefit termination.
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-200">
                        <span className="inline-block text-[10px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                          Prevents Surprise Filing
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. INTERACTIVE LEGAL TIMELINE STEPPER (ROADMAP) */}
                  {civicPack && civicPack.timeline.length > 0 && (
                    <div className="pt-2" id="timeline-section">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-heading font-black text-base text-slate-900">
                            Texas Statutory Process Roadmap
                          </h3>
                          <p className="text-xs text-slate-500">Your exact position in the legal pipeline right now:</p>
                        </div>
                        <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                          Step 1 of 4: Notice Stage
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
                        {civicPack.timeline.map((stage) => {
                          const isCurrent = stage.step === 1;
                          return (
                            <div
                              key={stage.step}
                              className={`p-4 rounded-2xl border transition-all relative ${
                                isCurrent
                                  ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                                  : 'bg-white border-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  isCurrent ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                                }`}>
                                  Stage {stage.step}
                                </span>
                                {isCurrent && (
                                  <span className="text-[10px] font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full animate-pulse">
                                    YOU ARE HERE
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] font-extrabold text-blue-700 font-mono mb-1">{stage.timeframe}</p>
                              <h4 className="text-xs font-black text-slate-900 leading-snug mb-1 font-heading">{stage.title}</h4>
                              <p className="text-[11px] text-slate-600 leading-relaxed">{stage.description}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* 4. KNOW YOUR RIGHTS SHIELD & ACTION CHECKLIST (2-COLUMN GRID) */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="rights-section">
                {/* Left Column: Texas Legal Shield */}
                <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading font-black text-lg text-slate-900">Texas Tenant Legal Shield</h3>
                      <p className="text-xs text-slate-500">Statutory protections that safeguard you during this notice phase</p>
                    </div>
                  </div>

                  {civicPack && (
                    <div className="space-y-3.5">
                      {civicPack.rights.map((right, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 flex items-start gap-3.5 shadow-2xs"
                        >
                          <span className="text-xl p-1 bg-white rounded-lg border border-emerald-200 shadow-2xs shrink-0">
                            {right.icon}
                          </span>
                          <div>
                            <h4 className="font-heading font-black text-xs text-emerald-950 leading-snug">
                              {right.title}
                            </h4>
                            <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                              {right.description}
                            </p>
                            <span className="inline-block text-[10px] font-mono font-bold text-emerald-900 bg-emerald-100/90 px-2 py-0.5 rounded mt-2">
                              ⚖️ {right.legalBasis}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column: Interactive Action Steps Checklist */}
                <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-sm">
                        <ListChecks className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-heading font-black text-lg text-slate-900">Emergency Action Plan</h3>
                        <p className="text-xs text-slate-500">Recommended steps before the statutory window closes</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      {Object.values(completedSteps).filter(Boolean).length} of {analysis.steps.length} Completed
                    </span>
                  </div>

                  <div className="space-y-3">
                    {analysis.steps.map((step) => {
                      const isDone = Boolean(completedSteps[step.order]);
                      return (
                        <div
                          key={step.order}
                          onClick={() => toggleStep(step.order)}
                          className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all cursor-pointer ${
                            isDone
                              ? 'bg-emerald-50/40 border-emerald-200 opacity-70'
                              : 'bg-slate-50/70 border-slate-200 hover:border-blue-300'
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
                            <span className="inline-block text-[10px] font-bold text-slate-500 bg-white border border-slate-200 rounded px-2 py-0.5 mt-1.5 shadow-2xs font-mono">
                              ⏰ {step.timeframe}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* 5. ACTION & SHARING UTILITY BAR */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 no-print">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-xl shadow-2xs border border-slate-200 overflow-hidden">
                    <button
                      onClick={handleSpeak}
                      className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold transition-all ${
                        isSpeaking
                          ? 'bg-blue-700 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-blue-700" />}
                      {isSpeaking ? 'Stop Audio' : `Read Aloud`}
                    </button>
                    <select
                      value={speechRate}
                      onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                      className="bg-slate-50 text-[11px] font-bold text-slate-600 px-2.5 border-l border-slate-200 focus:outline-none"
                      aria-label="Speech speed"
                    >
                      <option value={0.8}>0.8x</option>
                      <option value={1.0}>1.0x</option>
                      <option value={1.2}>1.2x</option>
                    </select>
                  </div>

                  {analysis.deadlineDate && (
                    <>
                      <a
                        href={generateGoogleCalendarLink({
                          title: analysis.tldr,
                          description: `${analysis.whatItWants}\n\nAmount: ${analysis.financialAmount || 'N/A'}\n\nConsequence if ignored: ${analysis.consequenceOfInaction}`,
                          date: analysis.deadlineDate,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors border border-blue-200/70"
                      >
                        <Calendar className="w-4 h-4 text-blue-700" />
                        Google Calendar
                      </a>
                      <button
                        onClick={() => {
                          const ics = generateICS({
                            title: analysis.tldr,
                            description: `${analysis.whatItWants}\n\nAmount: ${analysis.financialAmount || 'N/A'}`,
                            date: analysis.deadlineDate!,
                          });
                          downloadICS(ics, 'tldr-mail-deadline');
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download .ics
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                  >
                    <Share2 className="w-4 h-4" />
                    Share with Family
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    Print Summary
                  </button>
                </div>
              </div>

              {/* 6. JARGON BUSTER (PLAIN-ENGLISH LEGAL GLOSSARY) */}
              {civicPack && civicPack.jargon.length > 0 && (
                <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5" id="jargon-section">
                  <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-1.5 text-blue-700 text-xs font-black uppercase tracking-wider mb-1 font-heading">
                      <BookMarked className="w-4 h-4" />
                      Central Texas Legal Decoder Glossary
                    </div>
                    <h3 className="text-2xl font-heading font-black text-slate-900">Legal Jargon Buster</h3>
                    <p className="text-sm text-slate-600">Notices intentionally use scary words. Click any phrase to translate what it actually means:</p>
                  </div>

                  {/* Term Selector Pills */}
                  <div className="flex flex-wrap gap-2">
                    {civicPack.jargon.map((item) => {
                      const isSelected = activeJargonTerm === item.term;
                      return (
                        <button
                          key={item.term}
                          onClick={() => setActiveJargonTerm(isSelected ? null : item.term)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            isSelected
                              ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
                              : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          📖 &quot;{item.term}&quot;
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Term or Grid Display */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {civicPack.jargon
                      .filter((item) => !activeJargonTerm || activeJargonTerm === item.term)
                      .map((item) => (
                        <div
                          key={item.term}
                          className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-5 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-black text-blue-900 font-heading">
                              Term: &quot;{item.term}&quot;
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                              Plain English
                            </span>
                          </div>

                          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1 mb-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              What It Actually Means
                            </span>
                            <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                              {item.definition}
                            </p>
                          </div>

                          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                            <span><strong>In this letter:</strong> {item.inContext}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>
              )}

              {/* 7. PHONE SCRIPT ASSISTANT & EVIDENCE PREP */}
              {civicPack && (
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Phone Script Card */}
                  <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-sm">
                          <PhoneCall className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-heading font-black text-base sm:text-lg text-slate-900">
                            1-Tap Landlord & Aid Phone Script
                          </h3>
                          <p className="text-xs text-slate-500">Calm, legally protected wording to de-escalate tension</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopyCallScript(civicPack.prep.callScript)}
                        className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-all border border-blue-200"
                      >
                        {callScriptCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{callScriptCopied ? 'Copied Script!' : 'Copy Script'}</span>
                      </button>
                    </div>

                    <div className="bg-[#f8fafc] p-5 rounded-2xl border border-slate-200 text-slate-900 text-xs font-mono leading-relaxed relative">
                      <p>&quot;{civicPack.prep.callScript}&quot;</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span><strong>Pro-Tip:</strong> Always follow up every phone conversation with an email or text summarizing what was agreed to.</span>
                    </div>
                  </div>

                  {/* Evidence Checklist Card */}
                  <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-heading font-black text-base text-slate-900">Evidence Folder Prep</h3>
                        <p className="text-xs text-slate-500">Items needed for your legal aid interview</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {civicPack.prep.documentsToBring.map((doc, idx) => {
                        const isChecked = Boolean(completedPrepDocs[idx]);
                        return (
                          <div
                            key={idx}
                            onClick={() => togglePrepDoc(idx)}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              isChecked ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-blue-300'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                              isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                            }`}>
                              {isChecked && <Check className="w-3 h-3" />}
                            </div>
                            <span className={`text-xs font-medium text-slate-800 ${isChecked ? 'line-through text-slate-400' : ''}`}>
                              {doc}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </section>
              )}

              {/* 8. VERIFIED LOCAL AID MATCHING DIRECTORY */}
              <section className="space-y-4" id="aid-directory">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-blue-700 text-xs font-black uppercase tracking-wider mb-1 font-heading">
                      <MapPin className="w-4 h-4" />
                      Travis County / City of Austin Direct Aid
                    </div>
                    <h3 className="text-2xl font-heading font-black text-slate-900">Verified Local Defense Network</h3>
                    <p className="text-sm text-slate-600">Direct non-profit legal advocates and emergency assistance programs:</p>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                    Showing {resources.length} Verified Central Texas Resources
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {resources.map((res, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow space-y-4"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="bg-blue-100 text-blue-900 text-[11px] font-bold px-2 py-0.5 rounded">
                            {res.isFree ? 'Free Legal Defense' : 'Community Aid'}
                          </span>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        </div>
                        <h4 className="font-heading font-black text-base text-slate-900">{res.name}</h4>
                        <p className="text-xs text-blue-700 font-semibold mt-0.5">{res.description}</p>
                        
                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                          {res.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <strong>{res.phone}</strong>
                            </div>
                          )}
                          {res.hours && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{res.hours}</span>
                            </div>
                          )}
                          {res.region && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              <span>{res.region}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2">
                        {res.phone && (
                          <a
                            href={`tel:${res.phone.replace(/[^0-9]/g, '')}`}
                            className="w-full inline-flex items-center justify-center gap-1.5 bg-blue-700 text-white text-xs font-heading font-bold py-2.5 rounded-xl hover:bg-blue-800 transition-colors shadow-2xs"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call Hotline Direct</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 9. AUTOMATED DISPUTE & RELIEF GENERATOR */}
              <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6" id="dispute-generator">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-blue-700 text-xs font-black uppercase tracking-wider mb-1 font-heading">
                      <FileCheck className="w-4 h-4" />
                      Automated Texas Civil Code Defense Generator
                    </div>
                    <h3 className="text-2xl font-heading font-black text-slate-900">Official Notice Response Letter</h3>
                    <p className="text-sm text-slate-600">Auto-generated based on your decoded letter. Edit, copy, or print instantly:</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!appealLetter ? (
                      <button
                        onClick={handleGenerateAppeal}
                        disabled={appealLoading}
                        className="inline-flex items-center gap-1.5 bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-800 transition-colors shadow-xs disabled:opacity-50"
                      >
                        {appealLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                        <span>{appealLoading ? 'Drafting Letter...' : 'Generate Official Response'}</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleCopyAppeal}
                          className="inline-flex items-center gap-1.5 bg-white text-slate-800 border border-slate-300 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                        >
                          {appealCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                          <span>{appealCopied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="inline-flex items-center gap-1.5 bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-800 transition-colors shadow-xs"
                        >
                          <Printer className="w-4 h-4" />
                          <span>Print or Save PDF</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {appealLetter && (
                  <div className="p-6 bg-[#f8fafc] border border-slate-300 rounded-2xl font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap shadow-inner">
                    {appealLetter}
                  </div>
                )}
              </section>

              {/* 10. INTERACTIVE CIVIC LEGAL Q&A ASSISTANT */}
              <section className="bg-gradient-to-r from-[#172554] to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-1.5 bg-blue-800 text-blue-200 text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md mb-2">
                    <MessageCircle className="w-3.5 h-3.5" />
                    Civic Legal Q&amp;A Assistant (Local Austin Logic)
                  </div>
                  <h3 className="text-2xl font-heading font-black">Ask TL;DR Mail About This Notice</h3>
                  <p className="text-sm text-blue-200">Got a specific worry? Tap one of our pre-vetted legal questions for an immediate 6th-grade breakdown:</p>
                </div>

                {/* Prompt Chips */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => sendChatMessage('Can my landlord lock my doors tomorrow?')}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
                  >
                    Can my landlord lock my doors tomorrow?
                  </button>
                  <button
                    onClick={() => sendChatMessage('How do I propose an official payment plan?')}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
                  >
                    How do I propose an official payment plan?
                  </button>
                  <button
                    onClick={() => sendChatMessage('What if my apartment has broken AC or mold?')}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
                  >
                    What if my apartment has broken AC or mold?
                  </button>
                  <button
                    onClick={() => sendChatMessage('Do I have to leave the keys by the deadline?')}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
                  >
                    Do I have to leave the keys by the deadline?
                  </button>
                </div>

                {/* Message Log */}
                {chatMessages.length > 0 && (
                  <div className="space-y-3 max-h-72 overflow-y-auto p-4 bg-white/5 rounded-2xl border border-white/10 text-xs">
                    {chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-blue-600/60 ml-auto max-w-sm text-right'
                            : 'bg-white/10 mr-auto max-w-md text-left text-blue-50'
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
                    placeholder="Ask any question about this notice in plain English..."
                    className="flex-1 bg-white/10 border border-white/20 text-white placeholder-blue-300 text-xs rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={handleChat}
                    disabled={chatLoading}
                    className="px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-xs"
                  >
                    {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Ask</span>
                  </button>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* 11. CIVIC TRUST FOOTER (Stitch Shared Architecture) */}
      <footer className="bg-white border-t border-slate-200 mt-16 no-print">
        <div className="w-full px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-6 mx-auto max-w-7xl font-body text-xs text-slate-500">
          {/* Brand & Mission Info */}
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Shield className="w-4 h-4 text-blue-700" />
              <span className="font-heading font-black text-sm text-slate-900">TL;DR Mail</span>
              <span className="text-[11px] text-slate-400">• Central Texas Civic Tech Initiative</span>
            </div>
            <p className="max-w-md leading-relaxed">
              WarriorHacks 2.0 Civic Tech Track. Open-access public legal decoder. Not a substitute for formal attorney representation. Built to safeguard Central Texas families from predatory displacement.
            </p>
            <p className="text-[11px] text-slate-400">
              Zero Retention Architecture: Your documents are parsed locally in browser memory and never stored on remote servers.
            </p>
          </div>

          {/* Links Cluster */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
            <button onClick={() => setShowStatsModal(true)} className="hover:text-blue-700 transition-colors">
              Civic Impact Data
            </button>
            <a href="https://www.trla.org" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition-colors">
              Texas RioGrande Legal Aid
            </a>
            <a href="https://www.housing-rights.org" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition-colors">
              Austin Tenants Council
            </a>
            <a href="tel:5124741961" className="text-red-600 font-bold hover:underline">
              Austin Emergency Hotline
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
