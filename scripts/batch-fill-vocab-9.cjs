#!/usr/bin/env node
/**
 * Batch fill missing vocabulary entries - Round 9
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data');
const VOCAB_FILE = path.join(DATA_DIR, 'jlpt-vocab.json');
const WAITING_LIST_FILE = path.join(__dirname, '../waiting_list.json');

// Read files
const vocabData = JSON.parse(fs.readFileSync(VOCAB_FILE, 'utf8'));
const waitingList = JSON.parse(fs.readFileSync(WAITING_LIST_FILE, 'utf8'));

// Dictionary of fill data for round 9
const fillData = {
  "はれる": {
    furigana: "はれる",
    meaning: "腫，腫脹；（天氣）放晴",
    example: "目がはれた",
    exampleMeaning: "眼睛腫了",
    exampleFurigana: "目(め)がはれた"
  },
  "はんえい": {
    furigana: "はんえい",
    meaning: "繁榮，興盛；反映",
    example: "経済がはんえいする",
    exampleMeaning: "經濟繁榮",
    exampleFurigana: "経済(けいざい)がはんえいする"
  },
  "はんかがい": {
    furigana: "はんかがい",
    meaning: "繁華街，商業區",
    example: "はんかがいを歩く",
    exampleMeaning: "走繁華街",
    exampleFurigana: "はんかがいを歩(ある)く"
  },
  "はんかく": {
    furigana: "はんかく",
    meaning: "反抗，抗拒",
    example: "親にはんかくする",
    exampleMeaning: "反抗父母",
    exampleFurigana: "親(おや)にはんかくする"
  },
  "はんこう": {
    furigana: "はんこう",
    meaning: 