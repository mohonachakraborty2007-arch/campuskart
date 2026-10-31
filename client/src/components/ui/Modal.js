"use client";

import { useEffect, useId, useRef } from "react";

export default function Modal({ open, onClose, title, children }) {
    const ref = useRef(null);
    const titleId = useId();

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={ref}
            onClose={onClose}
            onClick={(e) => {
                if (e.target === ref.current) onClose();
            }}
            aria-labelledby={titleId}
            className="m-auto w-[calc(100%-2rem)] max-w-md rounded-card border border-border bg-surface p-0 text-foreground backdrop:bg-black/70"
        >
            <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <h2 id={titleId} className="text-xl font-bold">
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="-mr-2 -mt-2 grid h-11 w-11 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-foreground"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className="h-5 w-5 fill-none stroke-current"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            aria-hidden="true"
                        >
                            <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                    </button>
                </div>
                <div className="mt-4">{children}</div>
            </div>
        </dialog>
    );
}