/**
 * Parses an error response body to extract a human-readable message.
 * Falls back to the provided message if the body is missing or not JSON.
 */
export const parseErrorResponse = async (res, fallbackMsg) => {
    try {
        const data = await res.json();
        return data?.error || data?.message || fallbackMsg;
    } catch {
        return fallbackMsg;
    }
};
