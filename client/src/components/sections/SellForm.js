"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import ImageUploader from "@/components/ui/ImageUploader";
import Input from "@/components/ui/Input";
import ListingCard from "@/components/ui/ListingCard";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Toggle from "@/components/ui/Toggle";
import { categories } from "@/lib/sampleListings";

const categoryOptions = [
    { value: "", label: "Choose a category" },
    ...categories.map((c) => ({ value: c.slug, label: c.label })),
];

const conditionOptions = [
    { value: "", label: "Choose a condition" },
    { value: "Like new", label: "Like new" },
    { value: "Good", label: "Good" },
    { value: "Fair", label: "Fair" },
];

const empty = {
    photos: [],
    title: "",
    category: "",
    condition: "",
    price: "",
    free: false,
    description: "",
    pickup: "",
    exchange: false,
};

const fieldOrder = [
    "photos",
    "title",
    "category",
    "condition",
    "price",
    "description",
    "pickup",
];

function validate(v, existing = 0) {
    const e = {};
    if (v.photos.length + existing === 0) e.photos = "Add at least one photo.";
    if (v.title.trim().length < 5)
        e.title = "Give your listing a title of at least 5 characters.";
    if (!v.category) e.category = "Choose a category.";
    if (!v.condition) e.condition = "Choose a condition.";
    if (!v.free) {
        const n = Number(v.price);
        if (v.price === "" || !(n > 0))
            e.price = "Enter a price above 0, or switch on Free.";
        else if (n > 100000) e.price = "That price looks too high.";
    }
    if (v.description.trim().length < 20)
        e.description = "Describe the item in at least 20 characters.";
    if (!v.pickup.trim()) e.pickup = "Add a pickup spot on campus.";
    return e;
}

export default function SellForm({ initial, existingPhotos = 0, mode = "create" }) {
    const [values, setValues] = useState(
        initial ? { ...empty, ...initial } : empty
    );
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);

    function set(key, value) {
        setValues((v) => ({ ...v, [key]: value }));
        setErrors((e) => {
            if (!e[key]) return e;
            const { [key]: _removed, ...rest } = e;
            return rest;
        });
    }

    function handleSubmit(e) {
        e.preventDefault();
        const form = e.currentTarget;
        const found = validate(values, existingPhotos);
        setErrors(found);

        const firstKey = fieldOrder.find((k) => found[k]);
        if (firstKey) {
            if (firstKey === "photos") {
                document
                    .getElementById("field-photos")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
            } else {
                form.elements.namedItem(firstKey)?.focus();
            }
            return;
        }
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function reset() {
        values.photos.forEach((p) => URL.revokeObjectURL(p.url));
        setValues(empty);
        setErrors({});
        setSubmitted(false);
    }

    if (submitted) {
        return (
            <div className="rounded-card border border-border bg-surface px-6 py-14 text-center">
                <h2 className="text-2xl font-bold">
                    {mode === "edit" ? "Changes saved" : "Listing ready"}
                </h2>
                <p className="mx-auto mt-3 max-w-md text-muted">
                    Your form passed every check. This is a demo, so nothing is saved
                    until the backend is connected.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Button href="/listings">Browse listings</Button>
                    <Button variant="secondary" onClick={reset}>
                        Post another
                    </Button>
                </div>
            </div>
        );
    }

    const priceLabel = values.free
        ? "Free"
        : values.price
            ? `₹${Number(values.price).toLocaleString("en-IN")}`
            : "₹ —";

    const preview = {
        id: "preview",
        title: values.title.trim() || "Your title appears here",
        price: Number(values.price) || 0,
        priceLabel,
        condition: values.condition || "Good",
        category: values.category,
        location: values.pickup.trim() || "Pickup spot",
        postedAgo: "Just now",
        image: values.photos[0]?.url ?? null,
    };

    return (
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div id="field-photos">
                    <ImageUploader
                        value={values.photos}
                        onChange={(photos) => set("photos", photos)}
                        error={errors.photos}
                    />
                </div>

                <Input
                    label="Title"
                    name="title"
                    placeholder="e.g. Engineering Mathematics II, Grewal"
                    maxLength={80}
                    value={values.title}
                    onChange={(e) => set("title", e.target.value)}
                    error={errors.title}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    <Select
                        label="Category"
                        name="category"
                        options={categoryOptions}
                        value={values.category}
                        onChange={(e) => set("category", e.target.value)}
                        error={errors.category}
                    />
                    <Select
                        label="Condition"
                        name="condition"
                        options={conditionOptions}
                        value={values.condition}
                        onChange={(e) => set("condition", e.target.value)}
                        error={errors.condition}
                    />
                </div>

                <div className="space-y-4">
                    <Input
                        label="Price (₹)"
                        name="price"
                        type="number"
                        min="0"
                        inputMode="numeric"
                        placeholder="0"
                        disabled={values.free}
                        value={values.free ? "" : values.price}
                        onChange={(e) => set("price", e.target.value)}
                        error={errors.price}
                    />
                    <Toggle
                        label="Give it away for free"
                        hint="Hides the price and shows a Free badge."
                        checked={values.free}
                        onChange={(on) => set("free", on)}
                    />
                </div>

                <Textarea
                    label="Description"
                    name="description"
                    placeholder="Condition, edition, what is included, why you are selling"
                    maxLength={500}
                    value={values.description}
                    onChange={(e) => set("description", e.target.value)}
                    error={errors.description}
                    hint={`${values.description.length}/500 characters`}
                />

                <Input
                    label="Pickup spot"
                    name="pickup"
                    placeholder="e.g. Library entrance"
                    value={values.pickup}
                    onChange={(e) => set("pickup", e.target.value)}
                    error={errors.pickup}
                    hint="Choose a public place on campus."
                />

                <Toggle
                    label="Open to exchange"
                    hint="Buyers can offer a swap instead of cash."
                    checked={values.exchange}
                    onChange={(on) => set("exchange", on)}
                />

                <div className="sticky bottom-[4.5rem] z-30 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
                    <Button type="submit" size="lg" className="w-full sm:w-auto">
                        {mode === "edit" ? "Save changes" : "Publish listing"}
                    </Button>
                </div>
            </form>

            <aside className="lg:sticky lg:top-24 lg:self-start">
                <p className="mb-3 text-sm font-medium text-muted">Live preview</p>
                <div inert className="pointer-events-none">
                    <ListingCard listing={preview} />
                </div>
            </aside>
        </div>
    );
}