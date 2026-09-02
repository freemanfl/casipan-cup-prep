"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  OverviewPayload,
  OverviewPeriod,
  OverviewTheme,
} from "@/lib/caspian/types";

const PIE_COLORS: Record<string, string> = {
  литература: "#38bdf8",
  история: "#fbbf24",
  кино: "#f472b6",
  искусство: "#a78bfa",
  музыка: "#fb923c",
  еда: "#34d399",
  спорт: "#f87171",
  наука: "#818cf8",
  биология: "#4ade80",
  лингвистика: "#22d3ee",
  мифология: "#c084fc",
  география: "#2dd4bf",
  архитектура: "#94a3b8",
  театр: "#e879f9",
  технологии: "#60a5fa",
  политика: "#facc15",
  другое: "#64748b",
};

function pieGradient(themes: OverviewTheme[]): string {
  let cursor = 0;
  const stops: string[] = [];
  for (const theme of themes) {
    const color = PIE_COLORS[theme.name] ?? "#475569";
    const next = cursor + theme.share * 100;
    stops.push(`${color} ${cursor}% ${next}%`);
    cursor = next;
  }
  if (!stops.length) return "#1e3a5f";
  return `conic-gradient(${stops.join(", ")})`;
}

function percent(share: number): string {
  return `${Math.round(share * 100)}%`;
}

export function OverviewDashboard() {
  const [data, setData] = useState<OverviewPayload | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<OverviewPeriod | null>(null);
  const [hover, setHover] = useState<OverviewPeriod | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/caspian/overview", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Не удалось загрузить обзор");
        return response.json() as Promise<OverviewPayload>;
      })
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Ошибка загрузки");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const maxTag = data?.tags[0]?.times ?? 1;
  const pie = useMemo(
    () => (data ? pieGradient(data.themes) : ""),
    [data],
  );

  const visibleFacts = useMemo(() => {
    if (!open) return [];
    const needle = filter.trim().toLocaleLowerCase("ru");
    if (!needle) return open.facts;
    return open.facts.filter(
      (fact) =>
        fact.name.toLocaleLowerCase("ru").includes(needle) ||
        fact.gloss.toLocaleLowerCase("ru").includes(needle),
    );
  }, [open, filter]);

  if (error) return <p>{error}</p>;
  if (!data) return <p>Собираю учебник…</p>;

  return (
    <div className="overview-page">
      <section className="overview-lead">
        <h2>Зачем эта вкладка</h2>
        <p>
          Это не конспект всех наук и не полный курс истории. Это каркас: достаточно
          широкий, чтобы с нуля или с двойки дотянуть себя до пятёрки–шестёрки, и
          достаточно короткий, чтобы его можно было пробежать, а не сдавать как
          экзамен. Школьный учебник роет глубоко в немногих местах. Здесь наоборот —
          широкое поле и чуть меньше тщательности. В этом прелесть: вы начинаете
          чувствовать эпоху, даже если не можете назвать все даты.
        </p>
        <p>
          Литература, история, искусство держат большую часть вопросов. Факты из
          третьей вкладки разложены по пятидесятилетиям — не по тому времени, о
          котором книга рассказывает, а по тому, когда она появилась. Роман 1900
          года о семнадцатом веке лежит в 1900-м: тогда его могли прочитать живые
          люди. Годы не всегда точны до единицы; важнее понять, чего ещё не было.
          В 1992 году никто не доставал из кармана айфон.
        </p>
      </section>

      <section>
        <h2>Линия времени</h2>
        <p className="overview-note">
          Проведите вбок. Наведите на точку — всплывёт имя эпохи. Нажмите — откроется
          короткий дух времени и факты, которые мы смогли привязать к этим годам
          ({data.datedCount} из {data.factCount}). Остальные ждут в «Базе»: не у
          всякой вещи в карточке есть год, и это нормально.
        </p>
        <div className="tl-scroll">
          <div className="tl-line" aria-hidden="true" />
          <div className="tl-track">
            {data.periods.map((period) => (
              <button
                key={period.start}
                type="button"
                className="tl-node"
                onMouseEnter={() => setHover(period)}
                onMouseLeave={() => setHover((current) => (current === period ? null : current))}
                onFocus={() => setHover(period)}
                onClick={() => {
                  setOpen(period);
                  setFilter("");
                }}
              >
                <span className="tl-year">{period.label}</span>
                <span className="tl-dot" />
                <span className="tl-count">
                  {period.count ? `${period.count}` : "—"}
                </span>
              </button>
            ))}
          </div>
        </div>
        <p className="tl-caption">
          {hover ? (
            <>
              <strong>{hover.title}.</strong> {hover.text}
            </>
          ) : (
            "Наведите на точку, чтобы увидеть эпоху. Нажмите, чтобы открыть факты."
          )}
        </p>
      </section>

      <section>
        <h2>На что тратить время</h2>
        <p className="overview-note">
          Круг показывает, как часто темы встречаются в этой базе. Если вы неделю
          учите только спорт, а литература занимает почти пятую часть вопросов, вы
          готовитесь к другому турниру. «Другое» — это не мусор: туда падают быт,
          еда в широком смысле, странные факты, которые не сели на полку.
        </p>
        <div className="pie-wrap">
          <div className="pie" style={{ background: pie }} aria-hidden="true" />
          <ul className="pie-legend">
            {data.themes.map((theme) => (
              <li key={theme.name}>
                <i style={{ background: PIE_COLORS[theme.name] ?? "#475569" }} />
                <span>
                  {theme.name} — {percent(theme.share)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2>Что надо знать без оправданий</h2>
        <p className="overview-note">
          Не облако всех фактов. Только то, что всплывает снова и снова у разных
          авторов. Редкую нишевую книгу сюда не пускали: если имя крупное, его стоит
          узнать заранее, а не надеяться, что «как-нибудь подумается».
        </p>
        <div className="tag-cloud">
          {data.tags.map((tag) => {
            const weight = 0.82 + (tag.times / maxTag) * 1.15;
            const hot = tag.times / maxTag;
            return (
              <span
                key={tag.name}
                className="tag-cloud-item"
                style={{
                  fontSize: `${weight}rem`,
                  color: `color-mix(in srgb, var(--accent) ${Math.round(40 + hot * 60)}%, var(--muted))`,
                }}
                title={`${tag.times} раз`}
              >
                {tag.name}
              </span>
            );
          })}
        </div>
      </section>

      <section>
        <h2>Как устроены вопросы</h2>
        <p className="overview-note">
          Содержание — в базе и на линии времени. Здесь только механика: что с вами
          делают в формулировке и куда смотреть, чтобы не крутить пустой ассоциативный
          ряд. Имена авторов пакетов нарочно не называем. Пишут по-разному, приёмы
          общие.
        </p>
        <div className="type-list">
          {data.types.map((item) => (
            <article key={item.id} className="type-card">
              <h3>{item.title}</h3>
              <p>{item.what}</p>
              <p>
                <strong>Пример.</strong> {item.example}
              </p>
              <p className="overview-note">{item.how}</p>
            </article>
          ))}
        </div>
      </section>

      {open ? (
        <div
          className="era-modal-backdrop"
          role="presentation"
          onClick={() => setOpen(null)}
        >
          <div
            className="era-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="era-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="era-close"
              onClick={() => setOpen(null)}
            >
              Закрыть
            </button>
            <p className="era-kicker">{open.label}</p>
            <h3 id="era-title">{open.title}</h3>
            <p>{open.text}</p>
            {open.facts.length ? (
              <>
                <p className="overview-note">
                  {open.facts.length} фактов, примерно этого времени. Это не всё, что
                  тогда существовало, — только то, на чём стоят вопросы этой базы.
                </p>
                {open.facts.length > 12 ? (
                  <input
                    className="glossary-search"
                    type="search"
                    value={filter}
                    onChange={(event) => setFilter(event.target.value)}
                    placeholder="Найти внутри эпохи…"
                    aria-label="Поиск по фактам эпохи"
                  />
                ) : null}
                <div className="era-facts">
                  {visibleFacts.map((fact) => (
                    <p key={fact.name} className="glossary-item">
                      <strong>{fact.name}</strong> — {fact.gloss}
                    </p>
                  ))}
                </div>
              </>
            ) : (
              <p className="overview-note">
                В карточках почти не нашлось явного года для этого отрезка. Дух
                времени всё равно полезен: соседние точки на линии часто подсказывают,
                чем жили люди рядом.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
