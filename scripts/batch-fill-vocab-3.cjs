#!/usr/bin/env node
/**
 * Batch fill missing vocabulary entries - Round 3
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data');
const VOCAB_FILE = path.join(DATA_DIR, 'jlpt-vocab.json');
const WAITING_LIST_FILE = path.join(__dirname, '../waiting_list.json');

// Read files
const vocabData = JSON.parse(fs.readFileSync(VOCAB_FILE, 'utf8'));
const waitingList = JSON.parse(fs.readFileSync(WAITING_LIST_FILE, 'utf8'));

// Dictionary of fill data for round 3
const fillData = {
  "しゃぶる": {
    furigana: "しゃぶる",
    meaning: "舔，含在嘴裡；涮（火鍋）",
    example: "鍋をしゃぶる",
    exampleMeaning: "涮火鍋",
    exampleFurigana: "鍋(なべ)をしゃぶる"
  },
  "しょうがない": {
    furigana: "しょうがない",
    meaning: "沒辦法，無可奈何；沒用，無能為力",
    example: "しょうがない、諦めよう",
    exampleMeaning: "沒辦法，放棄吧",
    exampleFurigana: "しょうがない、諦(あきら)めよう"
  },
  "じゃんけん": {
    furigana: "じゃんけん",
    meaning: "剪刀石頭布，猜拳",
    example: "じゃんけんで決める",
    exampleMeaning: "用猜拳決定",
    exampleFurigana: "じゃんけんで決(き)める"
  },
  "じゅうたん": {
    furigana: "じゅうたん",
    meaning: "地毯",
    example: "じゅうたんを敷く",
    exampleMeaning: "鋪地毯",
    exampleFurigana: "じゅうたんを敷(し)く"
  },
  "すくなくとも": {
    furigana: "すくなくとも",
    meaning: "至少，起碼",
    example: "すくなくとも三日はかかる",
    exampleMeaning: "至少要花三天",
    exampleFurigana: "すくなくとも三日(みっか)はかかる"
  },
  "すっきり": {
    furigana: "すっきり",
    meaning: "暢快，舒暢；乾淨利落；完全",
    example: "すっきりした気分だ",
    exampleMeaning: "心情暢快",
    exampleFurigana: "すっきりした気分(きぶん)だ"
  },
  "すっぱい": {
    furigana: "すっぱい",
    meaning: "酸的",
    example: "レモンはすっぱい",
    exampleMeaning: "檸檬是酸的",
    exampleFurigana: "レモンはすっぱい"
  },
  "すまない": {
    furigana: "すまない",
    meaning: "對不起，抱歉；過意不去；沒臉見人",
    example: "すまない、遅くなった",
    exampleMeaning: "對不起，來晚了",
    exampleFurigana: "すまない、遅(おそ)くなった"
  },
  "すれちがう": {
    furigana: "すれちがう",
    meaning: "擦肩而過，錯過；不一致",
    example: "駅で友人とすれちがった",
    exampleMeaning: "在車站和朋友擦肩而過",
    exampleFurigana: "駅(えき)で友人(ゆうじん)とすれちがった"
  },
  "ずうずうしい": {
    furigana: "ずうずうしい",
    meaning: "厚臉皮的，厚顏無恥的",
    example: "ずうずうしい人だ",
    exampleMeaning: "厚臉皮的人",
    exampleFurigana: "ずうずうしい人(ひと)だ"
  },
  "ずうっと": {
    furigana: "ずうっと",
    meaning: "一直，始終（比「ずっと」更強調）",
    example: "ずうっと待っていた",
    exampleMeaning: "一直等著",
    exampleFurigana: "ずうっと待(ま)っていた"
  },
  "ずらす": {
    furigana: "ずらす",
    meaning: "移動，挪開；錯開（時間）",
    example: "予定を一日ずらす",
    exampleMeaning: "把計劃推遲一天",
    exampleFurigana: "予定(よてい)を一日(いちにち)ずらす"
  },
  "ずれる": {
    furigana: "ずれる",
    meaning: "偏移，錯位；偏離",
    example: "時計がずれた",
    exampleMeaning: "錶慢了/快了",
    exampleFurigana: "時計(とけい)がずれた"
  },
  "そっと": {
    furigana: "そっと",
    meaning: "悄悄地，輕輕地",
    example: "そっとドアを閉める",
    exampleMeaning: "輕輕關門",
    exampleFurigana: "そっとドアを閉(し)める"
  },
  "そばから": {
    furigana: "そばから",
    meaning: "剛...就...，隨即",
    example: "覚えるそばから忘れる",
    exampleMeaning: "剛記住就忘了",
    exampleFurigana: "覚(おぼ)えるそばから忘(わす)れる"
  },
  "そろそろ": {
    furigana: "そろそろ",
    meaning: "就要，快要；漸漸地；慢慢地",
    example: "そろそろ行きましょう",
    exampleMeaning: "差不多該走了",
    exampleFurigana: "そろそろ行(い)きましょう"
  },
  "たいした": {
    furigana: "たいした",
    meaning: "了不起的，驚人的；（接否定）不算什麼",
    example: "たいした問題ではない",
    exampleMeaning: "不算什麼大問題",
    exampleFurigana: "たいした問題(もんだい)ではない"
  },
  "たいして": {
    furigana: "たいして",
    meaning: "（後接否定）並不怎麼，沒什麼",
    example: "たいして難しくない",
    exampleMeaning: "並不怎麼難",
    exampleFurigana: "たいして難(むずか)しくない"
  },
  "たがる": {
    furigana: "たがる",
    meaning: "想...，希望...（第三人稱的願望）",
    example: "子どもが行きたがっている",
    exampleMeaning: "孩子想去",
    exampleFurigana: "子(こ)どもが行(い)きたがっている"
  },
  "たしか": {
    furigana: "たしか",
    meaning: "確實，確切；大概，也許",
    example: "たしか、明日だ",
    exampleMeaning: "確實是明天",
    exampleFurigana: "たしか、明日(あした)だ"
  },
  "たしかに": {
    furigana: "たしかに",
    meaning: "確實，的確",
    example: "たしかにその通りだ",
    exampleMeaning: "確實如此",
    exampleFurigana: "たしかにその通(とお)りだ"
  },
  "ただ": {
    furigana: "ただ",
    meaning: "免費；只，僅；不過，只是；但，但是",
    example: "ただで貰える",
    exampleMeaning: "免費得到",
    exampleFurigana: "ただで貰(もら)える"
  },
  "ただし": {
    furigana: "ただし",
    meaning: "但是，然而，可是",
    example: "参加できる。ただし、予約が必要だ",
    exampleMeaning: "可以參加。但是，需要預約",
    exampleFurigana: "参加(さんか)できる。ただし、予約(よやく)が必要(ひつよう)だ"
  },
  "たまに": {
    furigana: "たまに",
    meaning: "偶爾，有時候",
    example: "たまに映画を見る",
    exampleMeaning: "偶爾看電影",
    exampleFurigana: "たまに映画(えいが)を見(み)る"
  },
  "ためらう": {
    furigana: "ためらう",
    meaning: "猶豫，躊躇",
    example: "ためらわずに答える",
    exampleMeaning: "毫不猶豫地回答",
    exampleFurigana: "ためらわずに答(こた)える"
  },
  "ちゃんと": {
    furigana: "ちゃんと",
    meaning: "好好地，規規矩矩地；準確地，確實",
    example: "ちゃんと聞いて",
    exampleMeaning: "好好聽著",
    exampleFurigana: "ちゃんと聞(き)いて"
  },
  "ちょうど": {
    furigana: "ちょうど",
    meaning: "正好，恰好；剛好，正合適",
    example: "ちょうどいい時間だ",
    exampleMeaning: "正好合適的時間",
    exampleFurigana: "ちょうどいい時間(じかん)だ"
  },
  "ちらっと": {
    furigana: "ちらっと",
    meaning: "一閃，一晃；稍微，略微",
    example: "ちらっと見ただけだ",
    exampleMeaning: "只是瞥了一眼",
    exampleFurigana: "ちらっと見(み)ただけだ"
  },
  "つい": {
    furigana: "つい",
    meaning: "不知不覺，不由得；緊接著",
    example: "つい忘れてしまった",
    exampleMeaning: "不知不覺就忘了",
    exampleFurigana: "つい忘(わす)れてしまった"
  },
  "ついで": {
    furigana: "ついで",
    meaning: "順便，順路；機會",
    example: "買い物のついでに寄る",
    exampleMeaning: "順便去購物",
    exampleFurigana: "買(か)い物(もの)のついでに寄(よ)る"
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
console.log('=== 日語詞條補全報告 - 第三批 ===');
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
