export const allCategories = [
    { slug: "books", label: "Books" },
    { slug: "electronics", label: "Electronics" },
    { slug: "cycles", label: "Cycles" },
    { slug: "notes", label: "Notes" },
    { slug: "hostel", label: "Hostel gear" },
    { slug: "clothing", label: "Clothing" },
    { slug: "stationery", label: "Stationery & Lab" },
    { slug: "other", label: "Other" },
];

export function categoryLabel(slug) {
    return allCategories.find((c) => c.slug === slug)?.label ?? slug;
}

export const conditionLabels = {
    new: "New",
    "like-new": "Like new",
    good: "Good",
    fair: "Fair",
};

export const conditionOptions = [
    { value: "", label: "Any condition" },
    ...Object.entries(conditionLabels).map(([value, label]) => ({ value, label })),
];