export class SpeechManager {
  private utterance: SpeechSynthesisUtterance | null = null;
  private isSupported: boolean;

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  get supported(): boolean {
    return this.isSupported;
  }

  get speaking(): boolean {
    if (!this.isSupported) return false;
    return window.speechSynthesis.speaking;
  }

  get paused(): boolean {
    if (!this.isSupported) return false;
    return window.speechSynthesis.paused;
  }

  speak(text: string, lang: string = 'en-US', rate: number = 1.0): void {
    if (!this.isSupported) return;

    this.stop();

    const langMap: Record<string, string> = {
      en: 'en-US',
      es: 'es-MX',
      vi: 'vi-VN',
      zh: 'zh-CN',
      ar: 'ar-SA',
    };

    this.utterance = new SpeechSynthesisUtterance(text);
    this.utterance.lang = langMap[lang] || lang;
    this.utterance.rate = rate;
    this.utterance.pitch = 1.0;
    this.utterance.volume = 1.0;

    window.speechSynthesis.speak(this.utterance);
  }

  pause(): void {
    if (!this.isSupported) return;
    window.speechSynthesis.pause();
  }

  resume(): void {
    if (!this.isSupported) return;
    window.speechSynthesis.resume();
  }

  stop(): void {
    if (!this.isSupported) return;
    window.speechSynthesis.cancel();
    this.utterance = null;
  }

  onEnd(callback: () => void): void {
    if (this.utterance) {
      this.utterance.onend = callback;
    }
  }
}
