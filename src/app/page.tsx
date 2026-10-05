'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SAMPLE_LETTERS } from '@/lib/sample-letters';
import { generateICS, generateGoogleCalendarLink, downloadICS } from '@/lib/calendar';
import { SpeechManager } from '@/lib/speech';
import { DocumentVisualizer } from '@/components/DocumentVisualizer';
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
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.0);

  // Redaction state
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [rawImageMime, setRawImageMime] = useState<string>('image/jpeg');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasRedactions, setHasRedactions] = useState(false);

  // Sections toggle
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    steps: true,
    resources: true,
    facts: true,
  });

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
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

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleStep = (stepOrder: number) => {
    setCompletedSteps((prev) => ({ ...prev, [stepOrder]: !prev[stepOrder] }));
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
      const img = new Image();
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
    const img = new Image();
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

  const resetApp = () => {
    setStatus('idle');
    setAnalysis(null);
    setResources([]);
    setError(null);
    setLetterContext('');
    setChatMessages([]);
    setAppealLetter(null);
    setCompletedSteps({});
    setRawImageSrc(null);
    setHasRedactions(false);
    setViewingDocId(null);
    speechRef.current?.stop();
    setIsSpeaking(false);
  };

  const urgencyConfig = {
    critical: {
      color: 'bg-red-50 border-red-200 text-red-700',
      icon: AlertTriangle,
      label: 'URGENT — Action Required Immediately',
    },
    'action-required': {
      color: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: Clock,
      label: 'Action Required — Deadline Approaching',
    },
    informational: {
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: Info,
      label: 'Informational Notice',
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm no-print">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={resetApp}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">TL;DR Mail</h1>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">v2.0</span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Decode confusing official mail at a 6th-grade reading level</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStatsModal(true)}
              className="text-xs font-semibold px-2.5 py-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1 transition-colors"
              title="Community Impact Stats"
            >
              <Heart className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Why This Matters</span>
            </button>

            {/* Language Selector */}
            <div className="relative flex items-center">
              <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2 pointer-events-none" />
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                className="text-xs font-medium border border-slate-200 rounded-lg pl-7 pr-3 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
                aria-label="Select language"
              >
                {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {status === 'done' && (
              <button
                onClick={resetApp}
                className="text-xs font-medium px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors shadow-sm"
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
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowStatsModal(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Why TL;DR Mail Exists</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Official notices are written at a college reading level, full of legal jargon that confuses everyday families. Missed deadlines cause catastrophic harm.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <span className="text-xl font-black text-red-700">32,000+</span>
                  <p className="text-xs font-bold text-red-900 mt-0.5">Eviction Filings / Year</p>
                  <p className="text-[11px] text-red-700">In Travis & Williamson County, TX alone.</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <span className="text-xl font-black text-amber-700">1 in 5</span>
                  <p className="text-xs font-bold text-amber-900 mt-0.5">Limited Literacy</p>
                  <p className="text-[11px] text-amber-800">Adults struggle with bureaucratic and legal English.</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <span className="text-xl font-black text-blue-700">$180 Million+</span>
                  <p className="text-xs font-bold text-blue-900 mt-0.5">Lost Benefits</p>
                  <p className="text-[11px] text-blue-800">Texas SNAP/Medicaid dropped due to procedural form errors.</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <span className="text-xl font-black text-green-700">3 Days</span>
                  <p className="text-xs font-bold text-green-900 mt-0.5">Standard Texas Notice</p>
                  <p className="text-[11px] text-green-800">Tenants often have only 72 hours before a lawsuit is filed.</p>
                </div>
              </div>
              <button
                onClick={() => setShowStatsModal(false)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-xs transition-colors"
              >
                Got It — Back to App
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Document Facsimile Modal */}
      {viewingDocId && (
        <DocumentVisualizer letterId={viewingDocId} onClose={() => setViewingDocId(null)} />
      )}

      <main className="max-w-4xl mx-auto px-4 py-6 flex-1 w-full">
        <AnimatePresence mode="wait">
          {/* ===== IDLE STATE ===== */}
          {status === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Hero Banner */}
              <div className="text-center pt-4 pb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  WarriorHacks 2.0 Civic Tech Innovation
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                  Don&apos;t Let Confusing Mail Ruin Your Life.
                </h2>
                <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto">
                  Snap a photo of an eviction notice, utility shutoff, hospital bill, or benefits form. Get an instant 6th-grade summary, deadline reminders, and free local legal aid.
                </p>
              </div>

              {/* Upload Zone & Actions */}
              <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-6 sm:p-10 text-center hover:border-blue-500 hover:bg-blue-50/40 transition-all cursor-pointer group shadow-sm"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              >
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7 text-blue-600" />
                </div>
                <p className="text-slate-900 font-bold text-base mb-1">Upload or Drag & Drop Your Letter Photo</p>
                <p className="text-slate-500 text-xs mb-4">Supports phone photos, camera scans, PNG, JPG, or PDF</p>
                
                <div className="flex flex-wrap justify-center gap-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    Snap with Camera
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Browse Files
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Judge / Demo Mailbox */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900">Try a Real Sample Letter (1-Click Demo)</h3>
                  </div>
                  <span className="text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">Judges: Test Instant Analysis</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {SAMPLE_LETTERS.map((sample) => (
                    <div
                      key={sample.id}
                      className="flex flex-col justify-between p-3.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-400 rounded-xl transition-all group text-left"
                    >
                      <button
                        onClick={() => handleSampleSelect(sample)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xl">{sample.emoji}</span>
                          <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 leading-tight">
                            {sample.title}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 line-clamp-2">{sample.description}</span>
                      </button>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/60">
                        <button
                          onClick={() => setViewingDocId(sample.id)}
                          className="text-[10px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Doc View
                        </button>
                        <button
                          onClick={() => handleSampleSelect(sample)}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-white border border-blue-200 rounded px-2 py-0.5 shadow-xs"
                        >
                          Decode →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Features Triad */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Zero Storage Privacy</h4>
                    <p className="text-[11px] text-slate-500">Processed in-memory. Personal mail is never permanently saved.</p>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">5 Languages + Audio</h4>
                    <p className="text-[11px] text-slate-500">English, Spanish, Vietnamese, Chinese & Arabic with voice read-aloud.</p>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Austin & Texas Resources</h4>
                    <p className="text-[11px] text-slate-500">Auto-matched free legal aid (TRLA), energy assistance & 2-1-1.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== REDACTION STATE ===== */}
          {status === 'redacting' && (
            <motion.div
              key="redacting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Privacy Shield: Redact Sensitive Info</h3>
                    <p className="text-xs text-slate-500">Draw with your finger or mouse over SSNs, bank accounts, or names you wish to blackout</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Client-Side Only</span>
              </div>

              <div className="flex justify-center bg-slate-100 rounded-xl p-2 overflow-auto max-h-[60vh]">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDraw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onMouseMove={draw}
                  onTouchStart={startDraw}
                  onTouchEnd={stopDraw}
                  onTouchMove={draw}
                  className="border border-slate-300 rounded shadow-sm cursor-crosshair touch-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={clearRedactions}
                  disabled={!hasRedactions}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 disabled:opacity-40 transition-colors"
                >
                  <Eraser className="w-4 h-4" />
                  Clear Redactions
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetApp}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={proceedFromRedaction}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20"
                  >
                    <Check className="w-4 h-4" />
                    Analyze Letter Now
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== ANALYZING STATE ===== */}
          {status === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-4"
            >
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-100 rounded-full" />
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute inset-0" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-lg font-bold text-slate-900">Decoding your letter...</p>
                <p className="text-xs text-slate-500">Extracting deadlines, financial balances, consequences, and legal rights</p>
                <span className="inline-block text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full mt-2">
                  Simplifying to 6th-grade reading level ({LANGUAGE_NAMES[language]})
                </span>
              </div>
            </motion.div>
          )}

          {/* ===== ERROR STATE ===== */}
          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8"
            >
              <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-3" />
              <p className="text-lg font-bold text-slate-900 mb-1">Could Not Complete Analysis</p>
              <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">{error}</p>
              <button
                onClick={resetApp}
                className="px-5 py-2.5 bg-blue-600 text-white font-medium text-xs rounded-xl hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}

          {/* ===== RESULTS STATE ===== */}
          {status === 'done' && analysis && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* High Stakes Urgent Warning */}
              {analysis.isHighStakes && (
                <motion.div
                  initial={{ scale: 0.98 }}
                  animate={{ scale: 1 }}
                  className="bg-red-50 border-2 border-red-300 rounded-2xl p-4.5 flex items-start gap-3.5 shadow-sm"
                >
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold text-red-800 text-sm">⚠️ High Stakes Notice Detected</p>
                      <span className="text-[10px] bg-red-200 text-red-900 font-bold px-2 py-0.5 rounded-full">Immediate Action</span>
                    </div>
                    <p className="text-xs text-red-700 mt-1 leading-relaxed">
                      This letter involves active legal timelines that could affect your housing, benefits, or credit. 
                      Do not ignore this letter. Contact the free community assistance organizations listed below today.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Primary TL;DR Card */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                {/* Triage Urgency Header */}
                <div
                  className={`px-5 py-3 border-b flex items-center justify-between ${urgencyConfig[analysis.urgency]?.color || 'bg-slate-50 text-slate-700'}`}
                >
                  <div className="flex items-center gap-2">
                    {(() => {
                      const UrgIcon = urgencyConfig[analysis.urgency]?.icon || Info;
                      return <UrgIcon className="w-4 h-4" />;
                    })()}
                    <span className="text-xs font-black uppercase tracking-wider">
                      {urgencyConfig[analysis.urgency]?.label}
                    </span>
                  </div>
                  {analysis.sender && (
                    <span className="text-xs font-semibold opacity-90 truncate max-w-[200px] sm:max-w-xs">
                      From: {analysis.sender}
                    </span>
                  )}
                </div>

                <div className="p-6">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-[260px]">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">Plain Language TL;DR</span>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                        {analysis.tldr}
                      </h2>
                    </div>
                    <button
                      onClick={() => {
                        if (analysis.category === 'eviction') setViewingDocId('eviction');
                        else if (analysis.category === 'utility-shutoff') setViewingDocId('utility');
                        else if (analysis.category === 'benefits-denial') setViewingDocId('benefits');
                        else if (analysis.category === 'medical-bill') setViewingDocId('medical');
                        else setViewingDocId('eviction');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex-shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      View Original Letter Facsimile
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                      <p className="text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        What It Wants From You
                      </p>
                      <p className="text-xs font-semibold text-slate-900 leading-relaxed">{analysis.whatItWants}</p>
                    </div>

                    {analysis.deadline && (
                      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
                        <p className="text-xs font-bold text-amber-800 mb-1 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Strict Deadline
                        </p>
                        <p className="text-xs font-extrabold text-amber-950 leading-relaxed">{analysis.deadline}</p>
                      </div>
                    )}

                    {analysis.financialAmount && (
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                        <p className="text-xs font-bold text-slate-600 mb-1 flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          Amount Owed / Disputed
                        </p>
                        <p className="text-base font-black text-slate-900">{analysis.financialAmount}</p>
                      </div>
                    )}

                    <div className="bg-red-50/60 border border-red-200 rounded-xl p-4">
                      <p className="text-xs font-bold text-red-800 mb-1 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                        If You Do Nothing
                      </p>
                      <p className="text-xs font-medium text-red-900 leading-relaxed">{analysis.consequenceOfInaction}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar (Audio Read-Aloud + Speed + Calendar Sync + Print) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 no-print">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-xl shadow-xs border border-slate-200 overflow-hidden">
                    <button
                      onClick={handleSpeak}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all ${
                        isSpeaking
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-blue-600" />}
                      {isSpeaking ? 'Stop Audio' : `Read Aloud`}
                    </button>
                    <select
                      value={speechRate}
                      onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                      className="bg-slate-50 text-[11px] font-bold text-slate-600 px-2 border-l border-slate-200 focus:outline-none"
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
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-blue-600" />
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

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print 1-Page Summary
                </button>
              </div>

              {/* Action Checklist */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => toggleSection('steps')}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center font-bold text-xs">
                      {Object.values(completedSteps).filter(Boolean).length}/{analysis.steps.length}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Your Action Steps</h3>
                      <p className="text-[11px] text-slate-500">Tap checkboxes as you complete each task</p>
                    </div>
                  </div>
                  {expandedSections.steps ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {expandedSections.steps && (
                  <div className="px-5 pb-5 space-y-2.5 border-t border-slate-100 pt-3">
                    {analysis.steps.map((step) => {
                      const isDone = Boolean(completedSteps[step.order]);
                      return (
                        <div
                          key={step.order}
                          onClick={() => toggleStep(step.order)}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
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
                            <p className={`text-xs font-semibold text-slate-900 leading-snug ${isDone ? 'line-through text-slate-500' : ''}`}>
                              {step.action}
                            </p>
                            <span className="inline-block text-[10px] font-bold text-slate-500 bg-white border border-slate-200 rounded px-1.5 py-0.5 mt-1">
                              ⏰ {step.timeframe}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Key Facts & Document Data */}
              {analysis.keyFacts && analysis.keyFacts.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => toggleSection('facts')}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-600" />
                      <h3 className="font-bold text-sm text-slate-900">Extracted Facts & Reference Numbers</h3>
                    </div>
                    {expandedSections.facts ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {expandedSections.facts && (
                    <div className="px-5 pb-5 border-t border-slate-100 pt-3">
                      <ul className="space-y-2">
                        {analysis.keyFacts.map((fact, i) => (
                          <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                            {fact}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Auto-Generated Appeal & Dispute Letter Generator */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Auto-Drafted Response & Dispute Letter</h3>
                      <p className="text-[11px] text-slate-500">Formally cite rights, request a payment plan, or appeal a denial</p>
                    </div>
                  </div>
                </div>

                {!appealLetter ? (
                  <button
                    onClick={handleGenerateAppeal}
                    disabled={appealLoading}
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {appealLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {appealLoading ? 'Drafting Official Response Letter...' : 'Generate Official Response / Dispute Letter'}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-800 whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed">
                      {appealLetter}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopyAppeal}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                      >
                        {appealCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {appealCopied ? 'Copied to Clipboard!' : 'Copy Letter'}
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print Letter
                      </button>
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-slate-400">
                  ⚖️ Provided as a starting draft template. Review all details before submitting.
                </p>
              </div>

              {/* Free Local Resources (Austin & Texas Aid) */}
              {resources.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => toggleSection('resources')}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-600" />
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">
                          Matched Free Local Help ({resources.length})
                        </h3>
                        <p className="text-[11px] text-slate-500">Austin, Travis County & Texas Statewide Legal & Financial Assistance</p>
                      </div>
                    </div>
                    {expandedSections.resources ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {expandedSections.resources && (
                    <div className="px-5 pb-5 space-y-3 border-t border-slate-100 pt-3">
                      {resources.map((resource, i) => (
                        <div
                          key={i}
                          className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors bg-slate-50/50"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{resource.name}</h4>
                                {resource.isFree && (
                                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                    FREE
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{resource.description}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <a
                              href={`tel:${resource.phone}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              {resource.phone}
                            </a>
                            <a
                              href={resource.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Visit Website
                            </a>
                            <span className="text-[10px] text-slate-400 ml-auto">
                              📍 {resource.region} · 🕐 {resource.hours}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Floating Chat Trigger Button */}
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className="fixed bottom-6 right-6 h-13 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl flex items-center gap-2 transition-all z-50 no-print"
                aria-label="Ask about this letter"
              >
                {chatOpen ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
                <span className="text-xs font-bold">{chatOpen ? 'Close Chat' : 'Ask Question About Letter'}</span>
              </button>

              {/* Chat Panel with Quick Prompt Chips */}
              <AnimatePresence>
                {chatOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.96 }}
                    className="fixed bottom-22 right-6 w-[calc(100%-3rem)] sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 flex flex-col max-h-[65vh] no-print overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-blue-400" />
                        <div>
                          <h4 className="font-bold text-xs">Letter Assistant</h4>
                          <p className="text-[10px] text-slate-400">Ask any questions about this specific document</p>
                        </div>
                      </div>
                      <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick Question Chips */}
                    <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex flex-wrap gap-1.5">
                      {[
                        'Can they lock me out tomorrow?',
                        'How do I request a payment plan?',
                        'Will this affect my credit score?',
                        'What should I bring to legal aid?',
                      ].map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendChatMessage(prompt)}
                          disabled={chatLoading}
                          className="text-[10px] bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-600 px-2 py-1 rounded-md border border-slate-200 font-medium transition-colors text-left"
                        >
                          💬 {prompt}
                        </button>
                      ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
                      {chatMessages.length === 0 && (
                        <div className="text-center py-6 text-slate-400 text-xs">
                          <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="font-medium">What would you like to know?</p>
                          <p className="text-[11px] mt-1 text-slate-400">
                            Tap one of the quick questions above or type your own below.
                          </p>
                        </div>
                      )}
                      {chatMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] px-3.5 py-2 rounded-xl text-xs leading-relaxed ${
                              msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : 'bg-slate-100 text-slate-800 rounded-bl-none'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-slate-100 px-3 py-2 rounded-xl">
                            <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <div className="p-3 border-t border-slate-200 bg-slate-50 flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                        placeholder="Ask anything about this letter..."
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <button
                        onClick={handleChat}
                        disabled={chatLoading || !chatInput.trim()}
                        className="px-3.5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto no-print">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-slate-600 text-xs font-semibold">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Strict Privacy Guaranteed: Images Processed In-Memory, Never Permanently Stored</span>
          </div>
          <p className="text-[11px] text-slate-400 max-w-lg mx-auto">
            TL;DR Mail is an AI literacy assistance tool created for WarriorHacks 2.0 (Westwood CS Club, Austin, Texas). It provides informational summaries and does not constitute formal legal representation.
          </p>
        </div>
      </footer>
    </div>
  );
}
