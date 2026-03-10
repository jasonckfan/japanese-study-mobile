#!/usr/bin/env node
/**
 * Batch fill missing vocabulary entries - Round 31
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../src/data');
const VOCAB_FILE = path.join(DATA_DIR, 'jlpt-vocab.json');
const WAITING_LIST_FILE = path.join(__dirname, '../waiting_list.json');

// Read files
const vocabData = JSON.parse(fs.readFileSync(VOCAB_FILE, 'utf8'));
const waitingList = JSON.parse(fs.readFileSync(WAITING_LIST_FILE, 'utf8'));

// Dictionary of fill data for round 31
const fillData = {
  "ふく": {
    furigana: "ふく",
    meaning: 