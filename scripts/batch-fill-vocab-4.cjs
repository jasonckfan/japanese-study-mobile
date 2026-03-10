#!/usr/bin/env node
/**
 * Batch fill missing vocabulary entries - Round 4
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data');
const VOCAB_FILE = path.join(DATA_DIR, 'jlpt-vocab.json');
const WAITING_LIST_FILE = path.join(__dirname, '../waiting_list.json');

// Read files
const vocabData = JSON.parse(fs.readFileSync(VOCAB_FILE, 'utf8'));
const waitingList = JSON.parse(fs.readFileSync(WAITING_LIST_FILE, 'utf8'));

// Dictionary of fill data for round 4
const fillData = {
  "ずらり": {
    furigana: "ずらり",
    meaning: "一排，一列；一大排",
    example: "ずらりと並んでいる",
    exampleMeaning: "排成一大排",
    exampleFurigana: "ずらりと並(なら)んでいる"
  },
  "せっせと": {
    furigana: "せっせと",
    meaning: "勤奮地，不停地，孜孜不倦地",
    example: "せっせと働く",
    exampleMeaning: "勤奮工作",
    exampleFurigana: "せっせと働(はたら)く"
  },
  "せめて": {
    furigana: "せめて",
    meaning: "至少，起碼；總算",
    example: "せめて一度は行きたい",
    exampleMeaning: "至少想去一次",
    exampleFurigana: "せめて一度(いちど)は行(い)きたい"
  },
  "ぜひとも": {
    furigana: "ぜひとも",
    meaning: "務必，一定，無論如何",
    example: "ぜひともお願いします",
    exampleMeaning: "務必拜託您",
    exampleFurigana: "ぜひともお願(ねが)いします"
  },
  "そういえば": {
    furigana: "そういえば",
    meaning: "說起來，對了，這麼說來",
    example: "そういえば、昨日会ったね",
    exampleMeaning: "說起來，昨天見過呢",
    exampleFurigana: "そういえば、昨日(きのう)会(あ)ったね"
  },
  "そうっと": {
    furigana: "そうっと",
    meaning: "悄悄地，輕輕地（比「そっと」更強調）",
    example: "そうっと近づく",
    exampleMeaning: "悄悄靠近",
    exampleFurigana: "そうっと近(ちか)づく"
  },
  "そそっかしい": {
    furigana: "そそっかしい",
    meaning: "粗心大意的，冒冒失失的",
    example: "そそっかしい性格だ",
    exampleMeaning: "粗心大意的性格",
    exampleFurigana: "そそっかしい性格(せいかく)だ"
  },
  "そのうえ": {
    furigana: "そのうえ",
    meaning: "而且，再加上，此外",
    example: "そのうえ、雨も降ってきた",
    exampleMeaning: "而且，還下起雨來了",
    exampleFurigana: "そのうえ、雨(あめ)も降(ふ)ってきた"
  },
  "そのころ": {
    furigana: "そのころ",
    meaning: "那時候，那個時候",
    example: "そのころ、私はまだ学生だった",
    exampleMeaning: "那時候，我還是學生",
    exampleFurigana: "そのころ、私(わたし)はまだ学生(がくせい)だった"
  },
  "そのため": {
    furigana: "そのため",
    meaning: "因此，所以，為此",
    example: "そのため、計画は中止になった",
    exampleMeaning: "因此，計劃中止了",
    exampleFurigana: "そのため、計画(けいかく)は中止(ちゅうし)になった"
  },
  "そのほか": {
    furigana: "そのほか",
    meaning: "其他，此外，另外",
    example: "そのほかに何か質問は？",
    exampleMeaning: "還有其他問題嗎？",
    exampleFurigana: "そのほかに何(なに)か質問(しつもん)は？"
  },
  "それなのに": {
    furigana: "それなのに",
    meaning: "儘管如此，明明...卻...",
    example: "それなのに、彼は来なかった",
    exampleMeaning: "儘管如此，他沒有來",
    exampleFurigana: "それなのに、彼(かれ)は来(こ)なかった"
  },
  "それほど": {
    furigana: "それほど",
    meaning: "那麼，那樣地；（後接否定）並不那麼",
    example: "それほど難しくない",
    exampleMeaning: "並不那麼難",
    exampleFurigana: "それほど難(むずか)しくない"
  },
  "たいてい": {
    furigana: "たいてい",
    meaning: "大都，大部分；大概，大致",
    example: "たいていの人は知っている",
    exampleMeaning: "大部分人都知道",
    exampleFurigana: "たいていの人(ひと)は知(し)っている"
  },
  "たいへん": {
    furigana: "たいへん",
    meaning: "非常，很；夠嗆，不得了；嚴重",
    example: "たいへんお世話になりました",
    exampleMeaning: "非常感謝您的關照",
    exampleFurigana: "たいへんお世話(せわ)になりました"
  },
  "たがいに": {
    furigana: "たがいに",
    meaning: "互相，相互",
    example: "たがいに助け合う",
    exampleMeaning: "互相幫助",
    exampleFurigana: "たがいに助(たす)け合(あ)う"
  },
  "たくさん": {
    furigana: "たくさん",
    meaning: "很多，許多，大量",
    example: "たくさんの人が集まった",
    exampleMeaning: "聚集了很多人",
    exampleFurigana: "たくさんの人(ひと)が集(あつ)まった"
  },
  "たしかめる": {
    furigana: "たしかめる",
    meaning: "確認，核實，查明",
    example: "事実をたしかめる",
    exampleMeaning: "確認事實",
    exampleFurigana: "事実(じじつ)をたしかめる"
  },
  "たずねる": {
    furigana: "たずねる",
    meaning: "訪問，拜訪；詢問，打聽",
    example: "友人をたずねる",
    exampleMeaning: "拜訪朋友",
    exampleFurigana: "友人(ゆうじん)をたずねる"
  },
  "たつ": {
    furigana: "たつ",
    meaning: "經過，過（時間）；超過",
    example: "一年がたった",
    exampleMeaning: "過了一年",
    exampleFurigana: "一年(いちねん)がたった"
  },
  "たっぷり": {
    furigana: "たっぷり",
    meaning: "充分，足夠；寬敞，肥大",
    example: "たっぷり睡眠をとる",
    exampleMeaning: "充分睡眠",
    exampleFurigana: "たっぷり睡眠(すいみん)をとる"
  },
  "たてる": {
    furigana: "たてる",
    meaning: "豎起，立起；制定；創立",
    example: "看板をたてる",
    exampleMeaning: "豎起招牌",
    exampleFurigana: "看板(かんばん)をたてる"
  },
  "たとえ": {
    furigana: "たとえ",
    meaning: "即使，縱然，哪怕",
    example: "たとえ雨が降っても行く",
    exampleMeaning: "即使下雨也要去",
    exampleFurigana: "たとえ雨(あめ)が降(ふ)っても行(い)く"
  },
  "たとえる": {
    furigana: "たとえる",
    meaning: "比喻，比方，舉例",
    example: "花にたとえる",
    exampleMeaning: "比喻成花",
    exampleFurigana: "花(はな)にたとえる"
  },
  "たのしみ": {
    furigana: "たのしみ",
    meaning: "期待，樂趣；消遣，娛樂",
    example: "旅行がたのしみだ",
    exampleMeaning: "期待旅行",
    exampleFurigana: "旅行(りょこう)がたのしみだ"
  },
  "たのもしい": {
    furigana: "たのもしい",
    meaning: "可靠的，靠得住的；有希望的",
    example: "たのもしい仲間だ",
    exampleMeaning: "可靠的夥伴",
    exampleFurigana: "たのもしい仲間(なかま)だ"
  },
  "たま": {
    furigana: "たま",
    meaning: "球；玉，寶石；子彈；蛋",
    example: "たまを投げる",
    exampleMeaning: "扔球",
    exampleFurigana: "たまを投(な)げる"
  },
  "たまご": {
    furigana: "たまご",
    meaning: "蛋，雞蛋；卵",
    example: "たまごを焼く",
    exampleMeaning: "煎蛋",
    exampleFurigana: "たまごを焼(や)く"
  },
  "たまる": {
    furigana: "たまる",
    meaning: "積攢，積存；積壓；容忍",
    example: "ゴミがたまる",
    exampleMeaning: "垃圾堆積",
    exampleFurigana: "ゴミがたまる"
  },
  "ためいき": {
    furigana: "ためいき",
    meaning: "嘆息，嘆氣",
    example: "ためいきをつく",
    exampleMeaning: "嘆氣",
    exampleFurigana: "ためいきをつく"
  }
};

// Process entries
let processedCount = 0;
const processedIds = [];
const remainingEntries = [];

for (const entry of waitingList) {
  const word = entry.word;
  
  // Skip invalid entries
  if (word === '×' || word === 'Ͼ立' || word.includes('Ͼ') || word.includes('×')) {
    remainingEntries.push(entry);
    continue;
  }
  
  // Check if we have fill data for this word
  if (fillData[word]) {
    // Find and update the entry in vocabData
    const vocabEntry = vocabData.find(v => v.id === entry.id);
    if (vocabEntry) {
      vocabEntry.furigana = fillData[word].furigana;
      vocabEntry.meaning = fillData[word].meaning;
      vocabEntry.example = fillData[word].example;
      vocabEntry.exampleMeaning = fillData[word].exampleMeaning;
      vocabEntry.exampleFurigana = fillData[word].exampleFurigana;
      
      processedCount++;
      processedIds.push(entry.id);
    }
  } else {
    // Keep in waiting list if no fill data
    remainingEntries.push(entry);
  }
}

// Save updated vocab file
fs.writeFileSync(VOCAB_FILE, JSON.stringify(vocabData, null, 2), 'utf8');

// Save updated waiting list
fs.writeFileSync(WAITING_LIST_FILE, JSON.stringify(remainingEntries, null, 2), 'utf8');

// Output report
console.log('=== 日語詞條補全報告 - 第四批 ===');
console.log(`本次處理數量: ${processedCount}`);
console.log(`剩餘待補數量: ${remainingEntries.length}`);
console.log('');
console.log('已處理詞條 ID:');
processedIds.forEach(id => console.log(`  - ${id}`));
console.log('');
console.log('下一步建議:');
console.log(`  1. 繼續補充剩餘 ${remainingEntries.length} 個詞條`);
console.log('  2. 優先處理含漢字的詞條（需確認讀音）');
console.log('  3. 清理 waiting_list 中的無效條目（如 ×、Ͼ立 等）');
