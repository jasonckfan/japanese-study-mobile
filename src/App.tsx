import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useVocab } from './hooks/useVocab';
import { useSpeech } from './hooks/useSpeech';
import { initialScenarios } from './data/vocab';
import { sigureResources } from './data/sigure';
import './styles/App.css';

type TabType = 'vocab' | 'conversation' | 'materials' | 'progress';

const HeroSection: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div className={`hero-section ${compact ? 'compact' : ''}`}>
    <h1 className="hero-title">日本語道場</h1>
    <p className="hero-subtitle">Master Japanese through practice</p>
  </div>
);

const ProgressBar: React.FC<{ total: number; mastered: number; due: number }> = ({ total, mastered }) => {
  const percentage = total > 0 ? (mastered / total) * 100 : 0;
  return (
    <div className="progress-bar">
      <div className="progress-info">
        <div className="progress-label">
          <span>学習進捗</span>
          <span>{mastered}/{total}</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${percentage}%` }} />
        </div>
      </div>
    </div>
  );
};

const renderRubyText = (text: string) => {
  // 支援「漢字(かな)」與「漢字かな(かな)」等標記，統一轉成 ruby-only 顯示
  const rubyPattern = /([ぁ-ゖァ-ヺ一-龯々〆ヵヶー]+)\(([^()]+)\)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = rubyPattern.exec(text)) !== null) {
    const [full, kanji, reading] = match;
    const start = match.index;

    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }

    nodes.push(
      <ruby key={`${kanji}-${reading}-${start}`}>
        {kanji}
        <rt>{reading}</rt>
      </ruby>
    );

    lastIndex = start + full.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
};

const buildGrammarNotes = (example: string) => {
  const notes: Array<{ key: string; label: string; detail: string }> = [];
  if (example.includes('ですか')) {
    notes.push({ key: 'desuka', label: '疑問句：ですか', detail: '以「〜ですか」結尾，用於禮貌詢問。' });
  }
  if (example.includes('ください')) {
    notes.push({ key: 'kudasai', label: '請求句：〜ください', detail: '表示請求或請對方做某事。' });
  }
  if (example.includes('ません')) {
    notes.push({ key: 'masen', label: '否定形：〜ません', detail: '動詞敬體否定，表「不…」。' });
  }
  if (example.includes('は')) {
    notes.push({ key: 'wa', label: '主題助詞：は', detail: '標記句子主題，突出「關於…」。' });
  }
  if (example.includes('を')) {
    notes.push({ key: 'wo', label: '受詞助詞：を', detail: '標記動作直接作用的對象。' });
  }
  if (example.includes('に')) {
    notes.push({ key: 'ni', label: '方向/時間助詞：に', detail: '常用於時間點、目的地或對象。' });
  }
  if (example.includes('で')) {
    notes.push({ key: 'de', label: '場所/手段助詞：で', detail: '表示動作發生場所或手段。' });
  }

  return notes.slice(0, 3);
};

const Flashcard: React.FC<{
  card: ReturnType<typeof useVocab>['currentCard'];
  isFlipped: boolean;
  onFlip: () => void;
  onSpeakWord: () => void;
  onSpeakExample: () => void;
}> = ({ card, isFlipped, onFlip, onSpeakWord, onSpeakExample }) => {
  if (!card) return null;
  const grammarNotes = buildGrammarNotes(card.example);

  return (
    <div className="flashcard-container">
      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={onFlip}>
        <div className="flashcard-face flashcard-front">
          <span className={`flashcard-level ${card.level}`}>{card.level}</span>
          <div className="flashcard-word">{card.word}</div>
          <div className="flashcard-furigana">{card.furigana}</div>
          <button className="speak-btn" onClick={(e) => { e.stopPropagation(); onSpeakWord(); }}>🔊 發音</button>
        </div>
        <div className="flashcard-face flashcard-back">
          <span className={`flashcard-level ${card.level}`}>{card.level}</span>
          <div className="flashcard-meaning">{card.meaning}</div>
          <div className="flashcard-example">
            <div className="flashcard-example-jp">{renderRubyText((card.exampleFurigana && card.exampleFurigana.trim()) || card.example || '')}</div>
            <div className="flashcard-example-cn">{card.exampleMeaning}</div>
            <button className="speak-btn secondary" onClick={(e) => { e.stopPropagation(); onSpeakExample(); }}>🔊 例句發音</button>
          </div>
          {grammarNotes.length > 0 && (
            <div className="grammar-notes" onClick={(e) => e.stopPropagation()}>
              <div className="grammar-notes-title">文法應用</div>
              <div className="grammar-notes-list">
                {grammarNotes.map((note) => (
                  <div key={note.key} className="grammar-note-item">
                    <div className="grammar-note-label">{note.label}</div>
                    <div className="grammar-note-detail">{note.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ActionButtons: React.FC<{
  onReview: (mastered: boolean) => void;
  disabled?: boolean;
  feedback?: 'mastered' | 'review' | null;
}> = ({ onReview, disabled, feedback }) => (
  <div className="action-buttons">
    <button
      className={`action-btn review ${feedback === 'review' ? 'feedback-pulse' : ''}`}
      onClick={() => onReview(false)}
      disabled={disabled}
    >
      再学習
    </button>
    <button
      className={`action-btn mastered ${feedback === 'mastered' ? 'feedback-pulse' : ''}`}
      onClick={() => onReview(true)}
      disabled={disabled}
    >
      已掌握
    </button>
  </div>
);

type LevelFilter = 'all' | 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

const VocabularyView: React.FC = () => {
  const { cards, currentCard, currentIndex, setCurrentIndex, isFlipped, setIsFlipped, handleReview, syncWithLatestData, progress } = useVocab();
  const { supported, japaneseVoices, selectedVoiceURI, setSelectedVoiceURI, refreshVoices, speak, stop } = useSpeech();
  const [speechRate, setSpeechRate] = useState(0.9);
  const [autoPlay, setAutoPlay] = useState(true);
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [jumpInput, setJumpInput] = useState('');
  const [feedback, setFeedback] = useState<'mastered' | 'review' | null>(null);
  const [syncNotice, setSyncNotice] = useState('');
  const feedbackTimeoutRef = useRef<number | null>(null);
  const pendingAutoSpeakCardIdRef = useRef<string | null>(null);
  const lastSpokenIndexRef = useRef<number | null>(null);
  const autoSpeakTimerRef = useRef<number | null>(null);
  const targetSpeakCardIdRef = useRef<string | null>(null);

  const filteredIndices = useMemo(() => {
    return cards
      .map((card, index) => ({ card, index }))
      .filter(({ card }) => levelFilter === 'all' || card.level === levelFilter)
      .map(({ index }) => index);
  }, [cards, levelFilter]);

  const filteredCurrentPosition = filteredIndices.indexOf(currentIndex);
  const activeCard = filteredCurrentPosition >= 0 ? cards[currentIndex] : undefined;
  const iosHighQualityVoices = useMemo(() => {
    const qualityHint = /(premium|enhanced|siri|natural|neural|高品質|高质)/i;
    return japaneseVoices.filter((voice) => qualityHint.test(voice.name));
  }, [japaneseVoices]);
  const voiceOptions = iosHighQualityVoices.length > 0 ? iosHighQualityVoices : japaneseVoices;

  useEffect(() => {
    if (filteredIndices.length === 0) return;
    if (filteredCurrentPosition === -1) {
      setCurrentIndex(filteredIndices[0]);
      setIsFlipped(false);
    }
  }, [filteredIndices, filteredCurrentPosition, setCurrentIndex, setIsFlipped]);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current !== null) {
        window.clearTimeout(feedbackTimeoutRef.current);
      }
      if (autoSpeakTimerRef.current !== null) {
        window.clearTimeout(autoSpeakTimerRef.current);
      }
      targetSpeakCardIdRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!autoPlay) {
      pendingAutoSpeakCardIdRef.current = null;
      targetSpeakCardIdRef.current = null;
      if (autoSpeakTimerRef.current !== null) {
        window.clearTimeout(autoSpeakTimerRef.current);
        autoSpeakTimerRef.current = null;
      }
      return;
    }
    if (!supported || !currentCard) return;

    if (lastSpokenIndexRef.current === null) {
      lastSpokenIndexRef.current = currentIndex;
      if (autoSpeakTimerRef.current !== null) {
        window.clearTimeout(autoSpeakTimerRef.current);
      }
      targetSpeakCardIdRef.current = currentCard.id;
      autoSpeakTimerRef.current = window.setTimeout(() => {
        const targetId = targetSpeakCardIdRef.current;
        if (!targetId || currentCard.id !== targetId) return;
        stop();
        speak(currentCard.word, { rate: speechRate });
      }, 220);
      return;
    }

    const pendingCardId = pendingAutoSpeakCardIdRef.current;
    if (
      pendingCardId &&
      currentCard.id === pendingCardId &&
      lastSpokenIndexRef.current !== currentIndex
    ) {
      pendingAutoSpeakCardIdRef.current = null;
      lastSpokenIndexRef.current = currentIndex;
      if (autoSpeakTimerRef.current !== null) {
        window.clearTimeout(autoSpeakTimerRef.current);
      }
      targetSpeakCardIdRef.current = currentCard.id;
      autoSpeakTimerRef.current = window.setTimeout(() => {
        const targetId = targetSpeakCardIdRef.current;
        if (!targetId || currentCard.id !== targetId) return;
        stop();
        speak(currentCard.word, { rate: speechRate });
      }, 220);
    }
  }, [supported, autoPlay, currentCard, currentIndex, speechRate, speak, stop]);

  const onJumpToIndex = () => {
    if (filteredIndices.length === 0) return;
    const parsed = Number.parseInt(jumpInput, 10);
    if (!Number.isFinite(parsed)) return;
    const normalized = Math.max(1, Math.min(parsed, filteredIndices.length));
    setCurrentIndex(filteredIndices[normalized - 1]);
    setIsFlipped(false);
    setJumpInput(String(normalized));
  };

  const onActionReview = (mastered: boolean) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(mastered ? [24] : [10, 28, 10]);
    }

    const currentPos = filteredIndices.indexOf(currentIndex);
    const hasFilteredCards = filteredIndices.length > 0;
    
    // Calculate next position: if there's only one card, stay at 0
    // Otherwise, move to the next card (wrapping around if necessary)
    let nextPos: number;
    if (filteredIndices.length <= 1) {
      nextPos = 0;
    } else {
      nextPos = ((currentPos >= 0 ? currentPos : 0) + 1) % filteredIndices.length;
    }
    
    const nextIndex = hasFilteredCards ? filteredIndices[nextPos] : undefined;

    if (autoPlay && typeof nextIndex === 'number') {
      pendingAutoSpeakCardIdRef.current = cards[nextIndex]?.id ?? null;
      stop();
    } else {
      pendingAutoSpeakCardIdRef.current = null;
    }

    setFeedback(mastered ? 'mastered' : 'review');
    if (feedbackTimeoutRef.current !== null) {
      window.clearTimeout(feedbackTimeoutRef.current);
    }
    feedbackTimeoutRef.current = window.setTimeout(() => {
      setFeedback(null);
    }, 320);

    handleReview(mastered, nextIndex);
  };

  const onManualSync = () => {
    const total = syncWithLatestData();
    setSyncNotice(`已同步最新詞庫（${total} 詞）`);
    window.setTimeout(() => setSyncNotice(''), 1500);
  };

  return (
    <div className="fade-in">
      <ProgressBar {...progress} />
      {!supported && (
        <div className="speech-warning">⚠️ 你的瀏覽器未開啟語音合成（SpeechSynthesis），暫時無法播放發音。</div>
      )}

      <div className="vocab-top-row">
        <div className="position-chip">
          位置 {filteredIndices.length === 0 || filteredCurrentPosition < 0 ? 0 : filteredCurrentPosition + 1}/{filteredIndices.length}
        </div>

        <div className="quick-jump-row">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={Math.max(filteredIndices.length, 1)}
            value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value)}
            placeholder="#"
            className="jump-input"
          />
          <button className="chip jump-btn" onClick={onJumpToIndex}>跳轉</button>
        </div>

        <details className="vocab-controls-panel corner">
          <summary aria-label="開啟學習設定">⚙️</summary>
          <div className="vocab-controls">
            {supported && (
              <>
                <div className="speech-controls compact">
                  <span>語速</span>
                  <button className={`chip ${speechRate === 0.75 ? 'active' : ''}`} onClick={() => setSpeechRate(0.75)}>慢速</button>
                  <button className={`chip ${speechRate === 0.9 ? 'active' : ''}`} onClick={() => setSpeechRate(0.9)}>正常</button>
                  <button className={`chip ${speechRate === 1 ? 'active' : ''}`} onClick={() => setSpeechRate(1)}>偏快</button>
                  <button className={`chip ${autoPlay ? 'active' : ''}`} onClick={() => setAutoPlay((v) => !v)}>{autoPlay ? '自動播放: 開' : '自動播放: 關'}</button>
                </div>
                <div className="voice-controls">
                  <label htmlFor="voice-select" className="voice-label">iOS高品質語音（{voiceOptions.length}）</label>
                  <select
                    id="voice-select"
                    className="voice-select"
                    value={selectedVoiceURI}
                    onChange={(e) => setSelectedVoiceURI(e.target.value)}
                  >
                    <option value="">系統預設（日語優先）</option>
                    {voiceOptions.map((voice) => (
                      <option key={`${voice.voiceURI}-${voice.name}-${voice.lang}`} value={voice.voiceURI}>
                        {voice.name}（{voice.lang}）
                      </option>
                    ))}
                  </select>
                  <div className="voice-actions-row">
                    <button className="chip" type="button" onClick={refreshVoices}>重新載入音色</button>
                    <button
                      className="chip"
                      type="button"
                      onClick={() => speak('こんにちは、今日も頑張りましょう。', { rate: speechRate })}
                    >
                      試播音色
                    </button>
                  </div>
                  {iosHighQualityVoices.length === 0 && (
                    <div className="position-indicator">目前未偵測到「高品質」標記語音，暫時顯示一般系統語音。</div>
                  )}
                  {japaneseVoices.length <= 1 && (
                    <div className="position-indicator">目前系統只回傳 1 種日語語音（Kyoko）。這通常是 iOS Web Speech 的限制，不是篩選錯誤。</div>
                  )}
                </div>
              </>
            )}

            <div className="difficulty-row">
              <span className="difficulty-label">級別</span>
              <button className={`chip ${levelFilter === 'all' ? 'active' : ''}`} onClick={() => setLevelFilter('all')}>全部</button>
              <button className={`chip ${levelFilter === 'N5' ? 'active' : ''}`} onClick={() => setLevelFilter('N5')}>N5</button>
              <button className={`chip ${levelFilter === 'N4' ? 'active' : ''}`} onClick={() => setLevelFilter('N4')}>N4</button>
              <button className={`chip ${levelFilter === 'N3' ? 'active' : ''}`} onClick={() => setLevelFilter('N3')}>N3</button>
              <button className={`chip ${levelFilter === 'N2' ? 'active' : ''}`} onClick={() => setLevelFilter('N2')}>N2</button>
              <button className={`chip ${levelFilter === 'N1' ? 'active' : ''}`} onClick={() => setLevelFilter('N1')}>N1</button>
            </div>

            <div className="jump-row">
              <button className="chip jump-btn" onClick={onManualSync}>手動同步最新詞庫</button>
              {syncNotice && <span className="position-indicator">{syncNotice}</span>}
            </div>
          </div>
        </details>
      </div>

      {progress.total === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <div className="empty-title">単語がありません</div>
          <div className="empty-text">データを読み込み中...</div>
        </div>
      ) : filteredIndices.length === 0 || !activeCard ? (
        <div className="empty-state">
          <div className="empty-icon">🧭</div>
          <div className="empty-title">此級別暫無單字</div>
          <div className="empty-text">請切換至其他級別</div>
        </div>
      ) : (
        <>
          <Flashcard
            card={activeCard}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(!isFlipped)}
            onSpeakWord={() => activeCard && speak(activeCard.word, { rate: speechRate })}
            onSpeakExample={() => activeCard && speak(activeCard.example, { rate: speechRate })}
          />
          <ActionButtons onReview={onActionReview} feedback={feedback} />
          {feedback && (
            <div className={`action-feedback ${feedback}`}>
              {feedback === 'mastered' ? '✓ 已記錄：已掌握' : '↺ 已記錄：再學習'}
            </div>
          )}


        </>
      )}
    </div>
  );
};

const ScenarioCard: React.FC<{
  scenario: typeof initialScenarios[0];
  onClick: () => void;
}> = ({ scenario, onClick }) => (
  <div className="scenario-card" onClick={onClick}>
    <div className="scenario-icon">{scenario.icon}</div>
    <div className="scenario-title">{scenario.title}</div>
    <div className="scenario-title-cn">{scenario.titleCn}</div>
  </div>
);

const ChatPractice: React.FC<{ scenario: typeof initialScenarios[0]; onBack: () => void }> = ({ scenario, onBack }) => {
  const [messages] = useState(scenario.dialogues);
  const [speechRate, setSpeechRate] = useState(0.9);
  const { supported, speak } = useSpeech();
  const lastSpeakTsRef = useRef(0);

  const replayStarter = () => {
    const starter = messages.slice(0, 2);
    starter.forEach((item, i) => {
      window.setTimeout(() => speak(item.text, { rate: speechRate }), i * 1800);
    });
  };

  const triggerBubbleSpeech = (text: string) => {
    const now = Date.now();
    if (now - lastSpeakTsRef.current < 240) return;
    lastSpeakTsRef.current = now;
    speak(text, { rate: speechRate });
  };
  
  return (
    <div className="fade-in">
      <button className="back-btn" onClick={onBack}>← 戻る</button>
      
      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-header-icon">{scenario.icon}</div>
          <div className="chat-header-info">
            <h3>{scenario.title}</h3>
            <p>{scenario.contextCn}</p>
          </div>
        </div>
        
        <div className="chat-tap-hint">👆 直接點對話氣泡即可發音（整個氣泡都可點）</div>
        <div className="chat-messages">
          {messages.map((msg, idx) => {
            const isFirstRole = msg.role === scenario.roles[0].id;
            const roleLabel = isFirstRole ? scenario.roles[0].nameCn : scenario.roles[1].nameCn;
            const speechText = `${roleLabel}：${msg.text}`;

            return (
              <button
                key={idx}
                type="button"
                className={`chat-bubble ${isFirstRole ? 'customer' : 'staff'}`}
                onClick={() => triggerBubbleSpeech(msg.text)}
                aria-label={`播放：${speechText}`}
                title="點擊對話框播放發音"
              >
                <div className="chat-role">{roleLabel}</div>
                <span>{renderRubyText((msg.textFurigana && msg.textFurigana.trim()) ? msg.textFurigana : msg.text)}</span>
                {msg.textCn && <div className="chat-translation">{msg.textCn}</div>}
              </button>
            );
          })}
        </div>

        <div className="phrase-bank">
          <div className="phrase-bank-title">播放設定</div>
          {!supported && <div className="speech-warning" style={{ marginBottom: 10 }}>⚠️ 瀏覽器不支援發音</div>}
          {supported && (
            <div className="speech-controls" style={{ marginBottom: 10 }}>
              <span>語速</span>
              <button className={`chip ${speechRate === 0.8 ? 'active' : ''}`} onClick={() => setSpeechRate(0.8)}>慢速</button>
              <button className={`chip ${speechRate === 0.9 ? 'active' : ''}`} onClick={() => setSpeechRate(0.9)}>正常</button>
              <button className={`chip ${speechRate === 1 ? 'active' : ''}`} onClick={() => setSpeechRate(1)}>偏快</button>
              <button className="chip" onClick={replayStarter}>A/B 重播</button>
            </div>
          )}

          <div className="phrase-bank-title" style={{ marginTop: 14 }}>重點詞彙</div>
          <div className="phrase-bank-chips">
            {scenario.phrases.map((phrase) => (
              <button
                key={phrase.text}
                type="button"
                className="phrase-chip"
                onClick={() => triggerBubbleSpeech(phrase.text)}
                title="點擊播放詞彙發音"
              >
                <strong>{phrase.text}</strong>
                <span>{phrase.meaning}</span>
              </button>
            ))}
          </div>

          {scenario.grammarPoints && scenario.grammarPoints.length > 0 && (
            <>
              <div className="phrase-bank-title" style={{ marginTop: 14 }}>文法重點</div>
              <div className="grammar-notes-list">
                {scenario.grammarPoints.map((point) => (
                  <div key={point.pattern} className="grammar-note-item">
                    <div className="grammar-note-label">{point.pattern}</div>
                    <div className="grammar-note-detail">{point.explanation}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ConversationView: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<typeof initialScenarios[0] | null>(null);
  
  if (selectedScenario) {
    return <ChatPractice scenario={selectedScenario} onBack={() => setSelectedScenario(null)} />;
  }
  
  return (
    <div className="fade-in">
      <HeroSection />
      <h2 style={{ marginBottom: 16, fontSize: '1.1rem' }}>会話シナリオ</h2>
      <div className="scenario-grid">
        {initialScenarios.map((scenario) => (
          <ScenarioCard 
            key={scenario.id} 
            scenario={scenario} 
            onClick={() => setSelectedScenario(scenario)} 
          />
        ))}
      </div>
    </div>
  );
};

const MaterialsView: React.FC = () => {
  return (
    <div className="fade-in">
      <HeroSection />

      <div className="stats-card">
        <div className="stats-card-title">學習素材（參考：時雨の町）</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
          已把時雨網站常用學習路徑整合成可直達素材。建議流程：
          <br />① 先在本站做題 → ② 回本 App 複習錯題詞彙/句型 → ③ 再進入會話情境實戰。
        </p>
      </div>

      {sigureResources.map((item) => (
        <div key={item.id} className="stats-card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
            <strong>{item.title}</strong>
            <span className={`flashcard-level ${item.level}`} style={{ position: 'static' }}>{item.level}</span>
          </div>
          <p style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{item.description}</p>
          <p style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--accent-gold)' }}>重點：{item.focus}</p>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-block', marginTop: 10, color: 'var(--success-green)', fontSize: '0.82rem' }}
          >
            前往素材 ↗
          </a>
        </div>
      ))}
    </div>
  );
};

const ProgressView: React.FC = () => {
  const { progress, resetProgress } = useVocab();
  
  return (
    <div className="fade-in">
      <HeroSection />
      
      <div className="stats-card">
        <div className="stats-card-title">単語学習進捗</div>
        <div className="progress-stats">
          <div className="stat-item">
            <div className="stat-value">{progress.total}</div>
            <div className="stat-label">総単語数</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{progress.mastered}</div>
            <div className="stat-label">習得済み</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{progress.due}</div>
            <div className="stat-label">復習必要</div>
          </div>
        </div>
      </div>
      
      <div className="stats-card">
        <div className="stats-card-title">習得率</div>
        <ProgressBar {...progress} />
      </div>
      
      <button className="reset-btn" onClick={resetProgress}>
        進捗をリセット
      </button>
    </div>
  );
};

const TabBar: React.FC<{ activeTab: TabType; onTabChange: (tab: TabType) => void }> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabType; icon: string; label: string }[] = [
    { id: 'vocab', icon: '📚', label: '単語' },
    { id: 'conversation', icon: '💬', label: '会話' },
    { id: 'materials', icon: '🧭', label: '素材' },
    { id: 'progress', icon: '📊', label: '進捗' },
  ];
  
  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('vocab');
  
  return (
    <div className="app-container">
      <header className="header">
        <h1>日本語道場</h1>
      </header>
      
      <main className="main-content">
        {activeTab === 'vocab' && <VocabularyView />}
        {activeTab === 'conversation' && <ConversationView />}
        {activeTab === 'materials' && <MaterialsView />}
        {activeTab === 'progress' && <ProgressView />}
      </main>
      
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;
