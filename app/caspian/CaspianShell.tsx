"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { QuestionsPanel } from "./QuestionsPanel";

type Tab = "questions" | "overview" | "glossary";

export function CaspianShell({
  overview,
  glossary,
}: {
  overview: ReactNode;
  glossary: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("questions");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.location.hash === "#obzor") setTab("overview");
    if (window.location.hash === "#baza") setTab("glossary");
  }, []);

  function hideAnswers() {
    const root = listRef.current;
    if (!root) return;
    root
      .querySelectorAll<HTMLDetailsElement>("details.chgk-spoiler")
      .forEach((el) => {
        el.open = false;
      });
  }

  return (
    <>
      <nav className="caspian-tabs" role="tablist" aria-label="Разделы">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "questions"}
          onClick={() => {
            setTab("questions");
            history.replaceState(null, "", "/caspian");
          }}
        >
          Вопросы
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "overview"}
          onClick={() => {
            setTab("overview");
            history.replaceState(null, "", "/caspian#obzor");
          }}
        >
          Обзор
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "glossary"}
          onClick={() => {
            setTab("glossary");
            history.replaceState(null, "", "/caspian#baza");
          }}
        >
          База
        </button>
      </nav>

      <div className="caspian-body">
        <div hidden={tab !== "questions"}>
          <div ref={listRef} className="caspian-questions">
            <QuestionsPanel />
          </div>
        </div>
        <div hidden={tab !== "overview"}>{overview}</div>
        <div hidden={tab !== "glossary"}>{glossary}</div>
      </div>

      {tab === "questions" ? (
        <div className="caspian-float">
          <button
            type="button"
            className="caspian-float-up"
            aria-label="Наверх"
            title="Наверх"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            ↑
          </button>
          <button type="button" onClick={hideAnswers}>
            Спрятать ответы
          </button>
        </div>
      ) : null}
    </>
  );
}
