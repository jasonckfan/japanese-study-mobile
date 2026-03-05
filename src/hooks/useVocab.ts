import { useState, useEffect, useCallback } from 'react';
import type { VocabCard, StudyStats } from '../types';
import { initialVocabData } from '../data/vocab';

const STORAGE_KEYS = {
  VOCAB: 'nihongo-vocab',
  STATS: 'nihongo-stats',
};

const getInitialStats = (): StudyStats => ({
  totalWords: initialVocabData.length,
  masteredWords: 0,
  dueForReview: initialVocabData.length,
  studyStreak: 0,
  lastStudyDate: '',
  scenarioProgress: {},
});

export function useVocab() {
  const [cards, setCards] = useState<VocabCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.VOCAB);
    if (stored) {
      setCards(JSON.parse(stored));
    } else {
      const initialCards: VocabCard[] = initialVocabData.map((card) => ({
        ...card,
        nextReview: Date.now(),
        interval: 0,
        reviewCount: 0,
        mastered: false,
      }));
      setCards(initialCards);
      localStorage.setItem(STORAGE_KEYS.VOCAB, JSON.stringify(initialCards));
    }
  }, []);

  const saveCards = useCallback((newCards: VocabCard[]) => {
    localStorage.setItem(STORAGE_KEYS.VOCAB, JSON.stringify(newCards));
    setCards(newCards);
  }, []);

  const getDueCards = useCallback(() => {
    const now = Date.now();
    return cards.filter((card) => card.nextReview <= now || card.reviewCount === 0);
  }, [cards]);

  const handleReview = useCallback((mastered: boolean, nextIndex?: number) => {
    if (cards.length === 0) return;

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    
    const updatedCards = [...cards];
    const currentCard = updatedCards[currentIndex];

    if (mastered) {
      const intervalSteps = [1, 3, 7, 14, 30];
      const newInterval = intervalSteps.find((step) => step > currentCard.interval) ?? 30;
      updatedCards[currentIndex] = {
        ...currentCard,
        interval: newInterval,
        nextReview: now + newInterval * dayMs,
        reviewCount: currentCard.reviewCount + 1,
        mastered: true,
      };
    } else {
      updatedCards[currentIndex] = {
        ...currentCard,
        interval: 1,
        nextReview: now + dayMs,
        reviewCount: currentCard.reviewCount + 1,
        mastered: false,
      };
    }

    saveCards(updatedCards);
    
    setIsFlipped(false);
    setTimeout(() => {
      if (typeof nextIndex === 'number' && Number.isFinite(nextIndex)) {
        const bounded = ((Math.floor(nextIndex) % cards.length) + cards.length) % cards.length;
        setCurrentIndex(bounded);
      } else {
        setCurrentIndex((prev) => (prev + 1) % cards.length);
      }
    }, 300);
  }, [cards, currentIndex, saveCards]);

  const resetProgress = useCallback(() => {
    const resetCards: VocabCard[] = initialVocabData.map((card) => ({
      ...card,
      nextReview: Date.now(),
      interval: 0,
      reviewCount: 0,
      mastered: false,
    }));
    saveCards(resetCards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [saveCards]);

  return {
    cards,
    currentCard: cards[currentIndex],
    currentIndex,
    setCurrentIndex,
    isFlipped,
    dueCards: getDueCards(),
    setIsFlipped,
    handleReview,
    resetProgress,
    progress: {
      total: cards.length,
      mastered: cards.filter((c) => c.mastered).length,
      due: getDueCards().length,
    },
  };
}

export function useStats() {
  const [stats, setStats] = useState<StudyStats>(getInitialStats());

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.STATS);
    if (stored) {
      setStats(JSON.parse(stored));
    }
  }, []);

  const updateStats = useCallback((newStats: Partial<StudyStats>) => {
    const updated = { ...stats, ...newStats };
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updated));
    setStats(updated);
  }, [stats]);

  return { stats, updateStats };
}
