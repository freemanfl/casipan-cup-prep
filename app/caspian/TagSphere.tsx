"use client";

import { useMemo, useRef, useState } from "react";
import type { OverviewTag } from "@/lib/caspian/types";

type Placed = {
  x: number;
  y: number;
  z: number;
  tag: OverviewTag;
};

function fibonacciSphere(tags: OverviewTag[]): Placed[] {
  const count = tags.length;
  const golden = Math.PI * (3 - Math.sqrt(5));
  return tags.map((tag, index) => {
    const y = 1 - (index / Math.max(count - 1, 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * index;
    return {
      x: Math.cos(theta) * radius,
      y,
      z: Math.sin(theta) * radius,
      tag,
    };
  });
}

function googleSearch(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

export function TagSphere({ tags }: { tags: OverviewTag[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    pointerId: number;
    x: number;
    y: number;
    rotX: number;
    rotY: number;
  } | null>(null);
  const dragged = useRef(false);
  const [rotation, setRotation] = useState({ x: -0.2, y: 0 });
  const points = useMemo(() => fibonacciSphere(tags.slice(0, 40)), [tags]);
  const hottest = tags[0]?.times ?? 1;

  const cosX = Math.cos(rotation.x);
  const sinX = Math.sin(rotation.x);
  const cosY = Math.cos(rotation.y);
  const sinY = Math.sin(rotation.y);

  const projected = points
    .map((point) => {
      const x1 = point.x * cosY - point.z * sinY;
      const z1 = point.x * sinY + point.z * cosY;
      const y2 = point.y * cosX - z1 * sinX;
      const z2 = point.y * sinX + z1 * cosX;
      const depth = (z2 + 1) / 2;
      return {
        tag: point.tag,
        left: 50 + x1 * 38,
        top: 50 + y2 * 38,
        depth,
        scale: 0.55 + depth * 0.75,
      };
    })
    .sort((a, b) => a.depth - b.depth);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    wrapRef.current?.setPointerCapture(event.pointerId);
    dragged.current = false;
    drag.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      rotX: rotation.x,
      rotY: rotation.y,
    };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const start = drag.current;
    if (!start || start.pointerId !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragged.current = true;
    if (!dragged.current) return;
    setRotation({
      x: Math.max(-1.15, Math.min(1.15, start.rotX + dy * 0.008)),
      y: start.rotY + dx * 0.008,
    });
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (drag.current?.pointerId === event.pointerId) {
      wrapRef.current?.releasePointerCapture(event.pointerId);
    }
    drag.current = null;
  }

  return (
    <div
      ref={wrapRef}
      className="tag-sphere"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {projected.map((item) => {
        const heat = item.tag.times / hottest;
        return (
          <a
            key={item.tag.name}
            className="tag-sphere-item"
            href={googleSearch(item.tag.name)}
            target="_blank"
            rel="noopener noreferrer"
            title={`Искать «${item.tag.name}» в Google`}
            onClick={(event) => {
              if (dragged.current) event.preventDefault();
            }}
            style={{
              left: `${item.left}%`,
              top: `${item.top}%`,
              transform: `translate(-50%, -50%) scale(${item.scale})`,
              opacity: 0.22 + item.depth * 0.78,
              zIndex: Math.round(item.depth * 200),
              fontSize: `${0.72 + heat * 0.78}rem`,
              color: `color-mix(in srgb, var(--accent) ${Math.round(30 + heat * 70)}%, var(--muted))`,
            }}
          >
            {item.tag.name}
          </a>
        );
      })}
    </div>
  );
}
