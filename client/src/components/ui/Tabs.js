"use client";

import { useId, useRef, useState } from "react";

export default function Tabs({ tabs }) {
    const [active, setActive] = useState(tabs[0].id);
    const base = useId();
    const refs = useRef([]);

    function onKeyDown(e, i) {
        let next = null;
        if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
        if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
        if (e.key === "Home") next = 0;
        if (e.key === "End") next = tabs.length - 1;
        if (next === null) return;
        e.preventDefault();
        setActive(tabs[next].id);
        refs.current[next]?.focus();
    }

    return (
        <div>
            <div
                role="tablist"
                aria-label="Seller listings"
                className="flex gap-2 border-b border-border"
            >
                {tabs.map((t, i) => {
                    const selected = t.id === active;
                    return (
                        <button
                            key={t.id}
                            ref={(el) => {
                                refs.current[i] = el;
                            }}
                            role="tab"
                            id={`${base}-tab-${t.id}`}
                            aria-selected={selected}
                            aria-controls={`${base}-panel-${t.id}`}
                            tabIndex={selected ? 0 : -1}
                            onClick={() => setActive(t.id)}
                            onKeyDown={(e) => onKeyDown(e, i)}
                            className={`-mb-px min-h-11 border-b-2 px-4 text-sm font-medium transition ${selected
                                    ? "border-primary text-foreground"
                                    : "border-transparent text-muted hover:text-foreground"
                                }`}
                        >
                            {t.label} <span className="ml-1 text-muted">{t.count}</span>
                        </button>
                    );
                })}
            </div>

            {tabs.map((t) => (
                <div
                    key={t.id}
                    role="tabpanel"
                    id={`${base}-panel-${t.id}`}
                    aria-labelledby={`${base}-tab-${t.id}`}
                    hidden={t.id !== active}
                    className="pt-6"
                >
                    {t.content}
                </div>
            ))}
        </div>
    );
}