"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

export function TagSphere({ tags }: { tags: OverviewTag[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rotation = useRef({ x: -0.2, y: 0 });
  const tilt = useRef({ x: -0.2, y: 0 });
  const [frame, setFrame] = useState(0);
  const points = useMemo(() => fibonacciSphere(tags.slice(0, 40)), [tags]);
  const hottest = tags[0]?.times ?? 1;

  useEffect(() => {
    let raf = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      const delta = Math.min(40, now - previous);
      previous = now;
      rotation.current.y += 0.00032 * delta;
      rotation.current.x += (tilt.current.x - rotation.current.x) * 0.05;
      setFrame((value) => value + 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  function onMove(event: React.MouseEvent<HTMLDivElement>) {
    const box = wrapRef.current?.getBoundingClientRect();
    if (!box) return;
    const nx = ((event.clientX - box.left) / box.width) * 2 - 1;
    const ny = ((event.clientY - box.top) / box.height) * 2 - 1;
    tilt.current.x = -0.2 + ny * 0.45;
    tilt.current.y = nx * 0.7;
  }

  const cosX = Math.cos(rotation.current.x);
  const sinX = Math.sin(rotation.current.x);
  const cosY = Math.cos(rotation.current.y + tilt.current.y * 0.4);
  const sinY = Math.sin(rotation.current.y + tilt.current.y * 0.4);
  void frame;

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

  return (
    <div
      ref={wrapRef}
      className="tag-sphere"
      onMouseMove={onMove}
      onMouseLeave={() => {
        tilt.current = { x: -0.2, y: 0 };
      }}
    >
      {projected.map((item) => {
        const heat = item.tag.times / hottest;
        return (
          <span
            key={item.tag.name}
            className="tag-sphere-item"
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
          </span>
        );
      })}
    </div>
  );
}
