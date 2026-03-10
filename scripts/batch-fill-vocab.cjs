#!/usr/bin/env node
/**
 * Batch fill missing vocabulary entries
 * Processes entries from waiting_list.json and updates jlpt-vocab.json
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data');
const VOCAB_FILE = path.join(DATA_DIR, 'jlpt-vocab.json');
const WAITING_LIST_FILE = path.join(__dirname, '../waiting_list.json');

// Read files
const vocabData = JSON.parse(fs.readFileSync(VOCAB_FILE, 'utf8'));
const waitingList = JSON.parse(fs.readFileSync(WAITING_LIST_FILE, 'utf8'));

// Dictionary of fill data for common words
const fillData = {
  "いってらっしゃい": {
    furigana: "いってらっしゃい",
    meaning: "（對要出門的人說）您走好，路上小心",
    example: "いってらっしゃい、気をつけてね",
    exampleMeaning: "路上小心，注意安全哦",
    exampleFurigana: "いってらっしゃい、気(き)をつけてね"
  },
  "いってまいります": {
    furigana: "いってまいります",
    meaning: "（謙語）我走了，我去去就回",
    example: "では、いってまいります",
    exampleMeaning: "那麼，我走了",
    exampleFurigana: "では、いってまいります"
  },
  "いっていらっしゃい": {
    furigana: "いっていらっしゃい",
    meaning: "（對長輩或上司說）請慢走，路上小心",
    example: "部長、いっていらっしゃい",
    exampleMeaning: "部長，請慢走",
    exampleFurigana: "部長(ぶちょう)、いっていらっしゃい"
  },
  "いつのまにか": {
    furigana: "いつのまにか",
    meaning: "不知不覺間，不知什麼時候",
    example: "いつのまにか、春になっていた",
    exampleMeaning: "不知不覺間，春天已經來了",
    exampleFurigana: "いつのまにか、春(はる)になっていた"
  },
  "いよいよ": {
    furigana: "いよいよ",
    meaning: "終於，馬上，眼看就要；越發，更加",
    example: "いよいよ試験の日が来た",
    exampleMeaning: "考試的日子終於到了",
    exampleFurigana: "いよいよ試験(しけん)の日(ひ)が来(き)た"
  },
  "うっかり": {
    furigana: "うっかり",
    meaning: "不留神，不小心，糊里糊塗",
    example: "うっかり約束を忘れてしまった",
    exampleMeaning: "不小心忘記了約會",
    exampleFurigana: "うっかり約束(やくそく)を忘れ(わすれ)てしまった"
  },
  "うどん": {
    furigana: "うどん",
    meaning: "烏冬麵，日式粗麵條",
    example: "今日の昼ご飯はうどんです",
    exampleMeaning: "今天的午餐是烏冬麵",
    exampleFurigana: "今日(きょう)の昼ご飯(ひるごはん)はうどんです"
  },
  "うろうろ": {
    furigana: "うろうろ",
    meaning: "徘徊，無目的地走來走去；心神不定",
    example: "駅の周りをうろうろしている",
    exampleMeaning: "在車站周圍徘徊",
    exampleFurigana: "駅(えき)の周り(まわり)をうろうろしている"
  },
  "うんと": {
    furigana: "うんと",
    meaning: "用力地，猛地；很多，大量",
    example: "うんと勉強した",
    exampleMeaning: "用功學習了",
    exampleFurigana: "うんと勉強(べんきょう)した"
  },
  "ええと": {
    furigana: "ええと",
    meaning: "（猶豫時發出的聲音）嗯，那個",
    example: "ええと、何だっけ",
    exampleMeaning: "嗯，是什麼來著",
    exampleFurigana: "ええと、何(なん)だっけ"
  },
  "おおざっぱ": {
    furigana: "おおざっぱ",
    meaning: "粗略，草率，馬虎；大大咧咧",
    example: "彼は性格がおおざっぱだ",
    exampleMeaning: "他的性格大大咧咧",
    exampleFurigana: "彼(かれ)は性格(せいかく)がおおざっぱだ"
  },
  "おかげさまで": {
    furigana: "おかげさまで",
    meaning: "托您的福，多虧了您（用於感謝）",
    example: "おかげさまで、元気です",
    exampleMeaning: "托您的福，我很好",
    exampleFurigana: "おかげさまで、元気(げんき)です"
  },
  "おかず": {
    furigana: "おかず",
    meaning: "菜餚，下飯的菜（相對於米飯）",
    example: "おかずを買いに行く",
    exampleMeaning: "去買菜",
    exampleFurigana: "おかずを買い(かい)に行(い)く"
  },
  "おきのどくに": {
    furigana: "おきのどくに",
    meaning: "對不起，抱歉（用於打擾別人時）",
    example: "おきのどくに、すみません",
    exampleMeaning: "抱歉打擾了",
    exampleFurigana: "おきのどくに、すみません"
  },
  "おくさん": {
    furigana: "おくさん",
    meaning: "（稱呼別人的）太太，夫人，內人",
    example: "田中さんのおくさんはとてもきれいです",
    exampleMeaning: "田中先生的太太很漂亮",
    exampleFurigana: "田中(たなか)さんのおくさんはとてもきれいです"
  },
  "おさきに": {
    furigana: "おさきに",
    meaning: "先告辭了，我先走了（用於比別人先離開時）",
    example: "おさきに失礼します",
    exampleMeaning: "我先告辭了",
    exampleFurigana: "おさきに失礼(しつれい)します"
  },
  "おしゃれ": {
    furigana: "おしゃれ",
    meaning: "時髦，時尚，講究穿著；時髦的人",
    example: "彼女はとてもおしゃれだ",
    exampleMeaning: "她很時髦",
    exampleFurigana: "彼女(かのじょ)はとてもおしゃれだ"
  },
  "おじゃまします": {
    furigana: "おじゃまします",
    meaning: "打擾了（進入別人家時說）",
    example: "おじゃまします",
    exampleMeaning: "打擾了",
    exampleFurigana: "おじゃまします"
  },
  "おだいじに": {
    furigana: "おだいじに",
    meaning: "保重，請多保重（對病人說）",
    example: "おだいじになさってください",
    exampleMeaning: "請多保重",
    exampleFurigana: "おだいじになさってください"
  },
  "おととい": {
    furigana: "おととい",
    meaning: "前天",
    example: "おととい、映画を見た",
    exampleMeaning: "前天看了電影",
    exampleFurigana: "おととい、映画(えいが)を見(み)た"
  },
  "おととし": {
    furigana: "おととし",
    meaning: "前年",
    example: "おととし日本へ行った",
    exampleMeaning: "前年去了日本",
    exampleFurigana: "おととし日本(にほん)へ行(い)った"
  },
  "おとなしい": {
    furigana: "おとなしい",
    meaning: "老實，規矩，溫順；樸素，素雅",
    example: "彼はおとなしい性格だ",
    exampleMeaning: "他性格溫順",
    exampleFurigana: "彼(かれ)はおとなしい性格(せいかく)だ"
  },
  "おどかす": {
    furigana: "おどかす",
    meaning: "嚇唬，恐嚇；使驚慌",
    example: "子どもをおどかさないで",
    exampleMeaning: "不要嚇唬孩子",
    exampleFurigana: "子(こ)どもをおどかさないで"
  },
  "おねがいします": {
    furigana: "おねがいします",
    meaning: "拜託了，麻煩您了，請",
    example: "おねがいします、これをしてください",
    exampleMeaning: "拜託了，請做這個",
    exampleFurigana: "おねがいします、これをしてください"
  },
  "おはよう": {
    furigana: "おはよう",
    meaning: "早上好（較隨便的說法）",
    example: "おはよう、よく眠れた？",
    exampleMeaning: "早啊，睡得好嗎？",
    exampleFurigana: "おはよう、よく眠(ねむ)れた？"
  },
  "おまたせしました": {
    furigana: "おまたせしました",
    meaning: "讓您久等了（禮貌說法）",
    example: "おまたせしました、申し訳ありません",
    exampleMeaning: "讓您久等了，非常抱歉",
    exampleFurigana: "おまたせしました、申(もう)し訳(わけ)ありません"
  },
  "おまちください": {
    furigana: "おまちください",
    meaning: "請稍等（禮貌說法）",
    example: "おまちください、すぐ戻ります",
    exampleMeaning: "請稍等，馬上回來",
    exampleFurigana: "おまちください、すぐ戻(もど)ります"
  },
  "おめでたい": {
    furigana: "おめでたい",
    meaning: "值得慶賀的，可喜可賀的；天真爛漫的",
    example: "おめでたい日だ",
    exampleMeaning: "這是值得慶賀的日子",
    exampleFurigana: "おめでたい日(ひ)だ"
  },
  "おやすみ": {
    furigana: "おやすみ",
    meaning: "晚安，休息（較隨便的說法）",
    example: "おやすみ、いい夢を",
    exampleMeaning: "晚安，祝好夢",
    exampleFurigana: "おやすみ、いい夢(ゆめ)を"
  },
  "おやつ": {
    furigana: "おやつ",
    meaning: "點心，零食（下午吃的）",
    example: "おやつにケーキを食べた",
    exampleMeaning: "吃了蛋糕當點心",
    exampleFurigana: "おやつにケーキを食(た)べた"
  },
  "かしこまりました": {
    furigana: "かしこまりました",
    meaning: "知道了，明白了（服務業禮貌用語）",
    example: "かしこまりました、承知いたしました",
    exampleMeaning: "明白了，我知道了",
    exampleFurigana: "かしこまりました、承知(しょうち)いたしました"
  },
  "かじる": {
    furigana: "かじる",
    meaning: "啃，咬（一點一點地咬）",
    example: "りんごをかじる",
    exampleMeaning: "啃蘋果",
    exampleFurigana: "りんごをかじる"
  },
  "かゆい": {
    furigana: "かゆい",
    meaning: "癢，發癢",
    example: "蚊に刺されてかゆい",
    exampleMeaning: "被蚊子叮了很癢",
    exampleFurigana: "蚊(か)に刺(さ)されてかゆい"
  },
  "からかう": {
    furigana: "からかう",
    meaning: "開玩笑，調侃，捉弄",
    example: "彼女をからかわないで",
    exampleMeaning: "不要捉弄她",
    exampleFurigana: "彼女(かのじょ)をからかわないで"
  },
  "かるた": {
    furigana: "かるた",
    meaning: "紙牌，歌留多（日本傳統紙牌遊戲）",
    example: "正月にかるたをする",
    exampleMeaning: "新年玩紙牌",
    exampleFurigana: "正月(しょうがつ)にかるたをする"
  },
  "かわいがる": {
    furigana: "かわいがる",
    meaning: "喜愛，疼愛；教養，照料",
    example: "祖母は孫をかわいがっている",
    exampleMeaning: "祖母很疼愛孫子",
    exampleFurigana: "祖母(そぼ)は孫(まご)をかわいがっている"
  },
  "きっかけ": {
    furigana: "きっかけ",
    meaning: "契機，機會，導火線",
    example: "それをきっかけに日本語を勉強し始めた",
    exampleMeaning: "以此為契機開始學習日語",
    exampleFurigana: "それをきっかけに日本語(にほんご)を勉強(べんきょう)し始(はじ)めた"
  },
  "ぎっしり": {
    furigana: "ぎっしり",
    meaning: "滿滿地，緊緊地，擠得滿滿的",
    example: "予定がぎっしり詰まっている",
    exampleMeaning: "日程排得滿滿的",
    exampleFurigana: "予定(よてい)がぎっしり詰(つ)まっている"
  },
  "くしゃみ": {
    furigana: "くしゃみ",
    meaning: "噴嚏",
    example: "くしゃみが出そうだ",
    exampleMeaning: "想打噴嚏",
    exampleFurigana: "くしゃみが出(で)そうだ"
  },
  "くたびれる": {
    furigana: "くたびれる",
    meaning: "疲勞，疲倦；用舊，穿舊",
    example: "一日中歩いてくたびれた",
    exampleMeaning: "走了一整天累了",
    exampleFurigana: "一日中(いちにちじゅう)歩(ある)いてくたびれた"
  },
  "くだらない": {
    furigana: "くだらない",
    meaning: "無聊的，沒價值的，無意義的",
    example: "くだらない話はやめて",
    exampleMeaning: "別說無聊的話了",
    exampleFurigana: "くだらない話(はなし)はやめて"
  },
  "くっつく": {
    furigana: "くっつく",
    meaning: "粘上，附著；緊靠，挨近",
    example: "壁にくっついて立つ",
    exampleMeaning: "靠牆站著",
    exampleFurigana: "壁(かべ)にくっついて立(た)つ"
  },
  "くっつける": {
    furigana: "くっつける",
    meaning: "把...粘上，使...靠近",
    example: "切手を封筒にくっつける",
    exampleMeaning: "把郵票貼在信封上",
    exampleFurigana: "切手(きって)を封筒(ふうとう)にくっつける"
  },
  "くどい": {
    furigana: "くどい",
    meaning: "囉嗦的，冗長的；濃烈的（味道）",
    example: "彼の話はくどい",
    exampleMeaning: "他的話很囉嗦",
    exampleFurigana: "彼(かれ)の話(はなし)はくどい"
  },
  "くるむ": {
    furigana: "くるむ",
    meaning: "包，裹；隱瞞，掩蓋",
    example: "毛布にくるまって寝る",
    exampleMeaning: "裹著毛毯睡覺",
    exampleFurigana: "毛布(もうふ)にくるまって寝(ね)る"
  },
  "くれぐれも": {
    furigana: "くれぐれも",
    meaning: "懇切地，反覆地，再三地（用於囑咐）",
    example: "くれぐれもお気をつけて",
    exampleMeaning: "請務必小心",
    exampleFurigana: "くれぐれもお気(き)をつけて"
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
console.log('=== 日語詞條補全報告 ===');
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
