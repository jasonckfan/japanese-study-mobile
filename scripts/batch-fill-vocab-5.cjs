#!/usr/bin/env node
/**
 * Batch fill missing vocabulary entries - Round 5
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data');
const VOCAB_FILE = path.join(DATA_DIR, 'jlpt-vocab.json');
const WAITING_LIST_FILE = path.join(__dirname, '../waiting_list.json');

// Read files
const vocabData = JSON.parse(fs.readFileSync(VOCAB_FILE, 'utf8'));
const waitingList = JSON.parse(fs.readFileSync(WAITING_LIST_FILE, 'utf8'));

// Dictionary of fill data for round 5
const fillData = {
  "ためす": {
    furigana: "ためす",
    meaning: "嘗試，試驗；考驗",
    example: "新しい方法をためす",
    exampleMeaning: "嘗試新方法",
    exampleFurigana: "新(あたら)しい方法(ほうほう)をためす"
  },
  "ためらい": {
    furigana: "ためらい",
    meaning: "猶豫，躊躇",
    example: "ためらいなく答える",
    exampleMeaning: "毫不猶豫地回答",
    exampleFurigana: "ためらいなく答(こた)える"
  },
  "だい": {
    furigana: "だい",
    meaning: "第...（接數詞）；費用，價錢；大...（接名詞）",
    example: "だい一の問題",
    exampleMeaning: "第一個問題",
    exampleFurigana: "だい一(いち)の問題(もんだい)"
  },
  "だいじ": {
    furigana: "だいじ",
    meaning: "重要，要緊；珍重，保重",
    example: "健康がだいじだ",
    exampleMeaning: "健康最重要",
    exampleFurigana: "健康(けんこう)がだいじだ"
  },
  "だいじょうぶ": {
    furigana: "だいじょうぶ",
    meaning: "沒問題，沒關係；沒事，安全",
    example: "だいじょうぶ、心配しないで",
    exampleMeaning: "沒事，別擔心",
    exampleFurigana: "だいじょうぶ、心配(しんぱい)しないで"
  },
  "だいすき": {
    furigana: "だいすき",
    meaning: "非常喜歡，最喜歡",
    example: "猫がだいすきだ",
    exampleMeaning: "最喜歡貓",
    exampleFurigana: "猫(ねこ)がだいすきだ"
  },
  "だいに": {
    furigana: "だいに",
    meaning: "第二，其次",
    example: "だいに来る人",
    exampleMeaning: "第二個來的人",
    exampleFurigana: "だいに来(く)る人(ひと)"
  },
  "だいぶ": {
    furigana: "だいぶ",
    meaning: "很，相當；幾乎，差不多",
    example: "だいぶ良くなった",
    exampleMeaning: "好多了",
    exampleFurigana: "だいぶ良(よ)くなった"
  },
  "ちから": {
    furigana: "ちから",
    meaning: "力，力量；力氣；能力；權力",
    example: "ちからを合わせる",
    exampleMeaning: "齊心協力",
    exampleFurigana: "ちからを合(あ)わせる"
  },
  "ちち": {
    furigana: "ちち",
    meaning: "父親，爸爸（謙稱）",
    example: "ちちは会社員です",
    exampleMeaning: "父親是公司職員",
    exampleFurigana: "ちちは会社員(かいしゃいん)です"
  },
  "ちゃん": {
    furigana: "ちゃん",
    meaning: "（接人名後，對小孩或親密者的暱稱）小...",
    example: "花子ちゃん",
    exampleMeaning: "小花",
    exampleFurigana: "花子(はなこ)ちゃん"
  },
  "ちょっと": {
    furigana: "ちょっと",
    meaning: "一會兒，一下；稍微，有點；（後接否定）很難",
    example: "ちょっと待って",
    exampleMeaning: "等一下",
    exampleFurigana: "ちょっと待(ま)って"
  },
  "ついに": {
    furigana: "ついに",
    meaning: "終於，最後；竟然（沒想到）",
    example: "ついに夢が叶った",
    exampleMeaning: "夢想終於實現了",
    exampleFurigana: "ついに夢(ゆめ)が叶(かな)った"
  },
  "つかえる": {
    furigana: "つかえる",
    meaning: "為...服務，侍奉；使用（謙語）",
    example: "社長にごつかえしています",
    exampleMeaning: "為社長效力",
    exampleFurigana: "社長(しゃちょう)にごつかえしています"
  },
  "つかまえる": {
    furigana: "つかまえる",
    meaning: "抓住，逮住；捉拿",
    example: "犯人をつかまえる",
    exampleMeaning: "抓住犯人",
    exampleFurigana: "犯人(はんにん)をつかまえる"
  },
  "つかまる": {
    furigana: "つかまる",
    meaning: "被抓住，被捕；緊貼，附著",
    example: "泥棒がつかまった",
    exampleMeaning: "小偷被抓了",
    exampleFurigana: "泥棒(どろぼう)がつかまった"
  },
  "つかれる": {
    furigana: "つかれる",
    meaning: "疲勞，疲倦；用舊",
    example: "一日働いてつかれた",
    exampleMeaning: "工作了一天累了",
    exampleFurigana: "一日(いちにち)働(はたら)いてつかれた"
  },
  "つきあう": {
    furigana: "つきあう",
    meaning: "交往，來往；陪伴，奉陪",
    example: "彼とつきあっている",
    exampleMeaning: "和他交往",
    exampleFurigana: "彼(かれ)とつきあっている"
  },
  "つきあたり": {
    furigana: "つきあたり",
    meaning: "盡頭，終點；迎面，正面",
    example: "道のつきあたり",
    exampleMeaning: "路的盡頭",
    exampleFurigana: "道(みち)のつきあたり"
  },
  "つきびと": {
    furigana: "つきびと",
    meaning: "隨從，隨員；侍從",
    example: "社長のつきびととして行く",
    exampleMeaning: "作為社長的隨從去",
    exampleFurigana: "社長(しゃちょう)のつきびとして行(い)く"
  },
  "つきもの": {
    furigana: "つきもの",
    meaning: "附帶的東西；避免不了的事，必然的事",
    example: "これは仕事のつきものだ",
    exampleMeaning: "這是工作附帶的",
    exampleFurigana: "これは仕事(しごと)のつきものだ"
  },
  "つくえ": {
    furigana: "つくえ",
    meaning: "桌子，書桌",
    example: "つくえの上に置く",
    exampleMeaning: "放在桌子上",
    exampleFurigana: "つくえの上(うえ)に置(お)く"
  },
  "つくす": {
    furigana: "つくす",
    meaning: "做完，完成；竭盡，盡力",
    example: "全力をつくす",
    exampleMeaning: "竭盡全力",
    exampleFurigana: "全力(ぜんりょく)をつくす"
  },
  "つくづく": {
    furigana: "つくづく",
    meaning: "深切地，痛切地；仔細地",
    example: "つくづく感じる",
    exampleMeaning: "深切感受到",
    exampleFurigana: "つくづく感(かん)じる"
  },
  "つくね": {
    furigana: "つくね",
    meaning: "肉丸，雞肉丸（日式料理）",
    example: "つくねを食べる",
    exampleMeaning: "吃肉丸",
    exampleFurigana: "つくねを食(た)べる"
  },
  "つくり": {
    furigana: "つくり",
    meaning: "構造，結構；打扮，裝束；生長，成長",
    example: "体のつくり",
    exampleMeaning: "身體結構",
    exampleFurigana: "体(からだ)のつくり"
  },
  "つくりかえる": {
    furigana: "つくりかえる",
    meaning: "改造，改組；改編",
    example: "家をつくりかえる",
    exampleMeaning: "改造房子",
    exampleFurigana: "家(いえ)をつくりかえる"
  },
  "つくりだす": {
    furigana: "つくりだす",
    meaning: "創造出，創作出；造成，形成",
    example: "新記録をつくりだす",
    exampleMeaning: "創造新紀錄",
    exampleFurigana: "新(しん)記録(きろく)をつくりだす"
  },
  "つくりもの": {
    furigana: "つくりもの",
    meaning: "人造的東西；烹調的菜；虛構，捏造",
    example: "これはつくりものだ",
    exampleMeaning: "這是人造的/捏造的",
    exampleFurigana: "これはつくりものだ"
  },
  "つける": {
    furigana: "つける",
    meaning: "點燃，開；附上，添加；記錄；跟隨",
    example: "電気をつける",
    exampleMeaning: "開燈",
    exampleFurigana: "電気(でんき)をつける"
  },
  "つごう": {
    furigana: "つごう",
    meaning: "方便，合適；情況，關係",
    example: "つごうがいい時間",
    exampleMeaning: "方便的時間",
    exampleFurigana: "つごうがいい時間(じかん)"
  },
  "つたえる": {
    furigana: "つたえる",
    meaning: "傳達，傳遞；告訴，傳授",
    example: "メッセージをつたえる",
    exampleMeaning: "傳達信息",
    exampleFurigana: "メッセージをつたえる"
  },
  "つづける": {
    furigana: "つづける",
    meaning: "繼續，持續；連續",
    example: "勉強をつづける",
    exampleMeaning: "繼續學習",
    exampleFurigana: "勉強(べんきょう)をつづける"
  },
  "つづく": {
    furigana: "つづく",
    meaning: "繼續，連續；接著，連著",
    example: "雨がつづく",
    exampleMeaning: "雨持續下",
    exampleFurigana: "雨(あめ)がつづく"
  },
  "つづり": {
    furigana: "つづり",
    meaning: "拼寫，拼法",
    example: "つづりを間違える",
    exampleMeaning: "拼寫錯誤",
    exampleFurigana: "つづりを間違(まちが)える"
  },
  "つづる": {
    furigana: "つづる",
    meaning: "寫，書寫；拼寫；創作",
    example: "手紙をつづる",
    exampleMeaning: "寫信",
    exampleFurigana: "手紙(てがみ)をつづる"
  },
  "つとめる": {
    furigana: "つとめる",
    meaning: "努力，盡力；服務，工作",
    example: "会社につとめる",
    exampleMeaning: "在公司工作",
    exampleFurigana: "会社(かいしゃ)につとめる"
  },
  "つねに": {
    furigana: "つねに",
    meaning: "常，經常，總是",
    example: "つねに心がけている",
    exampleMeaning: "經常注意",
    exampleFurigana: "つねに心(こころ)がけている"
  },
  "つのる": {
    furigana: "つのる",
    meaning: "加強，增強；加劇",
    example: "寒さがつのる",
    exampleMeaning: "寒冷加劇",
    exampleFurigana: "寒(さむ)さがつのる"
  },
  "つぶやく": {
    furigana: "つぶやく",
    meaning: "嘟囔，自言自語；嘀咕",
    example: "何かつぶやいている",
    exampleMeaning: "在嘀咕什麼",
    exampleFurigana: "何(なに)かつぶやいている"
  },
  "つぶれる": {
    furigana: "つぶれる",
    meaning: "破產，倒閉；失敗，落空",
    example: "会社がつぶれた",
    exampleMeaning: "公司倒閉了",
    exampleFurigana: "会社(かいしゃ)がつぶれた"
  },
  "つまずく": {
    furigana: "つまずく",
    meaning: "絆倒，摔跤；受挫，失敗",
    example: "石につまずく",
    exampleMeaning: "被石頭絆倒",
    exampleFurigana: "石(いし)につまずく"
  },
  "つまみ": {
    furigana: "つまみ",
    meaning: "下酒菜，小菜；捏，撮；把手",
    example: "つまみを食べる",
    exampleMeaning: "吃下酒菜",
    exampleFurigana: "つまみを食(た)べる"
  },
  "つまらない": {
    furigana: "つまらない",
    meaning: "無聊的，沒意思的；無價值的；吝嗇的",
    example: "つまらない映画だ",
    exampleMeaning: "無聊的電影",
    exampleFurigana: "つまらない映画(えいが)だ"
  },
  "つみ": {
    furigana: "つみ",
    meaning: "罪，罪行；罪過，過錯",
    example: "罪を犯す",
    exampleMeaning: "犯罪",
    exampleFurigana: "罪(つみ)を犯(おか)す"
  },
  "つむ": {
    furigana: "つむ",
    meaning: "編織，編；組合，構成",
    example: "セーターをつむ",
    exampleMeaning: "織毛衣",
    exampleFurigana: "セーターをつむ"
  },
  "つもり": {
    furigana: "つもり",
    meaning: "打算，計劃；估計，預定",
    example: "明日行くつもりだ",
    exampleMeaning: "打算明天去",
    exampleFurigana: "明日(あした)行(い)くつもりだ"
  },
  "つよい": {
    furigana: "つよい",
    meaning: "強的，強壯的；堅強的；擅長的；濃的",
    example: "体がつよい",
    exampleMeaning: "身體強壯",
    exampleFurigana: "体(からだ)がつよい"
  },
  "つらい": {
    furigana: "つらい",
    meaning: "痛苦的，難受的；殘酷的，苛刻的",
    example: "胸がつらい",
    exampleMeaning: "心裡痛苦",
    exampleFurigana: "胸(むね)がつらい"
  },
  "つる": {
    furigana: "つる",
    meaning: "吊，掛；釣魚；勾引，吸引",
    example: "絵を壁につる",
    exampleMeaning: "把畫掛在牆上",
    exampleFurigana: "絵(え)を壁(かべ)につる"
  },
  "つれる": {
    furigana: "つれる",
    meaning: "帶領，率領；帶同，伴隨",
    example: "子どもをつれて行く",
    exampleMeaning: "帶孩子去",
    exampleFurigana: "子(こ)どもをつれて行(い)く"
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
console.log('=== 日語詞條補全報告 - 第五批 ===');
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
