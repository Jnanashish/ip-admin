/**
 * Sanitizes URLs to prevent script-execution and file-scheme attacks.
 * Returns the safe URL, or "#" if the URL is malicious or malformed.
 */
// eslint-disable-next-line no-script-url
const UNSAFE_PROTOCOLS = ["javascript:", "data:", "vbscript:", "file:"];

export const safeUrl = (url) => {
    if (!url || typeof url !== "string") return "#";
    const trimmed = url.trim();
    if (!trimmed) return "#";

    const lower = trimmed.toLowerCase();
    if (UNSAFE_PROTOCOLS.some((proto) => lower.startsWith(proto))) {
        return "#";
    }
    return trimmed;
};
