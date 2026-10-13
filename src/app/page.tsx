'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  ListChecks,
  Gavel,
  HeartHandshake,
  MessageCircle,
  Loader2,
  AlertTriangle,
  Key,
  X,
} from 'lucide-react';

import { HeaderNav } from '@/components/HeaderNav';
import { HeroUploadZone } from '@/components/HeroUploadZone';
import { RedactionStudio } from '@/components/RedactionStudio';
import { CameraViewfinder } from '@/components/CameraViewfinder';
import { TriageHero } from '@/components/TriageHero';
import { KeyFactsBento } from '@/components/KeyFactsBento';
import { DocumentSpotlight } from '@/components/DocumentSpotlight';
import { ActionRoadmap } from '@/components/ActionRoadmap';
import { DisputeStudio } from '@/components/DisputeStudio';
import { AidDirectory } from '@/components/AidDirectory';
import { CivicChatDrawer, ChatMessage } from '@/components/CivicChatDrawer';
import { AudioPlayerHUD } from '@/components/AudioPlayerHUD';
import { DocumentVisualizer } from '@/components/DocumentVisualizer';

import { SAMPLE_LETTERS, SampleLetter } from '@/lib/sample-letters';
import { SpeechManager } from '@/lib/speech';
import type { LetterAnalysis, LocalResource, SupportedLanguage } from '@/lib/types';
import { LANGUAGE_NAMES } from '@/lib/types';

type AppStatus = 'idle' | 'redacting' | 'analyzing' | 'done' | 'error';
type ResultTab = 'spotlight' | 'steps' | 'dispute' | 'aid' | 'chat';

export default function Home() {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [analysis, setAnalysis] = useState<LetterAnalysis | null>(null);
  const [resources, setResources] = useState<LocalResource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [activeTab, setActiveTab] = useState<ResultTab>('steps');
  const [letterContext, setLetterContext] = useState<string>('');

  // Interactive Checklist states
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [completedPrepDocs, setCompletedPrepDocs] = useState<Record<number, boolean>>({});

  // Modals & Viewfinder
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [viewingDocId, setViewingDocId] = useState<string | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [tempKeyInput, setTempKeyInput] = useState<string>('');

  // Redaction Canvas state
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [rawImageMime, setRawImageMime] = useState<string>('image/jpeg');

  // Speech TTS state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const speechRef = useRef<SpeechManager | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Dispute letter state
  const [appealLetter, setAppealLetter] = useState<string | null>(null);
  const [appealLoading, setAppealLoading] = useState(false);

  useEffect(() => {
    speechRef.current = new SpeechManager();
    return () => speechRef.current?.stop();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tldr_gemini_api_key');
      if (saved) {
        queueMicrotask(() => {
          setCustomApiKey(saved);
          setTempKeyInput(saved);
        });
      }
    }
  }, []);

  const saveApiKey = useCallback((key: string) => {
    const trimmed = key.trim();
    setCustomApiKey(trimmed);
    if (typeof window !== 'undefined') {
      if (trimmed) {
        localStorage.setItem('tldr_gemini_api_key', trimmed);
      } else {
        localStorage.removeItem('tldr_gemini_api_key');
      }
    }
    setShowKeyModal(false);
  }, []);

  const analyzeImage = useCallback(
    async (imageBase64: string, mimeType: string, targetLang?: SupportedLanguage, explicitKey?: string) => {
      setStatus('analyzing');
      setError(null);
      const activeLang = targetLang || language;
      const keyToUse = explicitKey !== undefined ? explicitKey : customApiKey;

      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (keyToUse) {
          headers['x-gemini-api-key'] = keyToUse;
        }

        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers,
          body: JSON.stringify({ imageBase64, mimeType, language: LANGUAGE_NAMES[activeLang] }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Analysis failed');

        setAnalysis(data.analysis);
        setResources(data.resources || []);

        const synthContext = [
          `Sender: ${data.analysis.sender}`,
          `Category: ${data.analysis.category}`,
          `Summary: ${data.analysis.tldr}`,
          `What it wants: ${data.analysis.whatItWants}`,
          data.analysis.deadline ? `Deadline: ${data.analysis.deadline}` : '',
          data.analysis.financialAmount ? `Amount Due: ${data.analysis.financialAmount}` : '',
          `Consequences: ${data.analysis.consequenceOfInaction}`,
          `Key Facts: ${(data.analysis.keyFacts || []).join('; ')}`,
        ]
          .filter(Boolean)
          .join('\n');
        setLetterContext(synthContext);

        setActiveTab('steps');
        setStatus('done');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        setStatus('error');
      }
    },
    [language, customApiKey]
  );

  const analyzeText = useCallback(
    async (textContent: string, targetLang?: SupportedLanguage, explicitKey?: string) => {
      setStatus('analyzing');
      setError(null);
      setLetterContext(textContent);
      const activeLang = targetLang || language;
      const keyToUse = explicitKey !== undefined ? explicitKey : customApiKey;

      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (keyToUse) {
          headers['x-gemini-api-key'] = keyToUse;
        }

        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers,
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
    [language, customApiKey]
  );

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    if (status === 'done' && letterContext) {
      analyzeText(letterContext, newLang);
    }
  };

  const handleFileProcess = useCallback(
    (file: File) => {
      setIsCameraOpen(false);
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        if (isPdf) {
          const base64 = dataUrl.split(',')[1];
          analyzeImage(base64, 'application/pdf');
        } else {
          setRawImageSrc(dataUrl);
          setRawImageMime(file.type || 'image/jpeg');
          setStatus('redacting');
        }
      };
      reader.readAsDataURL(file);
    },
    [analyzeImage]
  );

  const handleSampleSelect = useCallback(
    (sample: SampleLetter) => {
      setLetterContext(sample.textContent);
      setViewingDocId(sample.id);
      analyzeText(sample.textContent);
    },
    [analyzeText]
  );

  const resetApp = () => {
    if (speechRef.current && isSpeaking) {
      speechRef.current.stop();
      setIsSpeaking(false);
    }
    setStatus('idle');
    setAnalysis(null);
    setResources([]);
    setError(null);
    setLetterContext('');
    setCompletedSteps({});
    setCompletedPrepDocs({});
    setRawImageSrc(null);
    setChatMessages([]);
    setAppealLetter(null);
    setViewingDocId(null);
  };

  const handleToggleSpeak = useCallback(() => {
    if (!analysis || !speechRef.current) return;
    if (isSpeaking) {
      speechRef.current.stop();
      setIsSpeaking(false);
      return;
    }

    const narration = [
      analysis.tldr,
      `What this notice demands: ${analysis.whatItWants}`,
      analysis.deadline ? `Deadline: ${analysis.deadline}` : '',
      `What happens if you do nothing: ${analysis.consequenceOfInaction}`,
      'Action steps you should take:',
      ...analysis.steps.map((s) => `Step ${s.order}: ${s.action}. ${s.timeframe}.`),
    ]
      .filter(Boolean)
      .join('. ');

    speechRef.current.speak(narration, language, speechRate);
    speechRef.current.onEnd(() => setIsSpeaking(false));
    setIsSpeaking(true);
  }, [analysis, isSpeaking, language, speechRate]);

  const handleRestartSpeak = useCallback(() => {
    if (speechRef.current) {
      speechRef.current.stop();
      setIsSpeaking(false);
      setTimeout(handleToggleSpeak, 100);
    }
  }, [handleToggleSpeak]);

  const handleSendMessage = useCallback(
    async (textToSend: string) => {
      if (!textToSend.trim() || chatLoading) return;
      setChatMessages((prev) => [...prev, { role: 'user', content: textToSend }]);
      setChatLoading(true);

      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (customApiKey) headers['x-gemini-api-key'] = customApiKey;

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers,
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
          { role: 'assistant', content: 'Sorry, unable to connect. Please try again.' },
        ]);
      } finally {
        setChatLoading(false);
      }
    },
    [chatLoading, letterContext, language, customApiKey]
  );

  const handleGenerateAppeal = useCallback(async () => {
    if (!analysis || appealLoading) return;
    setAppealLoading(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (customApiKey) headers['x-gemini-api-key'] = customApiKey;

      const res = await fetch('/api/appeal', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          letterContext,
          category: analysis.category,
          language: LANGUAGE_NAMES[language],
        }),
      });

      const data = await res.json();
      setAppealLetter(data.appealLetter || data.error || 'Unable to draft letter.');
    } catch {
      setAppealLetter('Failed to connect to legal drafting assistant. Please retry.');
    } finally {
      setAppealLoading(false);
    }
  }, [analysis, appealLoading, customApiKey, letterContext, language]);

  return (
    <div
      className={`min-h-screen bg-paper text-ink flex flex-col ${
        fontSize === 'large' ? 'text-scale-large' : fontSize === 'xlarge' ? 'text-scale-xlarge' : ''
      }`}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* 1. Header Navigation */}
      <HeaderNav
        language={language}
        onLanguageChange={handleLanguageChange}
        onReset={resetApp}
        showScanAnother={status === 'done'}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
      />

      {/* 2. Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <AnimatePresence mode="wait">
          {/* STATE A: IDLE LANDING */}
          {status === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <HeroUploadZone
                onOpenFileSelect={handleFileProcess}
                onOpenCamera={() => setIsCameraOpen(true)}
                onSelectSample={handleSampleSelect}
              />
            </motion.div>
          )}

          {/* STATE B: REDACTION STUDIO */}
          {status === 'redacting' && rawImageSrc && (
            <motion.div
              key="redacting"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <RedactionStudio
                imageSrc={rawImageSrc}
                imageMime={rawImageMime}
                onProceed={(redactedBase64, mime) => analyzeImage(redactedBase64, mime || rawImageMime)}
                onCancel={() => setStatus('idle')}
              />
            </motion.div>
          )}

          {/* STATE C: ANALYZING HUD */}
          {status === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-md mx-auto py-20 text-center space-y-4"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-accent-soft text-accent flex items-center justify-center shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-heading font-bold text-lg text-ink">
                  Decoding Official Notice
                </h3>
                <p className="text-xs text-ink-muted">
                  Checking Texas Property Code, statutory cure windows, and local emergency aid programs...
                </p>
              </div>
            </motion.div>
          )}

          {/* STATE D: ERROR DISPLAY */}
          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto py-12 text-center space-y-4 bg-surface border-2 border-red-200 rounded-2xl p-6"
            >
              <AlertTriangle className="w-10 h-10 text-red-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-base text-ink">
                  Analysis Could Not Complete
                </h3>
                <p className="text-xs text-red-800 leading-relaxed">
                  {error || 'Unable to reach the Gemini decoding API.'}
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => setShowKeyModal(true)}
                  className="btn-primary py-2 text-xs font-bold"
                >
                  <Key className="w-4 h-4 mr-1.5" />
                  Enter Gemini API Key
                </button>
                <button
                  onClick={() => handleSampleSelect(SAMPLE_LETTERS[0])}
                  className="btn-secondary py-2 text-xs font-bold"
                >
                  Test with Demo Notice (100% Free)
                </button>
                <button
                  onClick={resetApp}
                  className="text-xs text-ink-muted hover:text-ink pt-1"
                >
                  Start Over
                </button>
              </div>
            </motion.div>
          )}

          {/* STATE E: DECODED RESULTS */}
          {status === 'done' && analysis && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* 1. Calm-in-a-Panic Triage Hero */}
              <TriageHero
                analysis={analysis}
                onOpenDocFacsimile={viewingDocId ? () => setViewingDocId(viewingDocId) : undefined}
              />

              {/* 2. Key Facts 4-Card Bento Grid */}
              <KeyFactsBento analysis={analysis} />

              {/* 3. Result Section Navigation Tabs */}
              <div className="border-b border-line flex items-center gap-1 sm:gap-2 overflow-x-auto pb-px">
                <button
                  onClick={() => setActiveTab('steps')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'steps'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-ink-muted hover:text-ink'
                  }`}
                >
                  <ListChecks className="w-4 h-4" />
                  <span>Action Checklist &amp; Timeline</span>
                </button>

                <button
                  onClick={() => setActiveTab('spotlight')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'spotlight'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-ink-muted hover:text-ink'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Notice Spotlight &amp; Jargon</span>
                </button>

                <button
                  onClick={() => setActiveTab('dispute')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'dispute'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-ink-muted hover:text-ink'
                  }`}
                >
                  <Gavel className="w-4 h-4" />
                  <span>1-Click Dispute Draft</span>
                </button>

                <button
                  onClick={() => setActiveTab('aid')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'aid'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-ink-muted hover:text-ink'
                  }`}
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Austin Free Legal Aid ({resources.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'chat'
                      ? 'border-accent text-accent'
                      : 'border-transparent text-ink-muted hover:text-ink'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Ask AI Assistant</span>
                </button>
              </div>

              {/* 4. Active Tab Content Panels */}
              <div className="pt-2">
                {activeTab === 'steps' && (
                  <ActionRoadmap
                    analysis={analysis}
                    completedSteps={completedSteps}
                    onToggleStep={(order) =>
                      setCompletedSteps((prev) => ({ ...prev, [order]: !prev[order] }))
                    }
                    completedPrepDocs={completedPrepDocs}
                    onTogglePrepDoc={(idx) =>
                      setCompletedPrepDocs((prev) => ({ ...prev, [idx]: !prev[idx] }))
                    }
                  />
                )}

                {activeTab === 'spotlight' && (
                  <DocumentSpotlight
                    analysis={analysis}
                    rawLetterText={letterContext}
                    onOpenDocVisualizer={
                      viewingDocId ? () => setViewingDocId(viewingDocId) : undefined
                    }
                  />
                )}

                {activeTab === 'dispute' && (
                  <DisputeStudio
                    analysis={analysis}
                    appealLetter={appealLetter}
                    onGenerateAppeal={handleGenerateAppeal}
                    isLoading={appealLoading}
                  />
                )}

                {activeTab === 'aid' && <AidDirectory resources={resources} />}

                {activeTab === 'chat' && (
                  <CivicChatDrawer
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                    isLoading={chatLoading}
                    category={analysis.category}
                  />
                )}
              </div>

              {/* 5. Sticky Accessible Audio HUD */}
              <AudioPlayerHUD
                isSpeaking={isSpeaking}
                onTogglePlay={handleToggleSpeak}
                speechRate={speechRate}
                onChangeRate={setSpeechRate}
                onRestart={handleRestartSpeak}
                language={LANGUAGE_NAMES[language]}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Camera Viewfinder Modal */}
      <CameraViewfinder
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onFileSelect={handleFileProcess}
      />

      {/* Document Facsimile Visualizer Modal */}
      {viewingDocId && (
        <DocumentVisualizer letterId={viewingDocId} onClose={() => setViewingDocId(null)} />
      )}

      {/* API Key Modal */}
      <AnimatePresence>
        {showKeyModal && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4 border border-line"
            >
              <button
                onClick={() => setShowKeyModal(false)}
                className="absolute top-4 right-4 p-1.5 text-ink-muted hover:text-ink rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <h3 className="font-heading font-bold text-base text-ink">
                  Enter Gemini API Key
                </h3>
                <p className="text-xs text-ink-muted">
                  Stored securely in your local browser storage. Never sent to our servers.
                </p>
              </div>

              <input
                type="password"
                value={tempKeyInput}
                onChange={(e) => setTempKeyInput(e.target.value)}
                placeholder="AIzaSy... or AQ.Ab8..."
                className="w-full bg-paper-elevated border border-line rounded-xl px-3.5 py-2.5 text-xs text-ink focus:ring-2 focus:ring-accent/40 focus:outline-none"
              />

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => saveApiKey(tempKeyInput)}
                  className="btn-primary flex-1 py-2 text-xs font-bold"
                >
                  Save Key
                </button>
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="btn-secondary py-2 px-4 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
