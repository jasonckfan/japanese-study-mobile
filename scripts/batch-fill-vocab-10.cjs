#!/usr/bin/env node
/**
 * Batch fill missing vocabulary entries - Round 10
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data');
const VOCAB_FILE = path.join(DATA_DIR, 'jlpt-vocab.json');
const WAITING_LIST_FILE = path.join(__dirname, '../waiting_list.json');

// Read files
const vocabData = JSON.parse(fs.readFileSync(VOCAB_FILE, 'utf8'));
const waitingList = JSON.parse(fs.readFileSync(WAITING_LIST_FILE, 'utf8'));

// Dictionary of fill data for round 10
const fillData = {
  "はんこう": {
    furigana: "はんこう",
    meaning: "反抗，抵抗；反向，逆行",
    example: "大人の言うことに反抗する",
    exampleMeaning: "反抗大人說的話",
    exampleFurigana: "大人(おとな)の言(い)うことに反抗(はんこう)する"
  },
  "はんさ": {
    furigana: "はんさ",
    meaning: "叛差，偏差；差錯，錯誤",
    example: "はんさが出る",
    exampleMeaning: "出現偏差",
    exampleFurigana: "はんさが出(で)る"
  },
  "はんしゃ": {
    furigana: "はんしゃ",
    meaning: "反射，反映；反省",
    example: "光の反射",
    exampleMeaning: "光的反射",
    exampleFurigana: "光(ひかり)の反射(はんしゃ)"
  },
  "はんしん": {
    furigana: "はんしん",
    meaning: "阪神（地名）；半身",
    example: "阪神タイガース",
    exampleMeaning: "阪神虎（棒球隊）",
    exampleFurigana: "阪神(はんしん)タイガース"
  },
  "はんせい": {
    furigana: "はんせい",
    meaning: "反省，反思",
    example: "自分の行動を反省する",
    exampleMeaning: "反省自己的行動",
    exampleFurigana: "自分(じぶん)の行動(こうどう)を反省(はんせい)する"
  },
  "はんそく": {
    furigana: "はんそく",
    meaning: 