#!/usr/bin/env node
/**
 * Batch fill missing vocabulary entries - Round 2
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data');
const VOCAB_FILE = path.join(DATA_DIR, 'jlpt-vocab.json');
const WAITING_LIST_FILE = path.join(__dirname, '../waiting_list.json');

// Read files
const vocabData = JSON.parse(fs.readFileSync(VOCAB_FILE, 'utf8'));
const waitingList = JSON.parse(fs.readFileSync(WAITING_LIST_FILE, 'utf8'));

// Dictionary of fill data for round 2
const fillData = {
  "おかけください": {
    furigana: "おかけください",
    meaning: "請坐，請上座（敬語）",
    example: "どうぞおかけください",
    exampleMeaning: "請坐",
    exampleFurigana: "どうぞおかけください"
  },
  "おげんきで": {
    furigana: "おげんきで",
    meaning: "保重，祝您健康（道別時用）",
    example: "おげんきで、さようなら",
    exampleMeaning: "保重，再見",
    exampleFurigana: "おげんきで、さようなら"
  },
  "おまちどおさま": {
    furigana: "おまちどおさま",
    meaning: "讓您久等了（非常恭敬的說法）",
    example: "おまちどおさまでございました",
    exampleMeaning: "讓您久等了",
    exampleFurigana: "おまちどおさまでございました"
  },
  "こうして": {
    furigana: "こうして",
    meaning: "這樣，如此；於是",
    example: "こうして計画が始まった",
    exampleMeaning: "於是計劃開始了",
    exampleFurigana: "こうして計画(けいかく)が始(はじ)まった"
  },
  "こしらえる": {
    furigana: "こしらえる",
    meaning: "製作，製造；準備，籌措；打扮",
    example: "お茶をこしらえる",
    exampleMeaning: "沏茶，泡茶",
    exampleFurigana: "お茶(ちゃ)をこしらえる"
  },
  "こちらこそ": {
    furigana: "こちらこそ",
    meaning: "我才要（感謝您），彼此彼此",
    example: "こちらこそ、ありがとうございます",
    exampleMeaning: "我才要謝謝您",
    exampleFurigana: "こちらこそ、ありがとうございます"
  },
  "こっそり": {
    furigana: "こっそり",
    meaning: "悄悄地，偷偷地，暗中",
    example: "こっそり部屋を出た",
    exampleMeaning: "悄悄離開了房間",
    exampleFurigana: "こっそり部屋(へや)を出(で)た"
  },
  "こないだ": {
    furigana: "こないだ",
    meaning: "最近，前幾天（口語）",
    example: "こないだ会った人です",
    exampleMeaning: "是前幾天見到的人",
    exampleFurigana: "こないだ会(あ)った人(ひと)です"
  },
  "こぼす": {
    furigana: "こぼす",
    meaning: "灑，潑，溢出；透露，洩露",
    example: "水をこぼした",
    exampleMeaning: "把水灑了",
    exampleFurigana: "水(みず)をこぼした"
  },
  "こぼれる": {
    furigana: "こぼれる",
    meaning: "灑出，溢出；流露，露出",
    example: "涙がこぼれた",
    exampleMeaning: "眼淚流了出來",
    exampleFurigana: "涙(なみだ)がこぼれた"
  },
  "こらえる": {
    furigana: "こらえる",
    meaning: "忍受，忍耐，抑制",
    example: "痛みをこらえる",
    exampleMeaning: "忍受疼痛",
    exampleFurigana: "痛(いた)みをこらえる"
  },
  "こんばんは": {
    furigana: "こんばんは",
    meaning: "晚上好",
    example: "こんばんは、お元気ですか",
    exampleMeaning: "晚上好，您還好嗎",
    exampleFurigana: "こんばんは、お元気(げんき)ですか"
  },
  "ごくろうさま": {
    furigana: "ごくろうさま",
    meaning: "辛苦了，勞駕（對平輩或下級）",
    example: "ごくろうさま、お疲れ様",
    exampleMeaning: "辛苦了",
    exampleFurigana: "ごくろうさま、お疲(つか)れ様(さま)"
  },
  "ごぞんじですか": {
    furigana: "ごぞんじですか",
    meaning: "您知道嗎（尊敬語）",
    example: "ごぞんじですか、あの人のこと",
    exampleMeaning: "您知道那個人嗎",
    exampleFurigana: "ごぞんじですか、あの人(ひと)のこと"
  },
  "ごちそうさま": {
    furigana: "ごちそうさま",
    meaning: "謝謝款待（飯後用語）",
    example: "ごちそうさまでした",
    exampleMeaning: "謝謝款待（吃飽後說）",
    exampleFurigana: "ごちそうさまでした"
  },
  "ごめんください": {
    furigana: "ごめんください",
    meaning: "有人嗎，打擾了（進入別人家時）",
    example: "ごめんください、田中さんはいますか",
    exampleMeaning: "有人嗎，田中先生在嗎",
    exampleFurigana: "ごめんください、田中(たなか)さんはいますか"
  },
  "さきおととい": {
    furigana: "さきおととい",
    meaning: "大前天",
    example: "さきおとといのことです",
    exampleMeaning: "是大前天的事",
    exampleFurigana: "さきおとといのことです"
  },
  "さっさと": {
    furigana: "さっさと",
    meaning: "趕快，迅速，麻利",
    example: "さっさと片付けて",
    exampleMeaning: "趕快收拾",
    exampleFurigana: "さっさと片付(かたづ)けて"
  },
  "さようなら": {
    furigana: "さようなら",
    meaning: "再見（較正式的道別）",
    example: "さようなら、また明日",
    exampleMeaning: "再見，明天見",
    exampleFurigana: "さようなら、また明日(あした)"
  },
  "さわやか": {
    furigana: "さわやか",
    meaning: "清爽，爽朗，清新",
    example: "さわやかな朝です",
    exampleMeaning: "清爽的早晨",
    exampleFurigana: "さわやかな朝(あさ)です"
  },
  "しあさって": {
    furigana: "しあさって",
    meaning: "大後天",
    example: "しあさっては休みです",
    exampleMeaning: "大後天休息",
    exampleFurigana: "しあさっては休(やす)みです"
  },
  "しいんと": {
    furigana: "しいんと",
    meaning: "靜悄悄地，寂靜無聲",
    example: "しいんと静まり返る",
    exampleMeaning: "寂靜無聲",
    exampleFurigana: "しいんと静(しず)まり返(かえ)る"
  },
  "しっぽ": {
    furigana: "しっぽ",
    meaning: "尾巴；末尾，末端",
    example: "猫のしっぽ",
    exampleMeaning: "貓的尾巴",
    exampleFurigana: "猫(ねこ)のしっぽ"
  },
  "しつこい": {
    furigana: "しつこい",
    meaning: "糾纏不休的，執拗的；濃郁的（味道）",
    example: "しつこく頼む",
    exampleMeaning: "死纏爛打地請求",
    exampleFurigana: "しつこく頼(たの)む"
  },
  "しびれる": {
    furigana: "しびれる",
    meaning: "麻木，發麻；陶醉，著迷",
    example: "足がしびれた",
    exampleMeaning: "腳麻了",
    exampleFurigana: "足(あし)がしびれた"
  },
  "しぼむ": {
    furigana: "しぼむ",
    meaning: "枯萎，蔫；萎靡，沮喪",
    example: "花がしぼんだ",
    exampleMeaning: "花枯萎了",
    exampleFurigana: "花(はな)がしぼんだ"
  },
  "しみじみ": {
    furigana: "しみじみ",
    meaning: "深切地，痛切地；仔細品味",
    example: "しみじみと感じる",
    exampleMeaning: "深切地感受到",
    exampleFurigana: "しみじみと感(かん)じる"
  },
  "しゃがむ": {
    furigana: "しゃがむ",
    meaning: "蹲下，屈膝",
    example: "しゃがんで休む",
    exampleMeaning: "蹲下休息",
    exampleFurigana: "しゃがんで休(やす)む"
  },
  "しゃっくり": {
    furigana: "しゃっくり",
    meaning: "打嗝",
    example: "しゃっくりが止まらない",
    exampleMeaning: "打嗝止不住",
    exampleFurigana: "しゃっくりが止(と)まらない"
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
console.log('=== 日語詞條補全報告 - 第二批 ===');
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
