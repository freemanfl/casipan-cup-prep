#!/usr/bin/env python3
"""Merge card-batches/batch-*-cards.json into tag-overrides.json (card phrases)."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent / "dataset"
OV = ROOT / "tag-overrides.json"
BATCH = ROOT / "card-batches"


def main() -> None:
    data = json.loads(OV.read_text(encoding="utf-8"))
    tags = dict(data.get("tags") or {})
    files = 0
    updated = 0
    missing_files = []
    for path in sorted(BATCH.glob("batch-*.json")):
        if path.name.endswith("-cards.json"):
            continue
        cards_path = path.with_name(path.stem + "-cards.json")
        if not cards_path.exists():
            missing_files.append(cards_path.name)
            continue
        files += 1
        chunk = json.loads(cards_path.read_text(encoding="utf-8"))
        if not isinstance(chunk, dict):
            continue
        src = json.loads(path.read_text(encoding="utf-8"))
        want = {row["id"] for row in src}
        for qid in want:
            val = chunk.get(qid)
            if not isinstance(val, list) or not val:
                continue
            phrases = [str(x).strip() for x in val if str(x).strip()]
            if not phrases:
                continue
            tags[qid] = phrases[:3]
            updated += 1
    data["tags"] = tags
    OV.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"merged {updated} ids from {files} card files; missing {len(missing_files)}")
    if missing_files[:8]:
        print("missing examples:", ", ".join(missing_files[:8]))


if __name__ == "__main__":
    main()
