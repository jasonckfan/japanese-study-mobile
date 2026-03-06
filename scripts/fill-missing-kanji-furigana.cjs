const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'jlpt-vocab.json');
const reportPath = path.join(__dirname, '..', 'REPORT_FURIGANA.md');

const KANJI_RE = /[一-龯々]/;
const HIRAGANA_KATAKANA_RE = /^[ぁ-ゖァ-ヺー]+$/;

const isKanji = (ch) => KANJI_RE.test(ch);
const hasKanji = (s) => KANJI_RE.test(s || '');
const hasRuby = (s) => /[一-龯々]\([^()]+\)/.test(s || '');
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function buildRubyToken(word, reading) {
  if (!word || !reading) return null;

  const p1 = word.match(/^([一-龯々]+)([ぁ-ゖァ-ヺー]*)$/);
  if (p1) {
    const [, kanji, okuri] = p1;
    if (!okuri) return `${kanji}(${reading})`;
    if (reading.endsWith(okuri)) {
      const stemReading = reading.slice(0, reading.length - okuri.length);
      if (stemReading) return `${kanji}(${stemReading})${okuri}`;
    }
  }

  const p2 = word.match(/^([ぁ-ゖァ-ヺー]*)([一-龯々]+)([ぁ-ゖァ-ヺー]*)$/);
  if (p2) {
    const [, prefix, kanji, suffix] = p2;
    if (
      reading.startsWith(prefix) &&
      reading.endsWith(suffix) &&
      reading.length > prefix.length + suffix.length
    ) {
      const mid = reading.slice(prefix.length, reading.length - suffix.length);
      if (mid) return `${prefix}${kanji}(${mid})${suffix}`;
    }
  }

  return `${word}(${reading})`;
}

function isKana(ch) {
  return /[ぁ-ゖァ-ヺー]/.test(ch || '');
}

function isSafeOccurrence(full, start, len, word) {
  const prev = full[start - 1] || '';
  const next = full[start + len] || '';
  if (next === '(') return false; // already annotated

  const pureKanji = /^[一-龯々]+$/.test(word);
  if (pureKanji) {
    // avoid replacing substring inside larger kanji compounds
    if (isKanji(prev) || isKanji(next)) return false;
  }
  return true;
}

function makeUniqueLexicon(rows) {
  const map = new Map();
  for (const row of rows) {
    const word = String(row.word || '').trim();
    const reading = String(row.furigana || '').trim();
    if (!word || !reading) continue;
    if (!hasKanji(word)) continue;
    if (word.length < 2) continue; // high-confidence: avoid single-kanji ambiguous matches
    if (!HIRAGANA_KATAKANA_RE.test(reading)) continue;

    const existing = map.get(word);
    if (!existing) {
      map.set(word, { readings: new Set([reading]) });
    } else {
      existing.readings.add(reading);
    }
  }

  const lexicon = [];
  for (const [word, info] of map.entries()) {
    if (info.readings.size !== 1) continue; // high-confidence only
    const reading = [...info.readings][0];
    const ruby = buildRubyToken(word, reading);
    if (!ruby) continue;
    lexicon.push({ word, reading, ruby });
  }

  lexicon.sort((a, b) => b.word.length - a.word.length);
  return lexicon;
}

function annotateSentence(sentence, lexicon) {
  let out = sentence;
  let changes = [];

  for (const item of lexicon) {
    const { word, ruby } = item;
    if (!out.includes(word)) continue;

    const re = new RegExp(escapeRegex(word), 'g');
    let replaced = false;
    out = out.replace(re, (m, offset, full) => {
      if (!isSafeOccurrence(full, offset, m.length, word)) return m;
      replaced = true;
      return ruby;
    });

    if (replaced) changes.push(`${word}->${ruby}`);
  }

  return { out, changes };
}

function targetRow(row) {
  const f = String(row.exampleFurigana || '');
  return hasKanji(f) && !hasRuby(f);
}

const raw = fs.readFileSync(dataPath, 'utf8');
const data = JSON.parse(raw);

const lexicon = makeUniqueLexicon(data);

const beforeTargets = data.filter(targetRow);

const passes = ['N5', 'N4', 'ALL'];
let fixedCount = 0;
const unable = [];
const samples = [];

for (const pass of passes) {
  for (const row of data) {
    if (!targetRow(row)) continue;
    if (pass !== 'ALL' && row.level !== pass) continue;

    const before = String(row.exampleFurigana || '');

    // first, prioritize row's own vocab if possible
    let sentence = before;
    let changed = [];
    const ownWord = String(row.word || '').trim();
    const ownFurigana = String(row.furigana || '').trim();
    if (hasKanji(ownWord) && ownFurigana && sentence.includes(ownWord)) {
      const ownRuby = buildRubyToken(ownWord, ownFurigana);
      if (ownRuby) {
        const re = new RegExp(escapeRegex(ownWord), 'g');
        let didOwn = false;
        sentence = sentence.replace(re, (m, offset, full) => {
          if (!isSafeOccurrence(full, offset, m.length, ownWord)) return m;
          didOwn = true;
          return ownRuby;
        });
        if (didOwn) changed.push(`${ownWord}->${ownRuby}`);
      }
    }

    // then supplement by lexicon
    if (!hasRuby(sentence)) {
      const result = annotateSentence(sentence, lexicon);
      sentence = result.out;
      changed.push(...result.changes);
    }

    if (sentence !== before && hasRuby(sentence)) {
      row.exampleFurigana = sentence;
      fixedCount += 1;
      if (samples.length < 10) {
        samples.push({
          id: row.id,
          level: row.level,
          before,
          after: sentence,
        });
      }
    } else if (pass === 'ALL') {
      unable.push({ id: row.id, level: row.level, word: row.word, exampleFurigana: before });
    }
  }
}

const afterTargets = data.filter(targetRow);

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n', 'utf8');

const changedFiles = ['src/data/jlpt-vocab.json', 'scripts/fill-missing-kanji-furigana.cjs', 'REPORT_FURIGANA.md'];

const reportLines = [
  '# Furigana Kanji Missing Fix Report',
  '',
  `- Total entries: ${data.length}`,
  `- Targets before (contains kanji but no ruby in exampleFurigana): ${beforeTargets.length}`,
  `- Fixed in this run: ${fixedCount}`,
  `- Remaining targets after: ${afterTargets.length}`,
  '',
  '## Sample before/after (10)',
  ...samples.map((s, i) => `${i + 1}. [${s.id}] (${s.level})\n   - before: ${s.before}\n   - after:  ${s.after}`),
  '',
  `## Remaining unresolved (${unable.length})`,
  ...unable.slice(0, 200).map((u) => `- [${u.id}] (${u.level}) ${u.word}: ${u.exampleFurigana}`),
  ...(unable.length > 200 ? [`- ... and ${unable.length - 200} more`] : []),
  '',
  '## Changed files',
  ...changedFiles.map((f) => `- ${f}`),
  '',
];

fs.writeFileSync(reportPath, reportLines.join('\n'), 'utf8');

console.log(JSON.stringify({
  total: data.length,
  targetsBefore: beforeTargets.length,
  fixedCount,
  remaining: afterTargets.length,
  sampleCount: samples.length,
  samples,
  unresolvedCount: unable.length,
  changedFiles,
}, null, 2));
