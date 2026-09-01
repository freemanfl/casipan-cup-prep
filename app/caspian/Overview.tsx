"use client";

import { useEffect, useMemo, useState } from "react";
import type { CaspianFact } from "@/lib/caspian/types";

export function Overview() {
  const [facts, setFacts] = useState<CaspianFact[] | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/caspian/facts?t=" + Date.now(), { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Не удалось загрузить базу");
        return response.json() as Promise<CaspianFact[]>;
      })
      .then((data) => {
        if (!cancelled) setFacts(data);
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

  const filtered = useMemo(() => {
    if (!facts) return [];
    const needle = query.trim().toLocaleLowerCase("ru");
    if (!needle) return facts;
    return facts.filter(
      (fact) =>
        fact.name.toLocaleLowerCase("ru").includes(needle) ||
        fact.gloss.toLocaleLowerCase("ru").includes(needle),
    );
  }, [facts, query]);

  if (error) return <p>{error}</p>;
  if (!facts) return <p>Загрузка базы…</p>;

  return (
    <div className="glossary">
      <input
        className="glossary-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Найти: цвельф, Холмс, банановая кожура…"
        aria-label="Поиск по базе"
      />
      <p className="glossary-meta">
        {query.trim()
          ? `${filtered.length} из ${facts.length}`
          : `${facts.length} фактов`}
      </p>
      <div className="glossary-list">
        {filtered.map((fact) => (
          <p key={fact.name} className="glossary-item">
            <strong>{fact.name}</strong>
            {fact.gloss ? <> — {fact.gloss}</> : null}
          </p>
        ))}
      </div>
    </div>
  );
}
