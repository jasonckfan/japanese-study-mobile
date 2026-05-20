import { useState, useCallback, useRef, useEffect } from 'react';
import { useSpeech } from './useSpeech';

export interface AudioSegment {
  text: string;
  textCn?: string;
  speaker?: string;
}

export interface UseScenarioAudioReturn {
  isPlayerOpen: boolean;
  currentScenarioTitle: string;
  audioSegments: AudioSegment[];
  isPlaying: boolean;
  currentIndex: number;
  openScenarioAudio: (scenario: any, subScenario?: any) => void;
  closePlayer: () => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  seekTo: (index: number) => void;
}

export const useScenarioAudio = (): UseScenarioAudioReturn => {
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [currentScenarioTitle, setCurrentScenarioTitle] = useState('');
  const [audioSegments, setAudioSegments] = useState<AudioSegment[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { stop, supported } = useSpeech();
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isPlayingRef = useRef(false);

  // Extract segments from scenario/subScenario
  const extractSegments = useCallback((scenario: any, subScenario?: any): AudioSegment[] => {
    const messages = subScenario?.dialogues || [];
    const roles = subScenario?.roles || scenario?.roles || [];
    
    return messages.map((msg: any) => {
      const role = roles.find((r: any) => r.id === msg.role);
      return {
        text: msg.text,
        textCn: msg.textCn,
        speaker: role?.nameCn || role?.name || msg.role,
      };
    });
  }, []);

  const openScenarioAudio = useCallback((scenario: any, subScenario?: any) => {
    const segments = extractSegments(scenario, subScenario);
    const title = subScenario?.title || scenario?.title || '';
    
    setAudioSegments(segments);
    setCurrentScenarioTitle(title);
    setCurrentIndex(0);
    setIsPlayerOpen(true);
    setIsPlaying(false);
  }, [extractSegments]);

  const closePlayer = useCallback(() => {
    stop();
    setIsPlayerOpen(false);
    setIsPlaying(false);
    setCurrentIndex(0);
    isPlayingRef.current = false;
  }, [stop]);

  const playCurrentSegment = useCallback(() => {
    if (!supported || currentIndex >= audioSegments.length) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      return;
    }

    const segment = audioSegments[currentIndex];
    
    // Create utterance with callback for when it ends
    const utterance = new SpeechSynthesisUtterance(segment.text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onend = () => {
      // Auto-advance to next segment if still playing
      if (isPlayingRef.current && currentIndex < audioSegments.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (currentIndex >= audioSegments.length - 1) {
        // Finished all segments
        setIsPlaying(false);
        isPlayingRef.current = false;
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      isPlayingRef.current = false;
    };

    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [audioSegments, currentIndex, supported]);

  // Effect to play segment when index changes while playing
  useEffect(() => {
    if (isPlaying && supported) {
      // Stop any current speech first
      window.speechSynthesis.cancel();
      
      // Small delay to ensure clean transition
      const timer = setTimeout(() => {
        playCurrentSegment();
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [currentIndex, isPlaying, supported, playCurrentSegment]);

  const play = useCallback(() => {
    if (!supported) return;
    
    isPlayingRef.current = true;
    setIsPlaying(true);
    
    // If we're at the end, restart from beginning
    if (currentIndex >= audioSegments.length) {
      setCurrentIndex(0);
    } else {
      playCurrentSegment();
    }
  }, [supported, currentIndex, audioSegments.length, playCurrentSegment]);

  const pause = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    window.speechSynthesis.cancel();
  }, []);

  const next = useCallback(() => {
    if (currentIndex < audioSegments.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, audioSegments.length]);

  const previous = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const seekTo = useCallback((index: number) => {
    if (index >= 0 && index < audioSegments.length) {
      setCurrentIndex(index);
    }
  }, [audioSegments.length]);

  return {
    isPlayerOpen,
    currentScenarioTitle,
    audioSegments,
    isPlaying,
    currentIndex,
    openScenarioAudio,
    closePlayer,
    play,
    pause,
    next,
    previous,
    seekTo,
  };
};
