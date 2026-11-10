"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import ImageUploader from "@/components/ui/ImageUploader";
import Input from "@/components/ui/Input";
import ListingCard from "@/components/ui/ListingCard";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Toggle from "@/components/ui/Toggle";
import { api } from "@/lib/api";
import { allCategories, conditionLabels } from "@/lib/categories";

const categoryOptions = [
    { value: "", label: "Choose a category" },
    ...allCategories.map((c) => ({ value: c.slug, label: c.label })),
];

const conditionOptions = [
    { value: "", label: "Choose a condition" },
    { value: "new", label: "New" },
    { value: "like-new", label: "Like new" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
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

// server field name -> form field name
const serverFieldMap = {
    title: "title",
    description: "description",
    category: "category",
    condition: "condition",
    price: "price",
    pickupSpot: "pickup",
    openToExchange: "exchange",
};

const photoCodes = [
    "IMAGES_REQUIRED",
    "TOO_MANY_FILES",
    "INVALID_FILE_TYPE",
    "FILE_TOO_LARGE",
];

function validate(v) {
    const e = {};
    if (v.photos.length === 0) e.photos = "Add at least one photo.";
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

function scrollToPhotos() {
    document
        .getElementById("field-photos")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export default function SellForm({
    initial,
    initialPhotos = [],
    listingId,
    mode = "create",
}) {
    const router = useRouter();
    const [values, setValues] = useState({
        ...empty,
        ...(initial ?? {}),
        photos: initialPhotos,
    });
    const [errors, setErrors] = useState({});
    const [notice, setNotice] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    function set(key, value) {
        setValues((v) => ({ ...v, [key]: value }));
        setErrors((e) => {
            if (!e[key]) return e;
            const { [key]: _removed, ...rest } = e;
            return rest;
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const form = e.currentTarget;
        setNotice(null);

        const found = validate(values);
        setErrors(found);

        const firstKey = fieldOrder.find((k) => found[k]);
        if (firstKey) {
            if (firstKey === "photos") {
                scrollToPhotos();
            } else {
                form.elements.namedItem(firstKey)?.focus();
            }
            return;
        }

        // photos go as a form upload; do NOT set the content type by hand
        const body = new FormData();
        body.append("title", values.title.trim());
        body.append("description", values.description.trim());
        body.append("category", values.category);
        body.append("condition", values.condition);
        body.append("price", values.free ? "0" : String(values.price));
        body.append("pickupSpot", values.pickup.trim());
        body.append("openToExchange", String(values.exchange));
        for (const photo of values.photos) {
            if (photo.file) body.append("images", photo.file);
        }
        if (mode === "edit") {
            const kept = new Set(
                values.photos.filter((p) => p.existing).map((p) => p.publicId)
            );
            for (const old of initialPhotos) {
                if (!kept.has(old.publicId)) body.append("removeImages", old.publicId);
            }
        }

        setSubmitting(true);
        try {
            await api(mode === "edit" ? `/listings/${listingId}` : "/listings", {
                method: mode === "edit" ? "PATCH" : "POST",
                body,
            });
            values.photos.forEach((p) => p.file && URL.revokeObjectURL(p.url));
            router.push("/my-listings");
        } catch (err) {
            setSubmitting(false);
            if (err.code === "VALIDATION_ERROR" && err.fields) {
                const mapped = {};
                for (const [key, message] of Object.entries(err.fields)) {
                    const name = serverFieldMap[key];
                    if (name) mapped[name] = message;
                }
                setErrors(mapped);
                setNotice({
                    title: "Please fix the highlighted fields.",
                    body: Object.keys(mapped).length ? "" : err.message,
                });
            } else if (photoCodes.includes(err.code)) {
                setErrors({ photos: err.message });
                scrollToPhotos();
            } else if (err.code === "UNAUTHENTICATED") {
                setNotice({
                    title: "Your session expired.",
                    body: "Log in again, then post your item.",
                });
            } else if (err.code === "EMAIL_NOT_VERIFIED") {
                setNotice({
                    title: "Verify your college email first.",
                    body: "Only verified students can post items.",
                });
            } else {
                setNotice({ title: "Could not save your listing.", body: err.message });
            }
        }
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
        condition: conditionLabels[values.condition] ?? "Good",
        category: values.category,
        location: values.pickup.trim() || "Pickup spot",
        postedAgo: "Just now",
        image: values.photos[0]?.url ?? null,
    };

    return (
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {notice && (
                    <Alert tone="error" title={notice.title}>
                        {notice.body}
                    </Alert>
                )}

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
                    <Button
                        type="submit"
                        size="lg"
                        loading={submitting}
                        className="w-full sm:w-auto"
                    >
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