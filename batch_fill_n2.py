#!/usr/bin/env python3
"""
批次補充 N2 詞條資料
"""
import json

# 定義要補充的詞條資料 (15個)
FILL_DATA = {
    "1685": {
        "word": "もたれる",
        "furigana": "もたれる",
        "meaning": "依靠、憑靠；依賴",
        "example": "壁にもたれて休んだ。",
        "exampleMeaning": "靠在牆上休息。"
    },
    "1686": {
        "word": "もったいない",
        "furigana": "もったいない",
        "meaning": "浪費可惜；過於隆重（而不敢當）",
        "example": "食べ残すのはもったいない。",
        "exampleMeaning": "剩下不吃太浪費了。"
    },
    "1687": {
        "word": "やかましい",
        "furigana": "やかましい",
        "meaning": "吵鬧的；嚴格的；愛挑剔的",
        "example": "隣の部屋がやかましい。",
        "exampleMeaning": "隔壁房間很吵。"
    },
    "1688": {
        "word": "やたら",
        "furigana": "やたら",
        "meaning": "非常、過於；不管三七二十一",
        "example": "やたらと食べる。",
        "exampleMeaning": "胡亂地大吃。"
    },
    "1689": {
        "word": "やっつける",
        "furigana": "やっつける",
        "meaning": "打倒、擊敗；草率做完",
        "example": "敵をやっつけた。",
        "exampleMeaning": "打倒了敵人。"
    },
    "1690": {
        "word": "やむをえない",
        "furigana": "やむをえない",
        "meaning": "不得已、無可奈何",
        "example": "やむをえない事情で欠席した。",
        "exampleMeaning": "因不得已的情況而缺席。"
    },
    "1691": {
        "word": "ゆでる",
        "furigana": "ゆでる",
        "meaning": "煮、燙",
        "example": "卵をゆでる。",
        "exampleMeaning": "煮雞蛋。"
    },
    "1692": {
        "word": "よこす",
        "furigana": "よこす",
        "meaning": "寄來、送來；（從旁邊）通過",
        "example": "本をよこしてください。",
        "exampleMeaning": "請把書遞給我。"
    },
    "1693": {
        "word": "わりあいに",
        "furigana": "わりあいに",
        "meaning": "比較地、意外地",
        "example": "わりあいに安い。",
        "exampleMeaning": "意外地便宜。"
    },
    "1694": {
        "word": "アイデア",
        "furigana": "アイデア",
        "meaning": "想法、點子、主意",
        "example": "いいアイデアがある。",
        "exampleMeaning": "有個好主意。"
    },
    "1695": {
        "word": "アイディア",
        "furigana": "アイディア",
        "meaning": "想法、點子（アイデア的變體）",
        "example": "新しいアイディアを出す。",
        "exampleMeaning": "提出新想法。"
    },
    "1696": {
        "word": "アクセント",
        "furigana": "アクセント",
        "meaning": "重音、口音；強調",
        "example": "アクセントが変だ。",
        "exampleMeaning": "口音很奇怪。"
    },
    "1697": {
        "word": "アンテナ",
        "furigana": "アンテナ",
        "meaning": "天線；收集情報的能力",
        "example": "テレビのアンテナを直す。",
        "exampleMeaning": "修理電視天線。"
    },
    "1698": {
        "word": "イコール",
        "furigana": "イコール",
        "meaning": "等於；平等",
        "example": "二足す二イコール四。",
        "exampleMeaning": "二加二等於四。"
    },
    "1699": {
        "word": "インキ",
        "furigana": "インキ",
        "meaning": "墨水、油墨",
        "example": "インキが切れた。",
        "exampleMeaning": "墨水用完了。"
    }
}

def main():
    # 讀取 waiting_list.json
    with open('/Users/jasonfan/.openclaw/workspace/projects/japanese-study-mobile/waiting_list.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    filled_count = 0
    for entry in data:
        entry_id = entry.get('id')
        if entry_id in FILL_DATA:
            fill = FILL_DATA[entry_id]
            entry['word'] = fill['word']
            entry['furigana'] = fill['furigana']
            entry['meaning'] = fill['meaning']
            entry['example'] = fill['example']
            entry['exampleMeaning'] = fill['exampleMeaning']
            filled_count += 1
            print(f"✓ 已補充 ID {entry_id}: {fill['word']}")
    
    # 寫回檔案
    with open('/Users/jasonfan/.openclaw/workspace/projects/japanese-study-mobile/waiting_list.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n本次補充完成: {filled_count} 個詞條")
    
    # 統計剩餘
    remaining = [e for e in data if '待補充' in e.get('meaning', '') or e.get('furigana') == '-']
    print(f"剩餘待補充: {len(remaining)} 個詞條")

if __name__ == '__main__':
    main()
