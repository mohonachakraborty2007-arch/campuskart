// turns a zod error into { fieldName: "message" }
export function fieldErrors(error) {
    const fields = {};
    for (const issue of error.issues) {
        const key = issue.path[0] ?? 'form';
        if (!fields[key]) fields[key] = issue.message;
    }
    return fields;
}