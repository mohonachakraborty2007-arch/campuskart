export const categories = [
    { slug: "books", label: "Books" },
    { slug: "electronics", label: "Electronics" },
    { slug: "cycles", label: "Cycles" },
    { slug: "notes", label: "Notes" },
    { slug: "hostel", label: "Hostel gear" },
    { slug: "clothing", label: "Clothing" },
];

export const sampleListings = [
    {
        id: "l1",
        title: "Engineering Mathematics II, Grewal",
        price: 280,
        condition: "Good",
        category: "books",
        location: "Main campus",
        postedAgo: "2h ago",
        image: null,
    },
    {
        id: "l2",
        title: "Hero Sprint 21-speed cycle",
        price: 3200,
        condition: "Good",
        category: "cycles",
        location: "Boys hostel",
        postedAgo: "5h ago",
        image: null,
    },
    {
        id: "l3",
        title: "Casio fx-991EX scientific calculator",
        price: 650,
        condition: "Like new",
        category: "electronics",
        location: "Block A",
        postedAgo: "1d ago",
        image: null,
    },
    {
        id: "l4",
        title: "Sem 1 handwritten notes, all subjects",
        price: 120,
        condition: "Good",
        category: "notes",
        location: "Library",
        postedAgo: "1d ago",
        image: null,
    },
    {
        id: "l5",
        title: "Philips table lamp with USB charging",
        price: 350,
        condition: "Like new",
        category: "hostel",
        location: "Girls hostel",
        postedAgo: "2d ago",
        image: null,
    },
    {
        id: "l6",
        title: "boAt Rockerz 255 neckband",
        price: 700,
        condition: "Fair",
        category: "electronics",
        location: "Block C",
        postedAgo: "2d ago",
        image: null,
    },
    {
        id: "l7",
        title: "Lab coat, size M",
        price: 150,
        condition: "Good",
        category: "clothing",
        location: "Main gate",
        postedAgo: "3d ago",
        image: null,
    },
    {
        id: "l8",
        title: "Digital Electronics, Morris Mano",
        price: 220,
        condition: "Fair",
        category: "books",
        location: "Block B",
        postedAgo: "4d ago",
        image: null,
    },
];
export const sellers = {
    s1: {
        id: "s1",
        name: "Aarav S.",
        department: "CSE, 2nd year",
        verified: true,
        memberSince: "Aug 2026",
    },
    s2: {
        id: "s2",
        name: "Riya D.",
        department: "ECE, 3rd year",
        verified: true,
        memberSince: "Jul 2026",
    },
    s3: {
        id: "s3",
        name: "Kabir M.",
        department: "Mechanical, 1st year",
        verified: true,
        memberSince: "Sep 2026",
    },
    s4: {
        id: "s4",
        name: "Ananya P.",
        department: "Biotech, 2nd year",
        verified: false,
        memberSince: "Oct 2026",
    },
};

const details = {
    l1: {
        sellerId: "s1",
        description:
            "Used for one semester. A few highlighted pages in the first three chapters, no torn pages. Solutions guide not included.",
        pickup: "Library entrance, between 4 and 6 pm",
        exchange: "Open to exchange for Physics or Chemistry books",
        photos: 3,
    },
    l2: {
        sellerId: "s3",
        description:
            "21-speed gears, new tyres fitted last month. Small scratch on the frame. Comes with a lock and a bell.",
        pickup: "Boys hostel parking",
        exchange: "Cash only",
        photos: 4,
    },
    l3: {
        sellerId: "s2",
        description:
            "Bought in January and barely used. Original cover included. Allowed in all internal exams.",
        pickup: "Block A canteen",
        exchange: "Cash only",
        photos: 2,
    },
    l4: {
        sellerId: "s4",
        description:
            "Neat handwritten notes for all first semester subjects, scanned copies also available on request.",
        pickup: "Library reading room",
        exchange: "Open to exchange for Sem 2 notes",
        photos: 3,
    },
    l5: {
        sellerId: "s4",
        description:
            "Works perfectly, three brightness levels and a USB port for charging a phone.",
        pickup: "Girls hostel gate",
        exchange: "Cash only",
        photos: 2,
    },
    l6: {
        sellerId: "s2",
        description:
            "Battery lasts about 6 hours. Ear tips are slightly worn, so I'm including a new set.",
        pickup: "Block C entrance",
        exchange: "Open to exchange for a power bank",
        photos: 3,
    },
    l7: {
        sellerId: "s3",
        description:
            "Size M, washed and ironed. Name tag removed. Used for one year in the chemistry lab.",
        pickup: "Main gate",
        exchange: "Cash only",
        photos: 2,
    },
    l8: {
        sellerId: "s1",
        description:
            "Some pencil marks inside, cover is slightly bent. All pages present.",
        pickup: "Block B corridor",
        exchange: "Open to exchange",
        photos: 2,
    },
};

export function getListing(id) {
    const base = sampleListings.find((l) => l.id === id);
    if (!base) return null;
    const extra = details[id];
    return { ...base, ...extra, seller: sellers[extra.sellerId] };
}
export const soldListings = [
    {
        id: "x1",
        sellerId: "s1",
        title: "Physics for Engineers, HC Verma",
        price: 300,
        condition: "Good",
        category: "books",
        location: "Main campus",
        postedAgo: "Sold 2 weeks ago",
        image: null,
        sold: true,
    },
    {
        id: "x2",
        sellerId: "s1",
        title: "Casio fx-82MS calculator",
        price: 400,
        condition: "Good",
        category: "electronics",
        location: "Block A",
        postedAgo: "Sold 3 weeks ago",
        image: null,
        sold: true,
    },
    {
        id: "x3",
        sellerId: "s2",
        title: "Wired earphones with mic",
        price: 150,
        condition: "Fair",
        category: "electronics",
        location: "Block C",
        postedAgo: "Sold 1 month ago",
        image: null,
        sold: true,
    },
    {
        id: "x4",
        sellerId: "s3",
        title: "Drafter and geometry box",
        price: 250,
        condition: "Like new",
        category: "hostel",
        location: "Boys hostel",
        postedAgo: "Sold 1 month ago",
        image: null,
        sold: true,
    },
    {
        id: "x5",
        sellerId: "s4",
        title: "Organic Chemistry notes, Sem 1",
        price: 100,
        condition: "Good",
        category: "notes",
        location: "Library",
        postedAgo: "Sold 2 months ago",
        image: null,
        sold: true,
    },
];

export function getSeller(id) {
    return sellers[id] ?? null;
}

export function getSellerListings(id) {
    const active = sampleListings.filter((l) => details[l.id]?.sellerId === id);
    const sold = soldListings.filter((l) => l.sellerId === id);
    return { active, sold };
}
export function getAnyListing(id) {
    return (
        sampleListings.find((l) => l.id === id) ??
        soldListings.find((l) => l.id === id) ??
        null
    );
}