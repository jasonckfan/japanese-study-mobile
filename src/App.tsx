import React, { useEffect, useRef, useState } from 'react';
import { useVocab } from './hooks/useVocab';
import { useSpeech } from './hooks/useSpeech';
import { initialScenarios } from './data/vocab';
import { sigureResources } from './data/sigure';
import './styles/App.css';

type TabType = 'vocab' | 'conversation' | 'materials' | 'progress';

const HeroSection: React.FC = () => (
  <div className="hero-section">
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

const Flashcard: React.FC<{
  card: ReturnType<typeof useVocab>['currentCard'];
  isFlipped: boolean;
  onFlip: () => void;
  onSpeakWord: () => void;
  onSpeakExample: () => void;
}> = ({ card, isFlipped, onFlip, onSpeakWord, onSpeakExample }) => {
  if (!card) return null;
  
  return (
    <div className="flashcard-container">
      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={onFlip}>
        <div className="flashcard-face flashcard-front">
          <span className={`flashcard-level ${card.level}`}>{card.level}</span>
          <div className="flashcard-word">{card.word}</div>
          <div className="flashcard-furigana">{card.furigana}</div>
          <button className="speak-btn" onClick={(e) => { e.stopPropagation(); onSpeakWord(); }}>🔊 發音</button>
          <div className="flashcard-hint">タップして答えを見る</div>
        </div>
        <div className="flashcard-face flashcard-back">
          <span className={`flashcard-level ${card.level}`}>{card.level}</span>
          <div className="flashcard-meaning">{card.meaning}</div>
          <div className="flashcard-example">
            <div className="flashcard-example-jp">{card.example}</div>
            <div className="flashcard-example-cn">{card.exampleMeaning}</div>
            <button className="speak-btn secondary" onClick={(e) => { e.stopPropagation(); onSpeakExample(); }}>🔊 例句發音</button>
          </div>
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

const VocabularyView: React.FC = () => {
  const { currentCard, isFlipped, setIsFlipped, handleReview, progress } = useVocab();
  const { supported, speak } = useSpeech();
  const [speechRate, setSpeechRate] = useState(0.9);
  const [autoPlay, setAutoPlay] = useState(true);
  const [feedback, setFeedback] = useState<'mastered' | 'review' | null>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current !== null) {
        window.clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!supported || !autoPlay || !currentCard) return;
    speak(currentCard.word, { rate: speechRate });
  }, [supported, autoPlay, currentCard, speak, speechRate]);

  const onActionReview = (mastered: boolean) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(mastered ? [24] : [10, 28, 10]);
    }

    setFeedback(mastered ? 'mastered' : 'review');
    if (feedbackTimeoutRef.current !== null) {
      window.clearTimeout(feedbackTimeoutRef.current);
    }
    feedbackTimeoutRef.current = window.setTimeout(() => {
      setFeedback(null);
    }, 320);

    handleReview(mastered);
  };
  
  return (
    <div className="fade-in">
      <HeroSection />
      <ProgressBar {...progress} />
      {!supported && (
        <div className="speech-warning">⚠️ 你的瀏覽器未開啟語音合成（SpeechSynthesis），暫時無法播放發音。</div>
      )}
      {supported && (
        <div className="speech-controls">
          <span>語速</span>
          <button className={`chip ${speechRate === 0.75 ? 'active' : ''}`} onClick={() => setSpeechRate(0.75)}>慢速</button>
          <button className={`chip ${speechRate === 0.9 ? 'active' : ''}`} onClick={() => setSpeechRate(0.9)}>正常</button>
          <button className={`chip ${speechRate === 1 ? 'active' : ''}`} onClick={() => setSpeechRate(1)}>偏快</button>
          <button className={`chip ${autoPlay ? 'active' : ''}`} onClick={() => setAutoPlay((v) => !v)}>{autoPlay ? '自動播放: 開' : '自動播放: 關'}</button>
        </div>
      )}
      
      {progress.total === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <div className="empty-title">単語がありません</div>
          <div className="empty-text">データを読み込み中...</div>
        </div>
      ) : (
        <>
          <Flashcard 
            card={currentCard} 
            isFlipped={isFlipped} 
            onFlip={() => setIsFlipped(!isFlipped)}
            onSpeakWord={() => currentCard && speak(currentCard.word, { rate: speechRate })}
            onSpeakExample={() => currentCard && speak(currentCard.example, { rate: speechRate })}
          />
          {!isFlipped && <div className="action-hint">可先翻卡查看答案，再選擇下方按鈕</div>}
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

  const dialogueTextSet = new Set(messages.map((item) => item.text.trim()));
  const practicePhrases = scenario.phrases.filter((phrase) => !dialogueTextSet.has(phrase.text.trim()));

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
                onPointerUp={() => triggerBubbleSpeech(msg.text)}
                aria-label={`播放：${speechText}`}
                title="點擊對話框播放發音"
              >
                <div className="chat-role">{roleLabel}</div>
                <span>{msg.text}</span>
              </button>
            );
          })}
        </div>

        <div className="phrase-bank">
          <div className="phrase-bank-title">播放設定與延伸練習</div>
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
          {practicePhrases.length > 0 && (
            <div className="phrase-chips">
              {practicePhrases.map((phrase, idx) => (
                <button
                  key={idx}
                  className="phrase-chip"
                  onClick={() => speak(phrase.text, { rate: speechRate })}
                  title={phrase.meaning}
                >
                  {phrase.text}
                </button>
              ))}
            </div>
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
