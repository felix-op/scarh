export function convertBody<T>(body: T): string | FormData | undefined {
    if (!body) return undefined;

    if (typeof body === "string" || body instanceof FormData) return body;

    return JSON.stringify(body);
}
