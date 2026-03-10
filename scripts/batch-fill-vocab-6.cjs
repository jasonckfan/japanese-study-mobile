#!/usr/bin/env node
/**
 * Batch fill missing vocabulary entries - Round 6
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data');
const VOCAB_FILE = path.join(DATA_DIR, 'jlpt-vocab.json');
const WAITING_LIST_FILE = path.join(__dirname, '../waiting_list.json');

// Read files
const vocabData = JSON.parse(fs.readFileSync(VOCAB_FILE, 'utf8'));
const waitingList = JSON.parse(fs.readFileSync(WAITING_LIST_FILE, 'utf8'));

// Dictionary of fill data for round 6
const fillData = {
  "ていねい": {
    furigana: "ていねい",
    meaning: "有禮貌的，恭敬的；仔細的，周到的",
    example: "ていねいに説明する",
    exampleMeaning: "仔細說明",
    exampleFurigana: "ていねいに説明(せつめい)する"
  },
  "でこぼこ": {
    furigana: "でこぼこ",
    meaning: "凹凸不平，坑坑窪窪；不均衡",
    example: "道がでこぼこしている",
    exampleMeaning: "道路凹凸不平",
    exampleFurigana: "道(みち)がでこぼこしている"
  },
  "てつだう": {
    furigana: "てつだう",
    meaning: "幫助，幫忙，協助",
    example: "仕事をてつだう",
    exampleMeaning: "幫忙工作",
    exampleFurigana: "仕事(しごと)をてつだう"
  },
  "でむかえる": {
    furigana: "でむかえる",
    meaning: "迎接，接待；接",
    example: "お客さんをでむかえる",
    exampleMeaning: "迎接客人",
    exampleFurigana: "お客(きゃく)さんをでむかえる"
  },
  "どうせ": {
    furigana: "どうせ",
    meaning: "反正，無論如何；終究",
    example: "どうせ間に合わない",
    exampleMeaning: "反正來不及了",
    exampleFurigana: "どうせ間(ま)に合(あ)わない"
  },
  "どうぞ": {
    furigana: "どうぞ",
    meaning: "請，請便；請坐；請吃",
    example: "どうぞお入りください",
    exampleMeaning: "請進",
    exampleFurigana: "どうぞお入(はい)りください"
  },
  "どうぞよろしく": {
    furigana: "どうぞよろしく",
    meaning: "請多關照，請多指教",
    example: "どうぞよろしくお願いします",
    exampleMeaning: "請多關照",
    exampleFurigana: "どうぞよろしくお願(ねが)いします"
  },
  "どきどき": {
    furigana: "どきどき",
    meaning: "撲通撲通地跳；忐忑不安",
    example: "胸がどきどきする",
    exampleMeaning: "心撲通撲通跳",
    exampleFurigana: "胸(むね)がどきどきする"
  },
  "どっと": {
    furigana: "どっと",
    meaning: "哄然，哄堂；突然大量湧入",
    example: "どっと笑いが起きる",
    exampleMeaning: "哄堂大笑",
    exampleFurigana: "どっと笑(わら)いが起(お)きる"
  },
  "どなた": {
    furigana: "どなた",
    meaning: "哪位，誰（尊敬語）",
    example: "どなたですか",
    exampleMeaning: "您是哪位",
    exampleFurigana: "どなたですか"
  },
  "どのぐらい": {
    furigana: "どのぐらい",
    meaning: "多少，多久，多長",
    example: "どのぐらいかかりますか",
    exampleMeaning: "要花多久",
    exampleFurigana: "どのぐらいかかりますか"
  },
  "どんどん": {
    furigana: "どんどん",
    meaning: "連續不斷地；咚咚地；迅速地",
    example: "どんどん進む",
    exampleMeaning: "不斷前進",
    exampleFurigana: "どんどん進(すす)む"
  },
  "ないしょ": {
    furigana: "ないしょ",
    meaning: "秘密，私下",
    example: "ないしょにしておいて",
    exampleMeaning: "請保密",
    exampleFurigana: "ないしょにしておいて"
  },
  "なかなか": {
    furigana: "なかなか",
    meaning: "很，相當；（後接否定）怎麼也...不",
    example: "なかなか難しい",
    exampleMeaning: "相當難",
    exampleFurigana: "なかなか難(むずか)しい"
  },
  "なさる": {
    furigana: "なさる",
    meaning: "做，幹（「する」的尊敬語）",
    example: "何をなさいますか",
    exampleMeaning: "您要做什麼",
    exampleFurigana: "何(なに)をなさいますか"
  },
  "なつかしい": {
    furigana: "なつかしい",
    meaning: "懷念的，令人思念的",
    example: "なつかしい思い出",
    exampleMeaning: "令人懷念的回憶",
    exampleFurigana: "なつかしい思(おも)い出(で)"
  },
  "なつかしむ": {
    furigana: "なつかしむ",
    meaning: "懷念，思念，追懷",
    example: "故郷をなつかしむ",
    exampleMeaning: "懷念故鄉",
    exampleFurigana: "故郷(こきょう)をなつかしむ"
  },
  "なにしろ": {
    furigana: "なにしろ",
    meaning: "不管怎麼說，畢竟，終究",
    example: "なにしろ初めてだ",
    exampleMeaning: "畢竟是第一次",
    exampleFurigana: "なにしろ初(はじ)めてだ"
  },
  "なにぶん": {
    furigana: "なにぶん",
    meaning: "請，務必；不管怎麼說",
    example: "なにぶんよろしく",
    exampleMeaning: "請務必關照",
    exampleFurigana: "なにぶんよろしく"
  },
  "なにもの": {
    furigana: "なにもの",
    meaning: "什麼東西，什麼人；了不起的人",
    example: "彼はなにものだ",
    exampleMeaning: "他是什麼人",
    exampleFurigana: "彼(かれ)はなにものだ"
  },
  "なにより": {
    furigana: "なにより",
    meaning: "比什麼都...，最...",
    example: "健康がなによりだ",
    exampleMeaning: "健康最重要",
    exampleFurigana: "健康(けんこう)がなによりだ"
  },
  "なによりも": {
    furigana: "なによりも",
    meaning: "最...，比什麼都",
    example: "なによりも大切だ",
    exampleMeaning: "最重要",
    exampleFurigana: "なによりも大切(たいせつ)だ"
  },
  "なんだか": {
    furigana: "なんだか",
    meaning: "總覺得，不知為什麼；什麼的",
    example: "なんだか変だ",
    exampleMeaning: "總覺得奇怪",
    exampleFurigana: "なんだか変(へん)だ"
  },
  "なんと": {
    furigana: "なんと",
    meaning: "多麼，何等；竟然，居然",
    example: "なんと美しい",
    exampleMeaning: "多麼美麗",
    exampleFurigana: "なんと美(うつく)しい"
  },
  "なんとなく": {
    furigana: "なんとなく",
    meaning: "不知為什麼，總覺得；無意中",
    example: "なんとなく寂しい",
    exampleMeaning: "總覺得寂寞",
    exampleFurigana: "なんとなく寂(さび)しい"
  },
  "にあう": {
    furigana: "にあう",
    meaning: "適合，適宜；配得上",
    example: "彼ににあう仕事",
    exampleMeaning: "適合他的工作",
    exampleFurigana: "彼(かれ)ににあう仕事(しごと)"
  },
  "におい": {
    furigana: "におい",
    meaning: "氣味，香味；氣氛，氣息",
    example: "いいにおいがする",
    exampleMeaning: "有好聞的香味",
    exampleFurigana: "いいにおいがする"
  },
  "におう": {
    furigana: "におう",
    meaning: "有氣味，散發香味；顯示出",
    example: "花のにおう",
    exampleMeaning: "花散發香味",
    exampleFurigana: "花(はな)のにおう"
  },
  "にぎやか": {
    furigana: "にぎやか",
    meaning: "熱鬧的，繁華的",
    example: "にぎやかな街",
    exampleMeaning: "熱鬧的街道",
    exampleFurigana: "にぎやかな街(まち)"
  },
  "にげる": {
    furigana: "にげる",
    meaning: "逃跑，逃離；逃避，迴避",
    example: "敵からにげる",
    exampleMeaning: "從敵人那裡逃跑",
    exampleFurigana: "敵(てき)からにげる"
  },
  "にこにこ": {
    furigana: "にこにこ",
    meaning: "笑嘻嘻地，笑咪咪地",
    example: "にこにこ笑う",
    exampleMeaning: "笑嘻嘻地笑",
    exampleFurigana: "にこにこ笑(わら)う"
  },
  "にし": {
    furigana: "にし",
    meaning: "西，西方，西邊",
    example: "にし向かう",
    exampleMeaning: "向西走",
    exampleFurigana: "にし向(む)かう"
  },
  "にっこり": {
    furigana: "にっこり",
    meaning: "微笑，莞爾",
    example: "にっこり笑う",
    exampleMeaning: "微微一笑",
    exampleFurigana: "にっこり笑(わら)う"
  },
  "にってい": {
    furigana: "にってい",
    meaning: "日程，時間表",
    example: "にっていを決める",
    exampleMeaning: "決定日程",
    exampleFurigana: "にっていを決(き)める"
  },
  "にぶい": {
    furigana: "にぶい",
    meaning: "鈍的，不快的；遲鈍的，遲緩的",
    example: "感覚がにぶい",
    exampleMeaning: "感覺遲鈍",
    exampleFurigana: "感覚(かんかく)がにぶい"
  },
  "にほん": {
    furigana: "にほん",
    meaning: "日本",
    example: "にほんへ行く",
    exampleMeaning: "去日本",
    exampleFurigana: "にほんへ行(い)く"
  },
  "にる": {
    furigana: "にる",
    meaning: "煮，燉，熬",
    example: "野菜をにる",
    exampleMeaning: "煮蔬菜",
    exampleFurigana: "野菜(やさい)をにる"
  },
  "ぬく": {
    furigana: "ぬく",
    meaning: "拔出，抽出；去掉；省掉",
    example: "歯をぬく",
    exampleMeaning: "拔牙",
    exampleFurigana: "歯(は)をぬく"
  },
  "ぬぐ": {
    furigana: "ぬぐ",
    meaning: "脫掉，摘掉；消除，解除",
    example: "服をぬぐ",
    exampleMeaning: "脫衣服",
    exampleFurigana: "服(ふく)をぬぐ"
  },
  "ぬすむ": {
    furigana: "ぬすむ",
    meaning: "偷，盜竊",
    example: "財布をぬすまれた",
    exampleMeaning: "錢包被偷了",
    exampleFurigana: "財布(さいふ)をぬすまれた"
  },
  "ぬれる": {
    furigana: "ぬれる",
    meaning: "淋濕，沾濕；受潮",
    example: "雨にぬれた",
    exampleMeaning: "被雨淋濕了",
    exampleFurigana: "雨(あめ)にぬれた"
  },
  "ねがい": {
    furigana: "ねがい",
    meaning: "願望，請求，祈願",
    example: "ねがいが叶う",
    exampleMeaning: "願望實現",
    exampleFurigana: "ねがいが叶(かな)う"
  },
  "ねがう": {
    furigana: "ねがう",
    meaning: "希望，願望；請求，懇求",
    example: "成功をねがう",
    exampleMeaning: "希望成功",
    exampleFurigana: "成功(せいこう)をねがう"
  },
  "ねこ": {
    furigana: "ねこ",
    meaning: "貓",
    example: "ねこが好き",
    exampleMeaning: "喜歡貓",
    exampleFurigana: "ねこが好(す)き"
  },
  "ねじ": {
    furigana: "ねじ",
    meaning: "螺絲，螺釘",
    example: "ねじを締める",
    exampleMeaning: "上螺絲",
    exampleFurigana: "ねじを締(し)める"
  },
  "ねずみ": {
    furigana: "ねずみ",
    meaning: "老鼠，耗子",
    example: "ねずみが出た",
    exampleMeaning: "出現老鼠了",
    exampleFurigana: "ねずみが出(で)た"
  },
  "ねだる": {
    furigana: "ねだる",
    meaning: "死纏爛打地要，糾纏著要",
    example: "おもちゃをねだる",
    exampleMeaning: "死纏爛打要玩具",
    exampleFurigana: "おもちゃをねだる"
  },
  "ねむい": {
    furigana: "ねむい",
    meaning: "睏的，想睡覺的",
    example: "ねむくてたまらない",
    exampleMeaning: "睏得不得了",
    exampleFurigana: "ねむくてたまらない"
  },
  "ねむる": {
    furigana: "ねむる",
    meaning: "睡覺，睡眠；長眠，死",
    example: "よくねむる",
    exampleMeaning: "好好睡覺",
    exampleFurigana: "よくねむる"
  },
  "ねらう": {
    furigana: "ねらう",
    meaning: "瞄準，以...為目標；圖謀",
    example: "的をねらう",
    exampleMeaning: "瞄準靶子",
    exampleFurigana: "的(まと)をねらう"
  },
  "ねる": {
    furigana: "ねる",
    meaning: "睡覺；躺臥；休眠",
    example: "よくねる",
    exampleMeaning: "好好睡覺",
    exampleFurigana: "よくねる"
  },
  "のう": {
    furigana: "のう",
    meaning: "腦，頭腦；農，農業",
    example: "のうがいい",
    exampleMeaning: "頭腦好",
    exampleFurigana: "のうがいい"
  },
  "のこす": {
    furigana: "のこす",
    meaning: "留下，剩下；保留，遺留",
    example: "食べ物をのこす",
    exampleMeaning: "剩下食物",
    exampleFurigana: "食(た)べ物(もの)をのこす"
  },
  "のこる": {
    furigana: "のこる",
    meaning: "留下，剩下；遺留，殘留",
    example: "お金がのこった",
    exampleMeaning: "錢剩下了",
    exampleFurigana: "お金(かね)がのこった"
  },
  "のぞく": {
    furigana: "のぞく",
    meaning: "窺視，偷看；窺探；露出",
    example: "窓からのぞく",
    exampleMeaning: "從窗戶偷看",
    exampleFurigana: "窓(まど)からのぞく"
  },
  "のぞむ": {
    furigana: "のぞむ",
    meaning: "希望，願望；期望，要求",
    example: "成功をのぞむ",
    exampleMeaning: "希望成功",
    exampleFurigana: "成功(せいこう)をのぞむ"
  },
  "のど": {
    furigana: "のど",
    meaning: "喉嚨，嗓子",
    example: "のどが渇く",
    exampleMeaning: "口渴",
    exampleFurigana: "のどが渇(かわ)く"
  },
  "のどか": {
    furigana: "のどか",
    meaning: "悠閒的，恬靜的，寧靜的",
    example: "のどかな田舎",
    exampleMeaning: "恬靜的鄉村",
    exampleFurigana: "のどかな田舎(いなか)"
  },
  "ののしる": {
    furigana: "ののしる",
    meaning: "咒罵，辱罵，斥責",
    example: "悪口をののしる",
    exampleMeaning: "咒罵壞話",
    exampleFurigana: "悪口(わるくち)をののしる"
  },
  "のばす": {
    furigana: "のばす",
    meaning: 