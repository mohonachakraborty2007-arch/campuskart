export class ApiError extends Error {
    constructor(status, code, message, fields) {
        super(message);
        this.status = status;
        this.code = code;
        this.fields = fields;
    }
}

// All calls go to /api/... on the same site; Next forwards them to the server.
// Pass a FormData as `body` to upload files (the browser sets the content type itself).
export async function api(path, { method = "GET", body } = {}) {
    const isForm = typeof FormData !== "undefined" && body instanceof FormData;

    let res;
    try {
        res = await fetch(`/api${path}`, {
            method,
            credentials: "include",
            headers: body && !isForm ? { "Content-Type": "application/json" } : undefined,
            body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
        });
    } catch {
        throw new ApiError(
            0,
            "NETWORK_ERROR",
            "Cannot reach the server. Check your connection and try again."
        );
    }

    let json = null;
    try {
        json = await res.json();
    } catch {
        // empty or non-JSON response
    }

    if (!res.ok) {
        const e = json?.error;
        throw new ApiError(
            res.status,
            e?.code || "UNKNOWN_ERROR",
            e?.message || "Something went wrong. Please try again.",
            e?.fields
        );
    }
    return json?.data;
}