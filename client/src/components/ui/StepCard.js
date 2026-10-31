export default function StepCard({ number, title, children }) {
    return (
        <div className="rounded-card border border-border bg-surface p-6">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary font-heading text-lg font-bold text-background">
                {number}
            </span>
            <h3 className="mt-5 text-xl font-bold">{title}</h3>
            <p className="mt-2 text-muted">{children}</p>
        </div>
    );
}