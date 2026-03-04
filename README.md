# 日本語道場 (Nihongo Dojo)

A mobile-first Japanese learning web app with vocabulary flashcards and conversation practice.

## Features

### 📚 Vocabulary Memory Training
- Flashcards with furigana, Chinese meanings, and example sentences
- Spaced repetition scheduling (再學習 / 已掌握)
- Progress tracking with mastery levels (N5/N4)
- LocalStorage persistence

### 💬 Conversation Practice
- 6 situational scenarios: Restaurant, Office, Travel, Shopping, Train, Hospital
- Role-play chat practice with phrase banks
- Character role indicators

## Tech Stack

- React 18
- TypeScript
- Vite
- CSS (custom styles, mobile-first)
- localStorage for data persistence

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/       # React components
├── data/            # Sample vocab and scenarios
├── hooks/           # Custom hooks (useVocab, useStats)
├── styles/          # CSS styles
├── types/           # TypeScript interfaces
└── App.tsx          # Main app component
```

## Sample Data

- **25 vocabulary words** (N5/N4 level)
- **6 conversation scenarios**

## Mobile-First Design

The app is designed with a mobile-first approach:
- Dark navy hero section with large Japanese typography
- Bottom tab navigation
- Rounded card panels
- Touch-friendly interactions with micro-animations

## License

MIT
