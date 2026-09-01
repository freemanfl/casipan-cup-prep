#!/usr/bin/env python3
"""Merge batch-*-tags.json into tag-overrides.json and rebuild annotated jsonl."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent / "dataset"
OV = ROOT / "tag-overrides.json"
BATCH = ROOT / "tag-batches"


def main() -> None:
    data = json.loads(OV.read_text(encoding="utf-8"))
    tags = dict(data.get("tags") or {})
    added = 0
    files = 0
    for path in sorted(BATCH.glob("batch-*-tags.json")):
        files += 1
        chunk = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(chunk, dict):
            continue
        for qid, val in chunk.items():
            if qid.startswith("_"):
                continue
            if not isinstance(val, list):
                continue
            if qid not in tags:
                added += 1
            tags[qid] = val
    data["tags"] = tags
    data["batch"] = f"merged {len(tags)} ids"
    OV.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"overrides {len(tags)} from {files} batch files (new/updated this merge: {added})")


if __name__ == "__main__":
    main()
