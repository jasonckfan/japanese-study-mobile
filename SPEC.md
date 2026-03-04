# Japanese Learning Web App - Specification

## Project Overview
- **Project Name**: 日本語道場 (Nihongo Dojo)
- **Type**: Mobile-first web application (PWA-ready)
- **Core Functionality**: Japanese vocabulary memorization with flashcards + situational conversation practice
- **Target Users**: Japanese learners (N5-N4 level)

## UI/UX Specification

### Layout Structure
- **Mobile-first**: 375px base width, scales up to tablet/desktop
- **Header**: Fixed top navigation with app title
- **Tab Navigation**: Bottom fixed tabs (Vocabulary / Conversations / Progress)
- **Content Area**: Scrollable main content below header, above tabs

### Responsive Breakpoints
- Mobile: 375px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

### Visual Design

#### Color Palette
- **Primary Dark**: #0A1628 (deep navy hero background)
- **Secondary Dark**: #1A2744 (card backgrounds)
- **Accent Gold**: #F5C842 (Japanese seal red-orange accent - using gold instead for elegance)
- **Accent Coral**: #FF6B6B (action buttons, highlights)
- **Text Primary**: #FFFFFF
- **Text Secondary**: #A8B4C4
- **Success Green**: #4ADE80 (mastered state)
- **Warning Orange**: #FB923C (review needed)

#### Typography
- **Japanese Display**: "Noto Serif JP", serif - large hero text (2.5rem+)
- **Japanese Body**: "Noto Sans JP", sans-serif
- **UI Text**: System fonts for labels
- **Furigana**: 0.75rem above kanji

#### Spacing System
- Base unit: 4px
- Card padding: 16px (4 units)
- Section gaps: 24px
- Safe area padding: 16px horizontal

#### Visual Effects
- Card shadows: 0 4px 20px rgba(0,0,0,0.3)
- Border radius: 16px for cards, 24px for hero cards
- Subtle gradient overlays on hero
- Glassmorphism on navigation: backdrop-filter blur

### Components

#### Hero Section
- Dark navy background with subtle pattern
- Large Japanese text (title)
- Subtitle in English
- Decorative Japanese characters as background art

#### Flashcard Component
- Front: Japanese word + furigana
- Back: Chinese meaning + example sentence + progress
- Flip animation (3D transform)
- Action buttons: 再學習 (review again) / 已掌握 (mastered)

#### Progress Indicator
- Circular or linear progress bar
- Shows cards studied / total
- Color coding for mastery level

#### Conversation Scenario Card
- Scenario title with icon
- Brief description
- Tap to expand into practice view

#### Chat Practice View
- Chat bubble style messages
- User input area
- Phrase suggestions bank
- Character role indicators

#### Tab Bar
- 3 tabs: 単語 (Vocabulary), 会話 (Conversation), 進捗 (Progress)
- Active state: accent color + icon filled
- Smooth transition between tabs

### Micro-interactions
- Button press: scale(0.95) + haptic-style feedback
- Card flip: 0.6s 3D rotation
- Tab switch: slide transition
- Progress update: animated counter
- Success state: confetti-style particles (CSS only)

## Functionality Specification

### Feature A: Vocabulary Memory Training

#### Flashcard System
- Display one card at a time
- Tap to flip and reveal answer
- Spaced repetition scheduling:
  - New cards start with interval = 0
  - "再學習" resets interval to 1 day
  - "已掌握" increases interval: 1 → 3 → 7 → 14 → 30 days
- Progress counter: X / Y cards studied today
- localStorage persistence for card states

#### Card Data Structure
```typescript
interface VocabCard {
  id: string;
  word: string;        // 漢字
  furigana: string;   // ふりがな
  meaning: string;    // 中文 meaning
  example: string;    // 例文
  exampleMeaning: string;
  level: 'N5' | 'N4';
  nextReview: number; // timestamp
  interval: number;   // days
  reviewCount: number;
  mastered: boolean;
}
```

### Feature B: Conversation Training

#### Scenario System
- 6 predefined- Each scenarios
 scenario has:
  - Title (JP + CN)
  - Context description
  - Role prompts (Customer/Staff)
  - Phrase bank (useful sentences)
  - Chat practice mode

#### Chat Practice View
- Scenario context header
- Chat message list (scrollable)
- Input field for user responses
- Phrase bank chips for quick input
- Character avatars/indicators

#### Scenario Data Structure
```typescript
interface ConversationScenario {
  id: string;
  title: string;
  titleCn: string;
  icon: string;
  context: string;
  contextCn: string;
  roles: { id: string; name: string; nameCn: string }[];
  phrases: { text: string; meaning: string; }[];
  dialogues: { role: string; text: string; }[];
}
```

### Feature C: Progress Tracking
- Total words mastered count
- Words due for review
- Study streak (days)
- Last study date
- Per-scenario completion

### Data Persistence
- All progress saved to localStorage
- Keys: 'nihongo-vocab', 'nihongo-conversations', 'nihongo-stats'
- Auto-save on every action

## Sample Data

### Vocabulary (20+ words)
N5: 食べる, 飲む, 行く, 来る, 見る, 聞く, 書く, 読む, 話す, 買う, 売る, 見る, 美しい, 面白い, 近い, 遠い, 大きい, 小さい, 新しい, 古い
N4: 必要がある, ようになる, ために, しかし, だから, ようです, はずです, endaru

### Scenarios (6)
1. レストラン (Restaurant)
2. オフィス (Office)
3. 旅行 (Travel)
4. 買い物 (Shopping)
5. 電車 (Train/Commute)
6. 病院 (Hospital)

## Acceptance Criteria

### Visual
- [ ] Dark navy hero with large Japanese typography visible on load
- [ ] Cards have 16px border radius, visible shadows
- [ ] Tab bar fixed at bottom, visible on all screens
- [ ] Responsive: readable on 375px width

### Functional
- [ ] Flashcards flip on tap
- [ ] Progress saves to localStorage and persists on reload
- [ ] "再學習" and "已掌握" buttons update card state
- [ ] Conversation scenarios expand to practice view
- [ ] Phrase bank chips can be tapped to insert text

### Technical
- [ ] npm install completes without errors
- [ ] npm run build succeeds
- [ ] No TypeScript errors
- [ ] Clean component structure in src/

## Tech Stack
- React 18
- TypeScript
- Vite
- CSS Modules or styled-components
- localStorage API
