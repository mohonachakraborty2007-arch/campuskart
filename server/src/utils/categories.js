export const CATEGORIES = [
    { value: 'books', label: 'Books' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'cycles', label: 'Cycles' },
    { value: 'notes', label: 'Notes' },
    { value: 'hostel', label: 'Hostel & Room' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'stationery', label: 'Stationery & Lab' },
    { value: 'other', label: 'Other' },
];

export const CATEGORY_VALUES = CATEGORIES.map((c) => c.value);

export const CONDITIONS = ['new', 'like-new', 'good', 'fair'];

export const LISTING_STATUSES = ['active', 'sold', 'removed'];

export const MAX_IMAGES = 5;