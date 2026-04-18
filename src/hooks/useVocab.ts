import { useState, useEffect, useCallback } from 'react';
import type { VocabCard, StudyStats } from '../types';
import { initialVocabData } from '../data/vocab';

const STORAGE_KEYS = {
  VOCAB: 'nihongo-vocab',
  STATS: 'nihongo-stats',
  CURRENT_INDEX: 'nihongo-current-index',
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
    const getStoredIndex = (length: number) => {
      const rawIndex = localStorage.getItem(STORAGE_KEYS.CURRENT_INDEX);
      const parsedIndex = rawIndex ? Number.parseInt(rawIndex, 10) : 0;
      if (!Number.isFinite(parsedIndex) || parsedIndex < 0) return 0;
      if (length === 0) return 0;
      return Math.min(parsedIndex, length - 1);
    };

    const stored = localStorage.getItem(STORAGE_KEYS.VOCAB);
    if (stored) {
      try {
        const parsed: VocabCard[] = JSON.parse(stored);
        const finalCards = mergeWithLatestCards(parsed);
        setCards(finalCards);
        setCurrentIndex(getStoredIndex(finalCards.length));
        localStorage.setItem(STORAGE_KEYS.VOCAB, JSON.stringify(finalCards));
      } catch {
        const initialCards: VocabCard[] = initialVocabData.map((card) => ({
          ...card,
          nextReview: Date.now(),
          interval: 0,
          reviewCount: 0,
          mastered: false,
        }));
        setCards(initialCards);
        setCurrentIndex(getStoredIndex(initialCards.length));
        localStorage.setItem(STORAGE_KEYS.VOCAB, JSON.stringify(initialCards));
      }
    } else {
      const initialCards: VocabCard[] = initialVocabData.map((card) => ({
        ...card,
        nextReview: Date.now(),
        interval: 0,
        reviewCount: 0,
        mastered: false,
      }));
      setCards(initialCards);
      setCurrentIndex(getStoredIndex(initialCards.length));
      localStorage.setItem(STORAGE_KEYS.VOCAB, JSON.stringify(initialCards));
    }
  }, []);

  const saveCards = useCallback((newCards: VocabCard[]) => {
    localStorage.setItem(STORAGE_KEYS.VOCAB, JSON.stringify(newCards));
    setCards(newCards);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_INDEX, String(currentIndex));
  }, [currentIndex]);

  const mergeWithLatestCards = useCallback((baseCards: VocabCard[]) => {
    const latestMap = new Map(initialVocabData.map((card) => [card.id, card]));

    const mergedCards: VocabCard[] = baseCards.map((oldCard) => {
      const latest = latestMap.get(oldCard.id);
      if (!latest) return oldCard;
      return {
        ...oldCard,
        word: latest.word,
        furigana: latest.furigana,
        meaning: latest.meaning,
        example: latest.example,
        exampleFurigana: latest.exampleFurigana,
        exampleMeaning: latest.exampleMeaning,
        level: latest.level,
      };
    });

    const existingIds = new Set(mergedCards.map((card) => card.id));
    const appended = initialVocabData
      .filter((card) => !existingIds.has(card.id))
      .map((card) => ({
        ...card,
        nextReview: Date.now(),
        interval: 0,
        reviewCount: 0,
        mastered: false,
      }));

    return [...mergedCards, ...appended];
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
        // 簡化邊界檢查，確保索引在有效範圍內
        const bounded = Math.max(0, Math.min(Math.floor(nextIndex), cards.length - 1));
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

  const syncWithLatestData = useCallback(() => {
    const baseCards = cards.length > 0
      ? cards
      : initialVocabData.map((card) => ({
          ...card,
          nextReview: Date.now(),
          interval: 0,
          reviewCount: 0,
          mastered: false,
        }));

    const syncedCards = mergeWithLatestCards(baseCards);
    localStorage.setItem(STORAGE_KEYS.VOCAB, JSON.stringify(syncedCards));
    setCards(syncedCards);
    setCurrentIndex((prev) => (syncedCards.length === 0 ? 0 : Math.min(prev, syncedCards.length - 1)));
    setIsFlipped(false);
    return syncedCards.length;
  }, [cards, mergeWithLatestCards]);

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
    syncWithLatestData,
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
