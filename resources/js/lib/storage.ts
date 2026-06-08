export function storageUrl(path: string): string;
export function storageUrl(path?: string | null): string | null;
export function storageUrl(path?: string | null): string | null {
    if (!path) {
        return null;
    }

    if (path.startsWith('http')) {
        return path;
    }

    if (path.startsWith('/storage/')) {
        return path;
    }

    return `/storage/${path}`;
}
