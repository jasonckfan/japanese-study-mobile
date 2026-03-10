#!/usr/bin/env node
/**
 * Batch fill missing vocabulary entries - Round 7
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data');
const VOCAB_FILE = path.join(DATA_DIR, 'jlpt-vocab.json');
const WAITING_LIST_FILE = path.join(__dirname, '../waiting_list.json');

// Read files
const vocabData = JSON.parse(fs.readFileSync(VOCAB_FILE, 'utf8'));
const waitingList = JSON.parse(fs.readFileSync(WAITING_LIST_FILE, 'utf8'));

// Dictionary of fill data for round 7
const fillData = {
  "のばす": {
    furigana: "のばす",
    meaning: "伸展，延長；擴展，發展",
    example: "手をのばす",
    exampleMeaning: "伸出手",
    exampleFurigana: "手(て)をのばす"
  },
  "のびる": {
    furigana: "のびる",
    meaning: "伸展，延伸；擴大，發展；變長",
    example: "体がのびた",
    exampleMeaning: "長高了",
    exampleFurigana: "体(からだ)がのびた"
  },
  "のぼる": {
    furigana: "のぼる",
    meaning: "登上，攀登；上升，升起；達到",
    example: "山にのぼる",
    exampleMeaning: "爬山",
    exampleFurigana: "山(やま)にのぼる"
  },
  "のりかえる": {
    furigana: "のりかえる",
    meaning: "換乘，轉車",
    example: "電車をのりかえる",
    exampleMeaning: "換乘電車",
    exampleFurigana: "電車(でんしゃ)をのりかえる"
  },
  "のりこむ": {
    furigana: "のりこむ",
    meaning: "乘入，進入；投入，參與",
    example: "バスにのりこむ",
    exampleMeaning: "上公交車",
    exampleFurigana: "バスにのりこむ"
  },
  "のりもの": {
    furigana: "のりもの",
    meaning: "交通工具，乘坐物",
    example: "のりものに酔う",
    exampleMeaning: "暈車/暈船",
    exampleFurigana: "のりものに酔(よ)う"
  },
  "のる": {
    furigana: "のる",
    meaning: "乘坐，騎；登上；參與；附和",
    example: "電車にのる",
    exampleMeaning: "坐電車",
    exampleFurigana: "電車(でんしゃ)にのる"
  },
  "はい": {
    furigana: "はい",
    meaning: "是，是的；到，在；給您",
    example: "はい、わかりました",
    exampleMeaning: "是，明白了",
    exampleFurigana: "はい、わかりました"
  },
  "はいけん": {
    furigana: "はいけん",
    meaning: "拜見，瞻仰（謙語）",
    example: "お写真をはいけんする",
    exampleMeaning: "拜見照片",
    exampleFurigana: "お写真(しゃしん)をはいけんする"
  },
  "はいる": {
    furigana: "はいる",
    meaning: "進入，進來；加入，參加；包含",
    example: "部屋にはいる",
    exampleMeaning: "進入房間",
    exampleFurigana: "部屋(へや)にはいる"
  },
  "はえる": {
    furigana: "はえる",
    meaning: "長出，生長；鑲嵌",
    example: "歯がはえる",
    exampleMeaning: "長牙",
    exampleFurigana: "歯(は)がはえる"
  },
  "はかせ": {
    furigana: "はかせ",
    meaning: "博士",
    example: "はかせ号",
    exampleMeaning: "博士號",
    exampleFurigana: "はかせ号(ごう)"
  },
  "はかる": {
    furigana: "はかる",
    meaning: "測量，測定；猜測，試探；考慮",
    example: "距離をはかる",
    exampleMeaning: "測量距離",
    exampleFurigana: "距離(きょり)をはかる"
  },
  "はき": {
    furigana: "はき",
    meaning: "氣勢，氣概；心情，脾氣",
    example: "はきがいい",
    exampleMeaning: "氣勢好",
    exampleFurigana: "はきがいい"
  },
  "はきはき": {
    furigana: "はきはき",
    meaning: "清楚，乾脆，爽快",
    example: "はきはき答える",
    exampleMeaning: "乾脆地回答",
    exampleFurigana: "はきはき答(こた)える"
  },
  "はく": {
    furigana: "はく",
    meaning: "穿（褲子、裙子、鞋等）；吐",
    example: "くつをはく",
    exampleMeaning: "穿鞋",
    exampleFurigana: "くつをはく"
  },
  "はげしい": {
    furigana: "はげしい",
    meaning: "激烈的，猛烈的；熱烈的，熱情的",
    example: "はげしい雨",
    exampleMeaning: "大雨",
    exampleFurigana: "はげしい雨(あめ)"
  },
  "はし": {
    furigana: "はし",
    meaning: "橋；筷子；邊緣",
    example: "はしを渡る",
    exampleMeaning: "過橋",
    exampleFurigana: "はしを渡(わた)る"
  },
  "はしご": {
    furigana: "はしご",
    meaning: "梯子；階梯，手段",
    example: "はしごをかける",
    exampleMeaning: "架梯子",
    exampleFurigana: "はしごをかける"
  },
  "はじく": {
    furigana: "はじく",
    meaning: "彈，撥；排斥，驅除",
    example: "ギターをはじく",
    exampleMeaning: "彈吉他",
    exampleFurigana: "ギターをはじく"
  },
  "はじめ": {
    furigana: "はじめ",
    meaning: "開始，開頭；最初，起初",
    example: "はじめまして",
    exampleMeaning: "初次見面",
    exampleFurigana: "はじめまして"
  },
  "はじめて": {
    furigana: "はじめて",
    meaning: "第一次，初次",
    example: "はじめて日本に来た",
    exampleMeaning: "第一次來日本",
    exampleFurigana: "はじめて日本(にほん)に来(き)た"
  },
  "はじめる": {
    furigana: "はじめる",
    meaning: "開始",
    example: "仕事をはじめる",
    exampleMeaning: "開始工作",
    exampleFurigana: "仕事(しごと)をはじめる"
  },
  "はじる": {
    furigana: "はじる",
    meaning: "害羞，羞恥；慚愧",
    example: "人にはじる",
    exampleMeaning: "在人面前害羞",
    exampleFurigana: "人(ひと)にはじる"
  },
  "はずかしい": {
    furigana: "はずかしい",
    meaning: "害羞的，羞恥的；慚愧的；丟臉的",
    example: "はずかしくて顔が赤くなる",
    exampleMeaning: "害羞得臉紅",
    exampleFurigana: "はずかしくて顔(かお)が赤(あか)くなる"
  },
  "はずかしがる": {
    furigana: "はずかしがる",
    meaning: "感到害羞，不好意思",
    example: "はずかしがらないで",
    exampleMeaning: "別害羞",
    exampleFurigana: "はずかしがらないで"
  },
  "はずす": {
    furigana: "はずす",
    meaning: "摘下，解開；避開，錯過；離席",
    example: "メガネをはずす",
    exampleMeaning: "摘下眼鏡",
    exampleFurigana: "メガネをはずす"
  },
  "はずれる": {
    furigana: "はずれる",
    meaning: "脫落，掉下；偏離，落空；不合格",
    example: "ボタンがはずれた",
    exampleMeaning: "扣子掉了",
    exampleFurigana: "ボタンがはずれた"
  },
  "はたらく": {
    furigana: "はたらく",
    meaning: "工作，勞動；起作用；活動",
    example: "会社ではたらく",
    exampleMeaning: "在公司工作",
    exampleFurigana: "会社(かいしゃ)ではたらく"
  },
  "はち": {
    furigana: "はち",
    meaning: "八，8；蜂，蜜蜂",
    example: "はちが飛んでいる",
    exampleMeaning: "蜜蜂在飛",
    exampleFurigana: "はちが飛(と)んでいる"
  },
  "はちみつ": {
    furigana: "はちみつ",
    meaning: "蜂蜜",
    example: "はちみつを食べる",
    exampleMeaning: "吃蜂蜜",
    exampleFurigana: "はちみつを食(た)べる"
  },
  "はつ": {
    furigana: "はつ",
    meaning: "最初，首次；發，生",
    example: "はつめして",
    exampleMeaning: "初次見面",
    exampleFurigana: "はつめして"
  },
  "はつか": {
    furigana: "はつか",
    meaning: "二十日，二十號；二十天",
    example: "はつかに会う",
    exampleMeaning: "二十號見面",
    exampleFurigana: "はつかに会(あ)う"
  },
  "はつが": {
    furigana: "はつが",
    meaning: "發芽，出芽",
    example: "種がはつがする",
    exampleMeaning: "種子發芽",
    exampleFurigana: "種(たね)がはつがする"
  },
  "はつげん": {
    furigana: "はつげん",
    meaning: "發言，講話",
    example: "はつげんする",
    exampleMeaning: "發言",
    exampleFurigana: "はつげんする"
  },
  "はっきり": {
    furigana: "はっきり",
    meaning: "清楚，明確；乾脆，爽快",
    example: "はっきり言う",
    exampleMeaning: "清楚地說",
    exampleFurigana: "はっきり言(い)う"
  },
  "はっけん": {
    furigana: "はっけん",
    meaning: "發現，發覺",
    example: "新種をはっけんする",
    exampleMeaning: "發現新品種",
    exampleFurigana: "新(しん)種(しゅ)をはっけんする"
  },
  "はっこう": {
    furigana: "はっこう",
    meaning: "發行，發放；發射",
    example: "切手をはっこうする",
    exampleMeaning: "發行郵票",
    exampleFurigana: "切手(きって)をはっこうする"
  },
  "はっしゃ": {
    furigana: "はっしゃ",
    meaning: "發車，開車；發射",
    example: "電車がはっしゃする",
    exampleMeaning: "電車發車",
    exampleFurigana: "電車(でんしゃ)がはっしゃする"
  },
  "はっせい": {
    furigana: "はっせい",
    meaning: "發生，產生",
    example: "事故がはっせいした",
    exampleMeaning: "事故發生了",
    exampleFurigana: "事故(じこ)がはっせいした"
  },
  "はったつ": {
    furigana: "はったつ",
    meaning: "發達，發展；發達國家",
    example: "経済がはったつする",
    exampleMeaning: "經濟發展",
    exampleFurigana: "経済(けいざい)がはったつする"
  },
  "はっぴょう": {
    furigana: "はっぴょう",
    meaning: "發表，發布；宣布",
    example: "論文をはっぴょうする",
    exampleMeaning: "發表論文",
    exampleFurigana: "論文(ろんぶん)をはっぴょうする"
  },
  "はっぽう": {
    furigana: "はっぽう",
    meaning: "八方，四面八方",
    example: "はっぽう美人",
    exampleMeaning: "八面玲瓏的美人",
    exampleFurigana: "はっぽう美人(びじん)"
  },
  "はつめい": {
    furigana: "はつめい",
    meaning: "發明",
    example: "新製品をはつめいする",
    exampleMeaning: "發明新產品",
    exampleFurigana: "新(しん)製品(せいひん)をはつめいする"
  },
  "はつめん": {
    furigana: "はつめん",
    meaning: "露面，出現；初登場",
    example: "舞台ではつめんする",
    exampleMeaning: "在舞台上露面",
    exampleFurigana: "舞台(ぶたい)ではつめんする"
  },
  "はな": {
    furigana: "はな",
    meaning: "花；櫻花；華麗，華美",
    example: "はなが咲く",
    exampleMeaning: "花開",
    exampleFurigana: "はなが咲(さ)く"
  },
  "はなし": {
    furigana: "はなし",
    meaning: "話，談話；故事；傳說；商量",
    example: "はなしをする",
    exampleMeaning: "談話",
    exampleFurigana: "はなしをする"
  },
  "はなす": {
    furigana: "はなす",
    meaning: "說，講；談話；放開，放開",
    example: "日本語をはなす",
    exampleMeaning: "說日語",
    exampleFurigana: "日本語(にほんご)をはなす"
  },
  "はなび": {
    furigana: "はなび",
    meaning: "煙花，焰火",
    example: "はなびを見る",
    exampleMeaning: "看煙花",
    exampleFurigana: "はなびを見(み)る"
  },
  "はなやか": {
    furigana: "はなやか",
    meaning: "華麗的，絢爛的；熱鬧的",
    example: "はなやかな衣裳",
    exampleMeaning: "華麗的衣裳",
    exampleFurigana: "はなやかな衣裳(いしょう)"
  },
  "はなれる": {
    furigana: "はなれる",
    meaning: 