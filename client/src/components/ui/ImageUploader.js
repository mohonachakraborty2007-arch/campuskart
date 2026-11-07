"use client";

import { useId, useRef, useState } from "react";
import Badge from "@/components/ui/Badge";

const MAX_ORIGINAL = 25 * 1024 * 1024; // raw phone photos can be big
const MAX_FINAL = 5 * 1024 * 1024; // what the server accepts
const MAX_SIDE = 1600;
const QUALITY = 0.8;

// Shrinks a photo in the browser and returns a JPEG File.
async function compress(file) {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff"; // see-through PNGs get a white background
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", QUALITY)
    );
    if (!blob) throw new Error("Could not compress the photo");

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
}

// value: [{ id, url, file }]  (a new photo has `file`)
//        [{ id, url, publicId, existing: true }]  (a photo already saved)
export default function ImageUploader({
    value = [],
    onChange,
    max = 5,
    error,
}) {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const [busy, setBusy] = useState(false);
    const [localError, setLocalError] = useState("");
    const messageId = useId();
    const full = value.length >= max;
    const message = error || localError;

    async function addFiles(fileList) {
        const incoming = Array.from(fileList);
        const room = max - value.length;
        const accepted = [];
        let problem = "";

        setBusy(true);
        for (const file of incoming) {
            if (!file.type.startsWith("image/")) {
                problem = "Only image files are allowed.";
                continue;
            }
            if (file.size > MAX_ORIGINAL) {
                problem = "Each photo must be under 25 MB.";
                continue;
            }
            if (accepted.length >= room) {
                problem = `You can add up to ${max} photos.`;
                break;
            }
            try {
                const small = await compress(file);
                if (small.size > MAX_FINAL) {
                    problem = "That photo is still too large. Try a smaller one.";
                    continue;
                }
                accepted.push({
                    id: `${file.name}-${small.size}-${Math.random().toString(36).slice(2, 8)}`,
                    file: small,
                    url: URL.createObjectURL(small),
                });
            } catch {
                problem = `We could not read "${file.name}". Try a JPEG or PNG photo.`;
            }
        }
        setBusy(false);

        setLocalError(problem);
        if (accepted.length) onChange([...value, ...accepted]);
    }

    function remove(id) {
        const item = value.find((i) => i.id === id);
        if (item?.file) URL.revokeObjectURL(item.url);
        onChange(value.filter((i) => i.id !== id));
        setLocalError("");
    }

    return (
        <div>
            <p className="mb-1.5 text-sm font-medium">Photos</p>

            <button
                type="button"
                disabled={full || busy}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    if (!full && !busy) addFiles(e.dataTransfer.files);
                }}
                aria-describedby={messageId}
                className={`flex w-full flex-col items-center justify-center rounded-card border border-dashed px-4 py-10 text-center transition disabled:cursor-not-allowed disabled:opacity-60 ${dragging
                    ? "border-primary bg-surface-2"
                    : error
                        ? "border-danger bg-surface"
                        : "border-border bg-surface hover:border-primary"
                    }`}
            >
                <svg
                    viewBox="0 0 24 24"
                    className="h-8 w-8 fill-none stroke-muted"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M12 16V5M7 9l5-5 5 5M4 19h16" />
                </svg>
                <span className="mt-3 font-medium">
                    {busy
                        ? "Preparing photos..."
                        : full
                            ? "Maximum photos added"
                            : "Add photos"}
                </span>
                <span className="mt-1 text-sm text-muted">
                    Drag and drop, or tap to choose. On a phone you can take a photo.
                </span>
            </button>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = "";
                }}
            />

            <p
                id={messageId}
                role={message ? "alert" : undefined}
                aria-live="polite"
                className={`mt-1.5 text-sm ${message ? "text-danger" : "text-muted"}`}
            >
                {message ||
                    `Up to ${max} photos. They are resized for you. The first one is the cover.`}
            </p>

            {value.length > 0 && (
                <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
                    {value.map((item, i) => (
                        <li
                            key={item.id}
                            className="relative aspect-square overflow-hidden rounded-input border border-border bg-surface-2"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={item.url}
                                alt={`Selected photo ${i + 1}`}
                                className="h-full w-full object-cover"
                            />
                            {i === 0 && (
                                <Badge className="absolute bottom-1.5 left-1.5 bg-background/80">
                                    Cover
                                </Badge>
                            )}
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => remove(item.id)}
                                aria-label={`Remove photo ${i + 1}`}
                                className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-full bg-background/85 transition hover:bg-background"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    className="h-4 w-4 fill-none stroke-current"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    aria-hidden="true"
                                >
                                    <path d="M6 6l12 12M18 6L6 18" />
                                </svg>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}