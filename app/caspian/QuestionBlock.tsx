"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { CaspianQuestion } from "@/lib/caspian/types";

function linkify(text: string): ReactNode {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return parts.map((part, index) =>
    part.startsWith("http") ? (
      <a key={index} href={part} target="_blank" rel="noreferrer">
        {part}
      </a>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

export function QuestionBlock({ question }: { question: CaspianQuestion }) {
  return (
    <article className="chgk-q">
      <p className="chgk-q-text">
        <span className="chgk-q-label">Вопрос {question.number}:</span>{" "}
        {question.question}
      </p>
      <details className="chgk-spoiler">
        <summary>Ответ и комментарий</summary>
        <p className="chgk-field">
          <strong>Ответ:</strong> {question.answer}
        </p>
        {question.pass_criteria ? (
          <p className="chgk-field">
            <strong>Зачёт:</strong> {question.pass_criteria}
          </p>
        ) : null}
        {question.comment ? (
          <p className="chgk-field">
            <strong>Комментарий:</strong> {question.comment}
          </p>
        ) : null}
        {question.sources ? (
          <p className="chgk-field">
            <strong>Источник(и):</strong> {linkify(question.sources)}
          </p>
        ) : null}
      </details>
    </article>
  );
}

export function LazyTour({
  title,
  editor,
  date,
  questions,
}: {
  title: string;
  editor: string;
  date: string;
  questions: CaspianQuestion[];
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setShown(true);
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="chgk-tour">
      <h3>{title}</h3>
      <p className="chgk-tour-meta">
        {date} · {editor} · {questions.length}{" "}
        {questions.length === 1 ? "вопрос" : "вопросов"}
      </p>
      {shown ? (
        questions.map((question) => (
          <QuestionBlock key={question.question_id} question={question} />
        ))
      ) : (
        <div
          aria-hidden="true"
          style={{ height: Math.min(questions.length, 8) * 72 }}
        />
      )}
    </section>
  );
}
