const points = [
    {
        title: "Students only",
        text: "Sign up with your college email. No outsiders.",
    },
    {
        title: "Meet in public",
        text: "Hand-overs happen at the library, main gate or canteen.",
    },
    {
        title: "No fees",
        text: "Listing and buying cost nothing. Keep all the money.",
    },
    {
        title: "Easy reporting",
        text: "Flag any listing that looks off and we review it.",
    },
];

export default function TrustStrip() {
    return (
        <section className="border-b border-border">
            <div className="mx-auto grid max-w-[1200px] gap-6 px-4 py-8 sm:grid-cols-2 md:px-6 lg:grid-cols-4">
                {points.map((p) => (
                    <div key={p.title}>
                        <h3 className="text-base font-bold">{p.title}</h3>
                        <p className="mt-1 text-sm text-muted">{p.text}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}