import type { Metadata, Viewport } from "next";
import "./caspian.css";

export const metadata: Metadata = {
  title: "Каспийский кубок 2026",
  description: "Вопросы шести редакторов и как к ним готовиться",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function CaspianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="caspian-site">{children}</div>;
}
