import React, { useEffect, useRef, useState } from 'react';
import { useVocab } from './hooks/useVocab';
import { initialScenarios } from './data/vocab';
import './styles/App.css';

type TabType = 'vocab' | 'conversation' | 'progress';

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
}> = ({ card, isFlipped, onFlip }) => {
  if (!card) return null;
  
  return (
    <div className="flashcard-container">
      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={onFlip}>
        <div className="flashcard-face flashcard-front">
          <span className={`flashcard-level ${card.level}`}>{card.level}</span>
          <div className="flashcard-word">{card.word}</div>
          <div className="flashcard-furigana">{card.furigana}</div>
          <div className="flashcard-hint">タップして答えを見る</div>
        </div>
        <div className="flashcard-face flashcard-back">
          <span className={`flashcard-level ${card.level}`}>{card.level}</span>
          <div className="flashcard-meaning">{card.meaning}</div>
          <div className="flashcard-example">
            <div className="flashcard-example-jp">{card.example}</div>
            <div className="flashcard-example-cn">{card.exampleMeaning}</div>
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
  const [feedback, setFeedback] = useState<'mastered' | 'review' | null>(null);
  const feedbackTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current !== null) {
        window.clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

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
  const [_inputText, setInputText] = useState('');
  
  const handlePhraseClick = (text: string) => {
    setInputText(text);
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
        
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble ${msg.role === 'customer' ? 'customer' : 'staff'}`}>
              <div className="chat-role">
                {msg.role === 'customer' ? scenario.roles[0].nameCn : scenario.roles[1].nameCn}
              </div>
              {msg.text}
            </div>
          ))}
        </div>
        
        <div className="phrase-bank">
          <div className="phrase-bank-title">フレーズ bank</div>
          <div className="phrase-chips">
            {scenario.phrases.map((phrase, idx) => (
              <button 
                key={idx} 
                className="phrase-chip"
                onClick={() => handlePhraseClick(phrase.text)}
                title={phrase.meaning}
              >
                {phrase.text}
              </button>
            ))}
          </div>
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
        {activeTab === 'progress' && <ProgressView />}
      </main>
      
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;
