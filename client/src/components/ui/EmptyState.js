export default function EmptyState({ title, children, action }) {
    return (
        <div className="rounded-card border border-dashed border-border px-6 py-16 text-center">
            <h3 className="text-xl font-bold">{title}</h3>
            {children && (
                <p className="mx-auto mt-2 max-w-md text-muted">{children}</p>
            )}
            {action && <div className="mt-6 flex justify-center">{action}</div>}
        </div>
    );
}