"use client";

import { useState } from "react";

export default function ImageGallery({ title, count = 1, images = [] }) {
    const total = images.length || count;
    const [index, setIndex] = useState(0);

    function onKeyDown(e) {
        if (e.key === "ArrowRight") {
            e.preventDefault();
            setIndex((i) => (i + 1) % total);
        }
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            setIndex((i) => (i - 1 + total) % total);
        }
    }

    return (
        <div onKeyDown={onKeyDown}>
            <div
                tabIndex={0}
                role="group"
                aria-roledescription="gallery"
                aria-label={`${title}: photo ${index + 1} of ${total}. Use the arrow keys to change photo.`}
                className="relative aspect-[4/3] overflow-hidden rounded-card border border-border bg-surface-2"
            >
                {images[index] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        key={index}
                        src={images[index]}
                        alt={`${title}, photo ${index + 1}`}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div
                        className="flex h-full w-full items-end p-5"
                        style={{
                            backgroundImage:
                                "radial-gradient(rgba(244,245,250,0.08) 1px, transparent 1px)",
                            backgroundSize: "18px 18px",
                        }}
                    >
                        <span className="text-sm text-muted">
                            Photo {index + 1} of {total}
                        </span>
                    </div>
                )}
            </div>

            {total > 1 && (
                <div className="mt-3 flex gap-3">
                    {Array.from({ length: total }, (_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setIndex(i)}
                            aria-pressed={i === index}
                            aria-label={`Show photo ${i + 1}`}
                            className={`relative h-16 w-20 overflow-hidden rounded-input border bg-surface-2 transition ${i === index
                                    ? "border-primary"
                                    : "border-border opacity-70 hover:opacity-100"
                                }`}
                        >
                            {images[i] && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={images[i]}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}