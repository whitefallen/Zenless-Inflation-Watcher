
"use client";
import * as React from "react";

export interface AccordionItem {
  title: React.ReactNode;
  content: React.ReactNode;
}

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);
  return (
    <div className="divide-y rounded-lg border bg-card">
      {items.map((item, idx) => (
        <div key={idx}>
          <button
            className="w-full flex justify-between items-center px-4 py-3 text-left font-semibold hover:bg-muted focus:outline-none"
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            aria-expanded={openIndex === idx}
          >
            <span>{item.title}</span>
            <span>{openIndex === idx ? "▲" : "▼"}</span>
          </button>
          {openIndex === idx && (
            <div className="px-4 pb-4 text-sm text-muted-foreground">{item.content}</div>
          )}
        </div>
      ))}
    </div>
  );
}
