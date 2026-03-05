import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type SpeakOptions = {
  rate?: number;
  pitch?: number;
  volume?: number;
};

export function useSpeech() {
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lastSpeakRef = useRef<{ text: string; ts: number }>({ text: '', ts: 0 });
  const speakTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false);
      return;
    }

    setSupported(true);

    const loadVoices = () => {
      const next = window.speechSynthesis.getVoices();
      if (next.length) setVoices(next);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      if (speakTimerRef.current !== null) {
        window.clearTimeout(speakTimerRef.current);
        speakTimerRef.current = null;
      }
    };
  }, []);

  const preferredVoice = useMemo(() => {
    if (!voices.length) return null;

    return (
      voices.find((v) => /^ja(-|_)/i.test(v.lang) && /kyoko|otoya|japan|ja/i.test(v.name)) ||
      voices.find((v) => /^ja(-|_)/i.test(v.lang)) ||
      voices[0]
    );
  }, [voices]);

  const stop = useCallback(() => {
    if (!supported) return;
    if (speakTimerRef.current !== null) {
      window.clearTimeout(speakTimerRef.current);
      speakTimerRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string, options?: SpeakOptions) => {
      if (!supported || !text?.trim()) return;

      const normalized = text.trim();
      const now = Date.now();

      // 防止 iOS Safari 在極短時間重入造成開頭字重複
      if (lastSpeakRef.current.text === normalized && now - lastSpeakRef.current.ts < 320) {
        return;
      }
      lastSpeakRef.current = { text: normalized, ts: now };

      if (speakTimerRef.current !== null) {
        window.clearTimeout(speakTimerRef.current);
        speakTimerRef.current = null;
      }

      window.speechSynthesis.cancel();

      // 讓 cancel 先落地，再 speak，避免部分瀏覽器頭字重複/咬字
      speakTimerRef.current = window.setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(normalized);
        utterance.lang = preferredVoice?.lang || 'ja-JP';
        utterance.voice = preferredVoice ?? null;
        utterance.rate = options?.rate ?? 0.95;
        utterance.pitch = options?.pitch ?? 1;
        utterance.volume = options?.volume ?? 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      }, 80);
    },
    [preferredVoice, supported],
  );

  return {
    supported,
    isSpeaking,
    speak,
    stop,
  };
}
