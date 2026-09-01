"use client";

import { useEffect, useState } from "react";
import { LazyTour } from "./QuestionBlock";
import type { TourGroup } from "@/lib/caspian/types";

let cachedTours: TourGroup[] | null = null;
let loadPromise: Promise<TourGroup[]> | null = null;

function loadTours(): Promise<TourGroup[]> {
  if (cachedTours) return Promise.resolve(cachedTours);
  if (!loadPromise) {
    loadPromise = fetch("/api/caspian/questions")
      .then((response) => {
        if (!response.ok) throw new Error("Не удалось загрузить вопросы");
        return response.json() as Promise<TourGroup[]>;
      })
      .then((tours) => {
        cachedTours = tours;
        return tours;
      });
  }
  return loadPromise;
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;
  return `${day}.${month}.${year}`;
}

export function QuestionsPanel() {
  const [tours, setTours] = useState<TourGroup[] | null>(cachedTours);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    loadTours()
      .then((data) => {
        if (!cancelled) setTours(data);
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
  if (!tours) return <p>Загрузка вопросов…</p>;

  return (
    <>
      {tours.map((tour) => (
        <LazyTour
          key={tour.tour_id}
          title={tour.tour_title}
          editor={tour.editor}
          date={formatDate(tour.date)}
          questions={tour.questions}
        />
      ))}
    </>
  );
}
