#!/usr/bin/env node
/**
 * Batch fill missing vocabulary entries - Round 8
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data');
const VOCAB_FILE = path.join(DATA_DIR, 'jlpt-vocab.json');
const WAITING_LIST_FILE = path.join(__dirname, '../waiting_list.json');

// Read files
const vocabData = JSON.parse(fs.readFileSync(VOCAB_FILE, 'utf8'));
const waitingList = JSON.parse(fs.readFileSync(WAITING_LIST_FILE, 'utf8'));

// Dictionary of fill data for round 8
const fillData = {
  "はなれる": {
    furigana: "はなれる",
    meaning: "離開，分離；脫離，獨立；距離",
    example: "家をはなれる",
    exampleMeaning: "離開家",
    exampleFurigana: "家(いえ)をはなれる"
  },
  "はなはだしい": {
    furigana: "はなはだしい",
    meaning: "非常，很，極其；過分的",
    example: "はなはだしい失態",
    exampleMeaning: "極其失態",
    exampleFurigana: "はなはだしい失態(しったい)"
  },
  "はなびら": {
    furigana: "はなびら",
    meaning: "花瓣",
    example: "はなびらが散る",
    exampleMeaning: "花瓣飄落",
    exampleFurigana: "はなびらが散(ち)る"
  },
  "はなむけ": {
    furigana: "はなむけ",
    meaning: "餞別，臨別贈禮",
    example: "はなむけの言葉",
    exampleMeaning: "餞別的話",
    exampleFurigana: "はなむけの言葉(ことば)"
  },
  "はにかむ": {
    furigana: "はにかむ",
    meaning: "害羞，羞怯；忸怩",
    example: "はにかんで笑う",
    exampleMeaning: "害羞地笑",
    exampleFurigana: "はにかんで笑(わら)う"
  },
  "はやい": {
    furigana: "はやい",
    meaning: "快的，迅速的；早的；敏捷的",
    example: "電車がはやい",
    exampleMeaning: "電車很快",
    exampleFurigana: "電車(でんしゃ)がはやい"
  },
  "はやし": {
    furigana: "はやし",
    meaning: "林，樹林；伴奏",
    example: "はやしに合わせる",
    exampleMeaning: "配合伴奏",
    exampleFurigana: "はやしに合(あ)わせる"
  },
  "はやる": {
    furigana: "はやる",
    meaning: "流行，盛行；急躁，著急",
    example: "その歌がはやっている",
    exampleMeaning: "那首歌很流行",
    exampleFurigana: "その歌(うた)がはやっている"
  },
  "はらう": {
    furigana: "はらう",
    meaning: "支付，付錢；驅除，消除",
    example: "お金をはらう",
    exampleMeaning: "付錢",
    exampleFurigana: "お金(かね)をはらう"
  },
  "はらはら": {
    furigana: "はらはら",
    meaning: "飄飄，紛紛；提心吊膽；眼淚盈眶",
    example: "はらはら落ちる",
    exampleMeaning: "紛紛落下",
    exampleFurigana: "はらはら落(お)ちる"
  },
  "はる": {
    furigana: "はる",
    meaning: "貼，粘；張開；鋪；打（氣）",
    example: "切手をはる",
    exampleMeaning: "貼郵票",
    exampleFurigana: "切手(きって)をはる"
  },
  "はるか": {
    furigana: "はるか",
    meaning: "遙遠，遠遠；遠遠地，大大地",
    example: "はるか彼方",
    exampleMeaning: "遙遠的彼方",
    exampleFurigana: "はるか彼方(かなた)"
  },
  "はれる": {
    furigana: "はれる",
    meaning: 