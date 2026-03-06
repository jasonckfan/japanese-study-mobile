import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type SpeakOptions = {
  rate?: number;
  pitch?: number;
  volume?: number;
};

const VOICE_STORAGE_KEY = 'japanese-study:selected-voice-uri';

const isJapaneseVoice = (voice: SpeechSynthesisVoice) => /^ja(-|_)/i.test(voice.lang);

export function useSpeech() {
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem(VOICE_STORAGE_KEY) || '';
  });
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

    // iOS Safari 常見：voices 載入較慢，onvoiceschanged 不一定即時觸發
    const retryTimer = window.setInterval(loadVoices, 800);
    const stopRetryTimer = window.setTimeout(() => {
      window.clearInterval(retryTimer);
    }, 10000);

    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadVoices();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.clearInterval(retryTimer);
      window.clearTimeout(stopRetryTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      if (speakTimerRef.current !== null) {
        window.clearTimeout(speakTimerRef.current);
        speakTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!selectedVoiceURI) {
      window.localStorage.removeItem(VOICE_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(VOICE_STORAGE_KEY, selectedVoiceURI);
  }, [selectedVoiceURI]);

  const japaneseVoices = useMemo(() => {
    const dedup = new Map<string, SpeechSynthesisVoice>();
    voices
      .filter(isJapaneseVoice)
      .forEach((voice) => {
        const key = `${voice.voiceURI}::${voice.name}`;
        if (!dedup.has(key)) dedup.set(key, voice);
      });
    return Array.from(dedup.values());
  }, [voices]);

  const defaultVoice = useMemo(() => {
    if (!voices.length) return null;

    return (
      japaneseVoices.find((v) => /kyoko|otoya|japan|ja/i.test(v.name)) ||
      japaneseVoices[0] ||
      voices[0]
    );
  }, [japaneseVoices, voices]);

  const selectedVoice = useMemo(() => {
    if (!selectedVoiceURI || !voices.length) return null;
    return voices.find((voice) => voice.voiceURI === selectedVoiceURI) || null;
  }, [voices, selectedVoiceURI]);

  const activeVoice = selectedVoice || defaultVoice;

  const refreshVoices = useCallback(() => {
    if (!supported || typeof window === 'undefined') return;
    const next = window.speechSynthesis.getVoices();
    if (next.length) setVoices(next);
  }, [supported]);

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
        utterance.lang = activeVoice?.lang || 'ja-JP';
        utterance.voice = activeVoice ?? null;
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
    [activeVoice, supported],
  );

  const allVoices = useMemo(() => {
    const dedup = new Map<string, SpeechSynthesisVoice>();
    voices.forEach((voice) => {
      const key = `${voice.voiceURI}::${voice.name}::${voice.lang}`;
      if (!dedup.has(key)) dedup.set(key, voice);
    });
    return Array.from(dedup.values());
  }, [voices]);

  return {
    supported,
    isSpeaking,
    japaneseVoices,
    allVoices,
    selectedVoiceURI,
    setSelectedVoiceURI,
    refreshVoices,
    speak,
    stop,
  };
}
