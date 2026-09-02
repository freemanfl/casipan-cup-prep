"use client";

import { useEffect, useState } from "react";
import type { CaspianFact } from "@/lib/caspian/types";

export function Glossary() {
  const [facts, setFacts] = useState<CaspianFact[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/caspian/facts", { cache: "no-store" })
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

  if (error) return <p>{error}</p>;
  if (!facts) return <p>Загрузка базы…</p>;

  return (
    <div className="glossary">
      <p className="overview-note">
        Короткий словарь к вопросам: имя и суть. Одна строка не заменяет статью, но
        избавляет от необходимости гуглить каждую мелочь посреди подготовки.
      </p>
      <p className="glossary-meta">{facts.length} фактов</p>
      <div className="glossary-list">
        {facts.map((fact) => (
          <p key={fact.name} className="glossary-item">
            <strong>{fact.name}</strong>
            {fact.gloss ? <> — {fact.gloss}</> : null}
          </p>
        ))}
      </div>
    </div>
  );
}
