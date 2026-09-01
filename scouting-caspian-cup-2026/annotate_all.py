#!/usr/bin/env python3
"""Annotate every scraped question with styles / themes / knowledge_tags / card."""

from __future__ import annotations

import json
import re
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "dataset" / "questions.jsonl"
GOLD = ROOT / "dataset" / "about-experiment.json"
TAGS = ROOT / "dataset" / "tag-overrides.json"
OUT = ROOT / "dataset" / "вопросы-основа.jsonl"

THEME_RU = {
    "literature": "литература",
    "cinema": "кино",
    "music": "музыка",
    "history": "история",
    "art": "искусство",
    "science": "наука",
    "biology": "биология",
    "geography": "география",
    "sports": "спорт",
    "linguistics": "лингвистика",
    "mythology_religion": "мифология",
    "politics": "политика",
    "architecture": "архитектура",
    "technology": "технологии",
    "theater": "театр",
}

PLACEHOLDER_RE = re.compile(
    r"(?:«|\")?(?:ИКС|ИКСА|ИКСУ|ИКСОМ|ИКСЕ|ИГРЕК|ИГРЕКА|ЭКС|ЭКСА|ЭКСУ|ЭКСОМ|"
    r"АЛЬФА|АЛЬФУ|АЛЬФЫ|БЕТА|БЕТУ|"
    r"ПЕРВЫ(?:Й|Е|Х|М|МИ)|ВТОР(?:ОЙ|ЫЕ|ЫХ|ЫМ|ЫМИ)|ТРЕТ(?:ИЙ|ЬИ|ЬИХ))"
    r"(?:»|\")?",
    re.I,
)
ONA_RE = re.compile(r"«\s*ОНА\s*»|\"ОНА\"|(?<![А-Яа-яЁё])ОНА(?![А-Яа-яЁё])")
CHANGED_RE = re.compile(
    r"изменен|заменен[аыо]? две букв|заменены две|слово, которое мы изменили|"
    r"в исходном виде|подменен|мы изменили|заменили слово|заменены \w+ букв",
    re.I,
)
FORM_RE = re.compile(
    r"двумя словами|одним словом|три слова|четыре слова|"
    r"\b\d+\s+букв|начинающ\w+ на одн|обе гласн|пяти английск|"
    r"ответ.*состоять|напишите.*букв",
    re.I,
)
HINT_RE = re.compile(r"\bнам[её]к|\bпародия\b|\bкарикатур|\bпостер|\bреклам", re.I)
PARALLEL_RE = re.compile(
    r"сходн\w+ услови|а человек,|другой человек|параллел|подобно тому",
    re.I,
)
QUOTE_RE = re.compile(r"цитир|почти дословн|в романе .{3,40} (?:пишет|говорит)", re.I)

WIKI_RE = re.compile(r"wikipedia\.org/wiki/([^\s\#\"'<>]+)", re.I)


def norm(s: str) -> str:
    s = (s or "").replace("ё", "е").replace("Ё", "Е")
    s = re.sub(r"[\u0300-\u036f]", "", s)
    return s.casefold()


def in_text(needle: str, haystack: str) -> bool:
    n, h = norm(needle), norm(haystack)
    if len(n) < 3:
        return n in h
    return n in h


def detect_styles(q: str, has_handout: bool) -> list[str]:
    styles: list[str] = []
    if has_handout or q.startswith("Раздаточный") or "Раздаточный материал" in q:
        styles.append("раздатка")
    if PLACEHOLDER_RE.search(q) or ONA_RE.search(q) or re.search(
        r"«ОНО»|«ОНИ»|(?<![А-ЯЁа-яё])ИМ(?![А-Яа-яё])", q
    ):
        styles.append("замена слова")
    if CHANGED_RE.search(q):
        styles.append("замена в тексте")
    if FORM_RE.search(q):
        styles.append("форма ответа")
    if HINT_RE.search(q):
        styles.append("намёк")
    if PARALLEL_RE.search(q):
        styles.append("параллель")
    if QUOTE_RE.search(q):
        styles.append("скрытая цитата")
    if not styles:
        styles.append("прямой")
    return styles


def primary_themes(row: dict) -> list[str]:
    raw = row.get("themes") or []
    if isinstance(raw, str):
        raw = [raw]
    out = []
    for t in raw:
        ru = THEME_RU.get(t)
        if ru and ru not in out:
            out.append(ru)
    if not out:
        pt = THEME_RU.get(row.get("primary_theme") or "")
        if pt:
            out.append(pt)
        else:
            out.append("другое")
    return out[:4]


def wiki_titles(sources: str) -> list[str]:
    titles = []
    for raw in WIKI_RE.findall(sources or ""):
        raw = urllib.parse.unquote(raw).rstrip(".,;)" )
        raw = raw.replace("_", " ")
        raw = re.sub(r"\s*\([^)]*\)?\s*$", "", raw).strip()
        raw = re.sub(r",.*", "", raw).strip()
        if 2 <= len(raw) <= 60:
            titles.append(raw)
    return titles


def quoted_titles(text: str) -> list[str]:
    found = re.findall(r"«([^»]{2,70})»", text or "")
    found += re.findall(r'"([A-Za-z][^"]{2,70})"', text or "")
    return [t.strip() for t in found]


def clean_answer(answer: str) -> str:
    s = answer or ""
    s = re.sub(r"\[.*?\]", " ", s)
    s = s.split(";")[0]
    s = re.sub(r"[«»„“”\"'`]", "", s)
    s = re.sub(r"\s+", " ", s).strip(" \t.,;:—–-")
    s = re.sub(r"^(в|во)\s+(деревне|городе|селе)\s+", "", s, flags=re.I)
    return s.strip()


def knowledge_tags(question: str, answer: str, comment: str, sources: str) -> list[str]:
    """Famous thing to retrieve — skip names already given in the question (the mirror)."""
    tags: list[str] = []
    for title in wiki_titles(sources) + quoted_titles(comment):
        if in_text(title, question):
            continue
        tags.append(title)
    ans = clean_answer(answer)
    if ans and len(ans.split()) <= 6 and not in_text(ans, question):
        tags.append(ans)
    seen = set()
    out = []
    for t in tags:
        key = norm(t)
        if key in seen or len(key) < 2:
            continue
        seen.add(key)
        out.append(t)
        if len(out) >= 4:
            break
    return out


def take_by(styles: list[str]) -> str:
    if "прямой" in styles and len(styles) == 1:
        return "knowledge"
    if "замена в тексте" in styles or "намёк" in styles or "параллель" in styles:
        return "mixed"
    if "скрытая цитата" in styles and "замена слова" in styles:
        return "logic"
    if "замена слова" in styles:
        return "mixed"
    return "knowledge"


DASH_SPLIT = re.compile(r"\s+[—–]\s+")


def study_phrases(tags: list[str]) -> list[str]:
    """Card lines: the thing plus what it is."""
    tags = [t.strip() for t in (tags or []) if t and str(t).strip()]
    if not tags:
        return []
    if all(" — " in t or " – " in t for t in tags):
        return tags[:3]
    if len(tags) == 1:
        return tags
    if len(tags) == 2:
        a, b = tags
        if " — " in a or " — " in b:
            return tags[:2]
        return [f"{a} — {b}"]
    return [f"{tags[0]} — {', '.join(tags[1:])}"]


def clean_label(s: str) -> str:
    s = (s or "").strip().strip(" «»\"'`")
    s = re.sub(r"\s+", " ", s)
    return s.strip(" .;,")


def coarse_tags(phrases: list[str]) -> list[str]:
    """Short labels for grouping: the name, not the definition."""
    out: list[str] = []
    seen: set[str] = set()

    def add(raw: str) -> None:
        label = clean_label(raw)
        if not label:
            return
        words = label.split()
        if len(words) > 4:
            quoted = re.findall(r"«([^»]{2,40})»", label)
            if quoted:
                label = quoted[0]
            else:
                stop = {
                    "на", "из", "в", "во", "с", "со", "для", "по", "у", "к", "ко",
                    "от", "о", "об", "над", "под", "при", "без", "до", "за", "через",
                }
                kept = [words[0]]
                for w in words[1:]:
                    if w.casefold() in stop and len(kept) >= 2:
                        break
                    kept.append(w)
                    if len(kept) >= 3:
                        break
                label = " ".join(kept)
        key = norm(label)
        if not key or key in seen:
            return
        seen.add(key)
        out.append(label)

    for phrase in phrases or []:
        parts = DASH_SPLIT.split(phrase.strip(), maxsplit=1)
        left = parts[0].split(";")[0]
        if re.search(r"\s+и\s+", left) and len(left.split()) <= 8:
            for chunk in re.split(r"\s+и\s+", left):
                add(chunk)
        else:
            add(left)
        if len(parts) == 2:
            right = parts[1].split(";")[0].strip()
            if 1 <= len(right.split()) <= 3 and "," not in right and len(right) <= 40:
                add(right)
        if len(out) >= 4:
            break
    if not out and phrases:
        add(phrases[0])
    return out[:4]


def annotate(row: dict, gold: dict[str, dict], tag_overrides: dict[str, list[str]]) -> dict:
    qid = row["question_id"]
    if qid in gold:
        g = gold[qid]
        return {
            "question_id": qid,
            "editor": row["editor"],
            "tour_id": row["tour_id"],
            "tour_title": row.get("tour_title", ""),
            "styles": g["styles"],
            "primary_themes": g["primary_themes"],
            "knowledge_tags": g["knowledge_tags"],
            "take_by": g["take_by"],
            "card": g["card"],
            "question": row["question"],
            "answer": row["answer"],
            "pass_criteria": row.get("pass_criteria") or "",
            "comment": row.get("comment") or "",
            "sources": row.get("sources") or "",
            "has_handout": bool(row.get("has_handout")),
        }
    styles = detect_styles(row["question"], bool(row.get("has_handout")))
    if qid in tag_overrides:
        phrases = study_phrases(tag_overrides[qid])
    else:
        phrases = study_phrases(
            knowledge_tags(
                row["question"], row.get("answer", ""), row.get("comment", ""), row.get("sources", "")
            )
        )
    return {
        "question_id": qid,
        "editor": row["editor"],
        "tour_id": row["tour_id"],
        "tour_title": row.get("tour_title", ""),
        "styles": styles,
        "primary_themes": primary_themes(row),
        "knowledge_tags": coarse_tags(phrases),
        "take_by": take_by(styles),
        "card": phrases[:3],
        "question": row["question"],
        "answer": row["answer"],
        "pass_criteria": row.get("pass_criteria") or "",
        "comment": row.get("comment") or "",
        "sources": row.get("sources") or "",
        "has_handout": bool(row.get("has_handout")),
    }


def main() -> None:
    gold_items = json.loads(GOLD.read_text(encoding="utf-8")).get("items", [])
    gold = {i["question_id"]: i for i in gold_items}
    tag_overrides = json.loads(TAGS.read_text(encoding="utf-8")).get("tags", {})

    n = 0
    n_manual = 0
    with SRC.open(encoding="utf-8") as inf, OUT.open("w", encoding="utf-8") as outf:
        for line in inf:
            if not line.strip():
                continue
            row = json.loads(line)
            if row["question_id"] in gold or row["question_id"] in tag_overrides:
                n_manual += 1
            outf.write(json.dumps(annotate(row, gold, tag_overrides), ensure_ascii=False) + "\n")
            n += 1
    print(f"wrote {n} -> {OUT} (manual tags {n_manual})")


if __name__ == "__main__":
    main()
