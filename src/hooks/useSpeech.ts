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
  const speakingRef = useRef(false);
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
    speakingRef.current = false;
    setIsSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string, options?: SpeakOptions) => {
      if (!supported || !text?.trim()) return;

      const normalized = text.replace(/\s+/g, ' ').trim();
      const now = Date.now();

      // 防止 Safari 在極短時間重入造成首字重複
      if (lastSpeakRef.current.text === normalized && now - lastSpeakRef.current.ts < 450) {
        return;
      }
      lastSpeakRef.current = { text: normalized, ts: now };

      if (speakTimerRef.current !== null) {
        window.clearTimeout(speakTimerRef.current);
        speakTimerRef.current = null;
      }

      // 僅在真的播放中才 cancel，避免每次 cancel 導致頭字重複
      if (speakingRef.current || window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }

      speakTimerRef.current = window.setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(normalized);
        utterance.lang = preferredVoice?.lang || 'ja-JP';
        utterance.voice = preferredVoice ?? null;
        utterance.rate = options?.rate ?? 0.95;
        utterance.pitch = options?.pitch ?? 1;
        utterance.volume = options?.volume ?? 1;

        utterance.onstart = () => {
          speakingRef.current = true;
          setIsSpeaking(true);
        };
        utterance.onend = () => {
          speakingRef.current = false;
          setIsSpeaking(false);
        };
        utterance.onerror = () => {
          speakingRef.current = false;
          setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
      }, 120);
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
