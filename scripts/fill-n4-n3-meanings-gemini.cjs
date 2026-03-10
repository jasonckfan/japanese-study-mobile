const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dataPath = path.join(__dirname, '..', 'src', 'data', 'jlpt-vocab.json');
const model = process.env.GEMINI_MODEL || 'gemini-3.1-pro-preview';
const batchSize = Number(process.env.BATCH_SIZE || 40);

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

function isPlaceholder(s=''){
  return /待補充/.test(String(s));
}

function chunk(arr, n){
  const out=[];
  for(let i=0;i<arr.length;i+=n) out.push(arr.slice(i,i+n));
  return out;
}

function buildPrompt(items){
  return `你是日語教材編輯。請為以下 JLPT 詞條補全欄位，使用繁體中文。
要求：
1) meaning：精簡、自然（2-10字）
2) example：自然日文短句（10-30字）
3) exampleMeaning：上述例句的繁中翻譯
4) furigana：若原值是"-"，請填平假名讀音；若已有值就沿用原值
5) 只輸出 JSON，不要 markdown，不要多餘文字。
6) 輸出格式必須是陣列，每項：{"id":"...","meaning":"...","example":"...","exampleMeaning":"...","furigana":"..."}

詞條：\n${JSON.stringify(items)}`;
}

function runGemini(prompt){
  const escaped = prompt.replace(/"/g, '\\"');
  const cmd = `gemini --model ${model} --output-format json "${escaped}"`;
  const out = execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  const obj = JSON.parse(out);
  if (obj.response) {
    try { return JSON.parse(obj.response); } catch (_) {}
  }
  if (Array.isArray(obj)) return obj;
  throw new Error('Unable to parse Gemini response');
}

(async () => {
  const raw = fs.readFileSync(dataPath, 'utf8');
  const data = JSON.parse(raw);

  const targets = data.filter(r => (r.level === 'N4' || r.level === 'N3') && (isPlaceholder(r.meaning) || isPlaceholder(r.exampleMeaning)));
  console.log(`targets=${targets.length}`);
  const batches = chunk(targets, batchSize);

  let updated = 0;
  for(let i=0;i<batches.length;i++){
    const b = batches[i];
    const req = b.map(r => ({ id: r.id, word: r.word, furigana: r.furigana || '-', example: r.example || '' }));

    let ok = false;
    let resp;
    for (let attempt=1; attempt<=3; attempt++) {
      try {
        resp = runGemini(buildPrompt(req));
        ok = true;
        break;
      } catch (e) {
        if (attempt === 3) throw e;
        await sleep(1000 * Math.pow(2, attempt - 1));
      }
    }

    const byId = new Map((resp || []).map(x => [String(x.id), x]));
    for (const row of b) {
      const got = byId.get(String(row.id));
      if (!got) continue;
      if (got.meaning) row.meaning = String(got.meaning).trim();
      if (got.example) row.example = String(got.example).trim();
      if (got.exampleMeaning) row.exampleMeaning = String(got.exampleMeaning).trim();
      if ((row.furigana === '-' || !row.furigana) && got.furigana) row.furigana = String(got.furigana).trim();
      updated += 1;
    }

    console.log(`batch ${i+1}/${batches.length} done, updated=${updated}`);
    await sleep(3000);
  }

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n', 'utf8');

  const remainN4 = data.filter(r => r.level==='N4' && (isPlaceholder(r.meaning)||isPlaceholder(r.exampleMeaning))).length;
  const remainN3 = data.filter(r => r.level==='N3' && (isPlaceholder(r.meaning)||isPlaceholder(r.exampleMeaning))).length;

  console.log(JSON.stringify({ updated, remainN4, remainN3 }, null, 2));
})();