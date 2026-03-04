export type SigureResource = {
  id: string;
  title: string;
  description: string;
  level: 'N5' | 'N4' | 'N3';
  focus: string;
  url: string;
};

// Curated learning materials inspired by sigure.tw categories.
// Keep as external references (do not mirror full original content).
export const sigureResources: SigureResource[] = [
  {
    id: '50-sound',
    title: '五十音練習',
    description: '打好假名基礎，先練清音/濁音/拗音，再進入單字。',
    level: 'N5',
    focus: '發音 + 假名辨識',
    url: 'https://www.sigure.tw/quiz/practice/50/',
  },
  {
    id: 'verb-practice',
    title: '動詞變化練習',
    description: '集中練習 て形、た形、ない形、辭書形等核心變化。',
    level: 'N5',
    focus: '文法變化',
    url: 'https://www.sigure.tw/quiz/practice/verb/',
  },
  {
    id: 'vocab-drill',
    title: 'N5/N4/N3 單字練習',
    description: '按級別做單字快刷，配合本 App 的複習卡節奏。',
    level: 'N4',
    focus: '單字量提升',
    url: 'https://www.sigure.tw/quiz/practice/vocabulary/',
  },
  {
    id: 'grammar-feed',
    title: '文法測驗更新',
    description: '追最新文法題，先做題再回來整理錯題卡。',
    level: 'N3',
    focus: '文法應用',
    url: 'https://www.sigure.tw/center/library/latest',
  },
  {
    id: 'grammar-index',
    title: '文法總覽',
    description: '遇到不懂句型時，先查文法區，再加到會話模板。',
    level: 'N4',
    focus: '句型查詢',
    url: 'https://www.sigure.tw/learn-japanese/grammar/',
  },
];
