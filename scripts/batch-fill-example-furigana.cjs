const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'jlpt-vocab.json');
const reportPath = path.join(__dirname, '..', 'REPORT_FURIGANA.md');

const isKanji = (ch) => /[一-龯々]/.test(ch);
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function buildRubyToken(word, reading) {
  if (!word || !reading) return word;

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
    if (reading.startsWith(prefix) && reading.endsWith(suffix) && reading.length > prefix.length + suffix.length) {
      const mid = reading.slice(prefix.length, reading.length - suffix.length);
      if (mid) return `${prefix}${kanji}(${mid})${suffix}`;
    }
  }

  return `${word}(${reading})`;
}

function hasAnyKanji(str) {
  return Array.from(str || '').some(isKanji);
}

const raw = fs.readFileSync(dataPath, 'utf8');
const data = JSON.parse(raw);

const beforeMissing = data.filter((x) => !x.exampleFurigana || !String(x.exampleFurigana).trim()).length;
let filled = 0;
let rubyAnnotated = 0;
const samples = [];

for (const row of data) {
  const prev = row.exampleFurigana;
  if (prev && String(prev).trim()) continue;

  const example = row.example || '';
  const word = row.word || '';
  const furigana = row.furigana || '';

  let out = example;
  let annotated = false;

  if (example && word && furigana && hasAnyKanji(word) && example.includes(word)) {
    const rubyWord = buildRubyToken(word, furigana);
    const re = new RegExp(escapeRegex(word), 'g');
    out = example.replace(re, rubyWord);
    annotated = out !== example;
  }

  row.exampleFurigana = out;
  filled += 1;
  if (annotated) rubyAnnotated += 1;

  if (samples.length < 5) {
    samples.push({
      id: row.id,
      word: row.word,
      before: row.example,
      after: row.exampleFurigana,
    });
  }
}

const afterMissing = data.filter((x) => !x.exampleFurigana || !String(x.exampleFurigana).trim()).length;

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n', 'utf8');

const changedFiles = [
  'src/data/jlpt-vocab.json',
  'src/App.tsx',
  'src/styles/App.css',
  'scripts/batch-fill-example-furigana.cjs',
  'REPORT_FURIGANA.md',
];

const report = [
  '# Furigana Batch Report',
  '',
  `- Total entries: ${data.length}`,
  `- Missing before: ${beforeMissing}`,
  `- Filled in this run: ${filled}`,
  `- Ruby-annotated examples in this run: ${rubyAnnotated}`,
  `- Missing after: ${afterMissing}`,
  '',
  '## Sample before/after (5)',
  ...samples.map((s, idx) => `${idx + 1}. [${s.id}] ${s.word}\n   - before: ${s.before}\n   - after:  ${s.after}`),
  '',
  '## Changed files',
  ...changedFiles.map((f) => `- ${f}`),
  '',
  '> Commit hash will be appended after git commit.',
  '',
];

fs.writeFileSync(reportPath, report.join('\n'), 'utf8');

console.log(JSON.stringify({ total: data.length, beforeMissing, filled, rubyAnnotated, afterMissing, samples }, null, 2));
