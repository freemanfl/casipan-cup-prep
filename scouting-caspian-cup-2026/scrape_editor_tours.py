#!/usr/bin/env python3
"""Fetch db.chgk.info print pages for skeleton tours and build a theme dataset."""

from __future__ import annotations

import html as html_lib
import json
import re
import time
import urllib.error
import urllib.request
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SKELETON = Path(__file__).resolve().parents[1] / "chgk_editor_tours_skeleton.json"
DATASET_DIR = ROOT / "dataset"
STATS_DIR = ROOT / "stats"
CACHE_DIR = ROOT / "cache" / "tours"

UA = "CaspianCup2026-scouting/1.0 (local research; polite crawl)"
SLEEP_S = 0.35
RETRIES = 3

THEME_RULES: list[tuple[str, tuple[str, ...]]] = [
    (
        "literature",
        (
            "роман", "поэт", "поэм", "стихотвор", "писател", "литератур", "повесть",
            "рассказ", "гоголь", "пушкин", "толстой", "достоевск", "шекспир",
            "борхес", "набоков", "чехов", "булгаков", "гёте", "данте", "оммар",
            "фразеолог", "басн", "сонет", "глава романа", "литературн",
        ),
    ),
    (
        "cinema",
        (
            "фильм", "кино", "режиссёр", "режиссер", "актёр", "актер", "актрис",
            "оскар", "голливуд", "мультфильм", "сериал", "кинопрем", "сценари",
        ),
    ),
    (
        "music",
        (
            "песн", "музык", "альбом", "композитор", "опер", "балет", "концерт",
            "гитар", "симфон", "рок-", "джаз", "певец", "певиц", "саундтрек",
            "ноктюрн", "сонат",
        ),
    ),
    (
        "history",
        (
            "император", "императриц", "царь", "цариц", "революц", "войн",
            "импери", "средневек", "древн", "династи", "наполеон", "екатерин",
            "петр i", "пётр i", "ссср", "советск", "век н. э", "до н. э",
            "истори", "монарх", "феодал",
        ),
    ),
    (
        "art",
        (
            "картин", "художник", "живопис", "скульптур", "музей", "ван гог",
            "пикассо", "рембрант", " tretyakov", "третьяков", "полотн",
            "портрет", "натюрморт", "фреск", "икон ",
        ),
    ),
    (
        "science",
        (
            "физик", "хими", "атом", "молекул", "формул", "учёный", "ученый",
            "нобелев", "математи", "теорем", "планета", "астроном", "элемент",
            "реакци", "лаборатор", "наук",
        ),
    ),
    (
        "biology",
        (
            "животн", "растени", "биологи", "ген ", "клетк", "насеком",
            "птиц", "млекопитающ", "зоолог", "ботаник", "вирус", "бактер",
        ),
    ),
    (
        "geography",
        (
            "остров", "океан", "географи", "столиц", "река ", "реки ",
            "горн", "пустын", "континент", "полуостров", "архипелаг",
            "широт", "меридиан",
        ),
    ),
    (
        "sports",
        (
            "спорт", "футбол", "олимпи", "чемпион", "теннис", "хокке",
            "баскетбол", "матч", "стадион", "фифа", "уефа", "шахмат",
            "боксёр", "боксер", "гонк", "формула-1",
        ),
    ),
    (
        "linguistics",
        (
            "этимолог", "алфавит", "латинск", "перевод", "диалект",
            "грамматик", "словоформ", "приставк", "суффикс", "омоним",
            "синоним", "язык ",
        ),
    ),
    (
        "mythology_religion",
        (
            "миф", "богин", "олимп", "библи", "евангел", "античн",
            "христиан", "ислам", "будд", "храм", "церк", "свят",
            "бог ", "боги ", "зевс", "афина", "аполлон", "корана",
        ),
    ),
    (
        "politics",
        (
            "президент", "парламент", "министр", "политик", "выбор",
            "депутат", "диктатор", "конституц", "правительств",
        ),
    ),
    (
        "architecture",
        (
            "архитект", "собор", "башн", "дворец", "здани", "небоскрёб",
            "небоскреб", "фасад", "колонн",
        ),
    ),
    (
        "technology",
        (
            "компьютер", "интернет", "программ", "телефон", "google",
            "смартфон", "алгоритм", "робот", "сайт ",
        ),
    ),
    (
        "food",
        (
            "блюд", "кухн", "рецепт", "вино", "пиво", "кулинар",
            "ресторан", "еда", "напиток",
        ),
    ),
    (
        "theater",
        ("театр", "пьес", "спектакл", "драматург", "сцена "),
    ),
]


def extract_fact(answer: str) -> str:
    """One short label: the fact itself (Гамлет, Gretna Green), not a theme."""
    s = answer or ""
    s = s.replace("ё", "е").replace("Ё", "Е")
    s = re.sub(r"[\u0300-\u036f]", "", s)  # combining stress
    s = s.translate(str.maketrans({"́": "", "̀": "", "\xa0": " "}))

    numbered = re.findall(r"\d+\.\s*([^;]+)", s)
    if len(numbered) >= 2:
        parts = [extract_fact(p) for p in numbered]
        parts = [p for p in parts if p]
        return " / ".join(parts[:2])

    s = re.sub(r"\[.*?\]", " ", s)
    s = s.split(";")[0]
    s = re.sub(r"[«»„“”\"'`]", "", s)
    s = re.sub(r"\s+", " ", s).strip(" \t.,;:—–-")
    s = re.sub(
        r"^(в|во)\s+(деревне|городе|селе|поселке|посёлке|стране|столице)\s+",
        "",
        s,
        flags=re.I,
    )
    if re.match(r"^(в|во|на)\s+\S+$", s, flags=re.I):
        s = re.sub(r"^(в|во|на)\s+", "", s, flags=re.I)
    s = re.sub(r"\s+", " ", s).strip(" \t.,;:—–-")
    return s.casefold()


def classify_themes(blob: str) -> tuple[list[str], str]:
    text = blob.lower()
    scores: dict[str, int] = {}
    for theme, keys in THEME_RULES:
        score = sum(text.count(k) for k in keys)
        if score:
            scores[theme] = score
    if not scores:
        return ["other"], "other"
    ranked = sorted(scores.items(), key=lambda kv: (-kv[1], kv[0]))
    themes = [name for name, _ in ranked if _ > 0]
    return themes, themes[0]


def strip_tags(raw: str) -> str:
    raw = re.sub(r"<br\s*/?>", "\n", raw, flags=re.I)
    raw = re.sub(r"<[^>]+>", " ", raw)
    raw = html_lib.unescape(raw)
    return re.sub(r"\s+", " ", raw).strip()


def parse_print_html(raw: str, tour_id: str) -> dict:
    title_m = re.search(r"<h1>(.*?)</h1>", raw, re.S)
    title = strip_tags(title_m.group(1)) if title_m else tour_id
    date_m = re.search(r"<strong>Дата:</strong>\s*([^<]+)", raw)
    date = date_m.group(1).strip() if date_m else ""
    editor_m = re.search(r"class='editor'>.*?</strong>\s*(.*?)</div>", raw, re.S)
    listed_editor = strip_tags(editor_m.group(1)) if editor_m else ""

    questions = []
    chunks = re.split(r'<div class="question" id="', raw)
    for chunk in chunks[1:]:
        qid, rest = chunk.split('"', 1)
        body = rest

        def field(cls: str) -> str:
            m = re.search(
                rf'<strong class="{cls}">.*?</strong>(.*?)(?:</p>|<strong class=)',
                body,
                re.S,
            )
            return strip_tags(m.group(1)) if m else ""

        q_text = field("Question")
        q_text = re.sub(r"^Вопрос\s+\d+:\s*", "", q_text)
        item = {
            "question_id": qid,
            "question": q_text,
            "answer": field("Answer"),
            "pass_criteria": field("PassCriteria"),
            "comment": field("Comments"),
            "sources": field("Sources"),
            "author": field("Authors"),
            "has_handout": 'class="razdatka"' in body or "Раздаточный материал" in body,
        }
        blob = " ".join(
            [
                item["question"],
                item["answer"],
                item["comment"],
                item["sources"],
            ]
        )
        themes, primary = classify_themes(blob)
        item["themes"] = themes
        item["primary_theme"] = primary
        item["fact"] = extract_fact(item["answer"])
        item["char_len"] = len(item["question"])
        questions.append(item)

    return {
        "tour_id": tour_id,
        "title": title,
        "date": date,
        "listed_editor": listed_editor,
        "question_count": len(questions),
        "questions": questions,
    }


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "ru"})
    last_err: Exception | None = None
    for attempt in range(RETRIES):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return resp.read().decode("utf-8", "replace")
        except (urllib.error.URLError, TimeoutError) as exc:
            last_err = exc
            time.sleep(1.2 * (attempt + 1))
    raise RuntimeError(f"failed {url}: {last_err}")


def tour_match_score(tour_id: str, question_id: str) -> int:
    """Prefer the tour page the HTML id actually belongs to (child over parent package)."""
    if (
        question_id == tour_id
        or question_id.startswith(tour_id + "-")
        or question_id.startswith(tour_id + ".")
    ):
        return len(tour_id)
    return -1


def load_or_fetch_tour(tour_id: str) -> dict:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_path = CACHE_DIR / f"{tour_id}.html"
    if cache_path.exists() and cache_path.stat().st_size > 500:
        raw = cache_path.read_text(encoding="utf-8", errors="replace")
    else:
        url = f"https://db.chgk.info/tour/{tour_id}/print"
        raw = fetch(url)
        cache_path.write_text(raw, encoding="utf-8")
        time.sleep(SLEEP_S)
    return parse_print_html(raw, tour_id)


def main() -> None:
    skeleton = json.loads(SKELETON.read_text(encoding="utf-8"))
    DATASET_DIR.mkdir(parents=True, exist_ok=True)
    STATS_DIR.mkdir(parents=True, exist_ok=True)

    questions_by_id: dict[str, dict] = {}
    tours_out: list[dict] = []
    errors: list[dict] = []

    total_tours = sum(len(ed["tours"]) for ed in skeleton)
    done = 0
    for ed in skeleton:
        editor = ed["editor"]
        print(f"\n=== {editor}: {len(ed['tours'])} tours ===", flush=True)
        for tour in ed["tours"]:
            tour_id = tour["tour_id"]
            done += 1
            try:
                parsed = load_or_fetch_tour(tour_id)
            except Exception as exc:  # noqa: BLE001
                errors.append({"editor": editor, "tour_id": tour_id, "error": str(exc)})
                print(f"  FAIL {tour_id}: {exc}", flush=True)
                continue
            tours_out.append(
                {
                    "editor": editor,
                    "tour_id": tour_id,
                    "url": tour["url"],
                    "title": parsed["title"],
                    "date": parsed["date"],
                    "listed_editor": parsed["listed_editor"],
                    "question_count": parsed["question_count"],
                }
            )
            for q in parsed["questions"]:
                row = {
                    "editor": editor,
                    "editor_profile": ed["profile_url"],
                    "tour_id": tour_id,
                    "tour_url": tour["url"],
                    "tour_title": parsed["title"],
                    "tour_date": parsed["date"],
                    **q,
                }
                qid = row["question_id"]
                prev = questions_by_id.get(qid)
                if prev is None or tour_match_score(tour_id, qid) > tour_match_score(
                    prev["tour_id"], qid
                ):
                    questions_by_id[qid] = row
            print(
                f"  [{done}/{total_tours}] {tour_id}: {parsed['question_count']} q  {parsed['title'][:60]}",
                flush=True,
            )

    all_questions = list(questions_by_id.values())
    questions_path = DATASET_DIR / "questions.jsonl"
    with questions_path.open("w", encoding="utf-8") as fh:
        for row in all_questions:
            fh.write(json.dumps(row, ensure_ascii=False) + "\n")
    (DATASET_DIR / "tours.json").write_text(
        json.dumps(tours_out, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (DATASET_DIR / "errors.json").write_text(
        json.dumps(errors, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    by_editor: dict[str, dict] = {}
    overall_primary = Counter()
    overall_multi = Counter()
    for ed in skeleton:
        name = ed["editor"]
        qs = [q for q in all_questions if q["editor"] == name]
        primary = Counter(q["primary_theme"] for q in qs)
        multi = Counter(t for q in qs for t in q["themes"])
        overall_primary.update(primary)
        overall_multi.update(multi)
        handouts = sum(1 for q in qs if q["has_handout"])
        lengths = [q["char_len"] for q in qs if q["char_len"]]
        by_editor[name] = {
            "questions": len(qs),
            "tours_ok": sum(1 for t in tours_out if t["editor"] == name),
            "tours_listed": ed["tour_count"],
            "handout_share": round(handouts / len(qs), 3) if qs else 0,
            "avg_question_chars": round(sum(lengths) / len(lengths), 1) if lengths else 0,
            "primary_theme_counts": dict(primary.most_common()),
            "primary_theme_share": {
                k: round(v / len(qs), 3) for k, v in primary.most_common()
            }
            if qs
            else {},
            "multi_theme_counts": dict(multi.most_common()),
        }

    overview = {
        "editors": [ed["editor"] for ed in skeleton],
        "tours_attempted": total_tours,
        "tours_ok": len(tours_out),
        "questions": len(all_questions),
        "errors": len(errors),
        "overall_primary_theme_counts": dict(overall_primary.most_common()),
        "overall_primary_theme_share": {
            k: round(v / len(all_questions), 3) for k, v in overall_primary.most_common()
        }
        if all_questions
        else {},
        "by_editor": by_editor,
    }
    (STATS_DIR / "overview.json").write_text(
        json.dumps(overview, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print("\nDONE", json.dumps({k: overview[k] for k in ("tours_ok", "questions", "errors")}, ensure_ascii=False))


if __name__ == "__main__":
    main()
