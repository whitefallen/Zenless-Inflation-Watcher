"use client"

import * as React from "react"

export interface AccordionItem {
  title: React.ReactNode
  content: React.ReactNode
}

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null)

  return (
    <div className="border border-[#3a3a42] bg-[#101014]">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        return (
          <div key={index} className="border-b border-[#2b2b33] last:border-b-0">
            <button
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left font-semibold text-[#f4f4f0] transition-colors hover:bg-[#18181d] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#ffd400]/50"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
            >
              <span className="min-w-0 flex-1">{item.title}</span>
              <span className="text-xs uppercase tracking-normal text-[#ffd400]">
                {isOpen ? "Close" : "Open"}
              </span>
            </button>
            {isOpen && (
              <div className="border-t border-[#2b2b33] bg-[#131316] px-4 py-4 text-sm text-[#a1a3ad]">
                {item.content}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
