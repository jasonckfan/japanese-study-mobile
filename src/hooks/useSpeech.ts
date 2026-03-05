import { useCallback, useEffect, useMemo, useState } from 'react';

type SpeakOptions = {
  rate?: number;
  pitch?: number;
  volume?: number;
};

export function useSpeech() {
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

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
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [supported]);

  const speak = useCallback(
    (text: string, options?: SpeakOptions) => {
      if (!supported || !text?.trim()) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = preferredVoice?.lang || 'ja-JP';
      utterance.voice = preferredVoice ?? null;
      utterance.rate = options?.rate ?? 0.95;
      utterance.pitch = options?.pitch ?? 1;
      utterance.volume = options?.volume ?? 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
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
