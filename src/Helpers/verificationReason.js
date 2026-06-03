// Humanize apply-link verification reason codes and map a check result to badge
// styling. Reason codes come from the backend verifier as
// `verification.lastCheckReason` on flagged jobs (e.g. "status:404", "timeout",
// "phrase:position closed").

const HTTP_STATUS_TEXT = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    408: "Request Timeout",
    410: "Gone",
    429: "Too Many Requests",
    500: "Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
};

const STATIC_REASONS = {
    timeout: "Timed out",
    "redirect-to-careers-home": "Redirected to careers home",
    "captcha-or-bot-wall": "Bot/CAPTCHA wall",
    "empty-body": "Empty page",
};

const titleCase = (s) =>
    s
        .replace(/[-_:]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());

// "status:404" → "404 Not Found", "timeout" → "Timed out", "phrase:..." →
// "Closed-posting text". Unknown codes fall back to a readable title-case form.
export const humanizeReason = (reason) => {
    if (!reason || typeof reason !== "string") return "Unknown";
    if (STATIC_REASONS[reason]) return STATIC_REASONS[reason];
    if (reason.startsWith("status:")) {
        const code = parseInt(reason.slice(7), 10);
        if (Number.isNaN(code)) return "HTTP error";
        const text = HTTP_STATUS_TEXT[code];
        return text ? `${code} ${text}` : `HTTP ${code}`;
    }
    if (reason.startsWith("phrase:")) return "Closed-posting text";
    return titleCase(reason);
};

// `phrase:<matched text>` carries the matched phrase — surface it as a tooltip.
export const reasonDetail = (reason) => {
    if (typeof reason === "string" && reason.startsWith("phrase:")) {
        return reason.slice(7).trim();
    }
    return "";
};

// expired = dead link (already archived server-side); inconclusive = couldn't be
// confirmed (timeout / 5xx / bot wall / empty page). Badge uses outline + status
// color per THEME_GUIDE.
const RESULT_META = {
    expired: {
        label: "Expired",
        className:
            "border-red-300 text-red-600 dark:border-red-900 dark:text-red-400",
    },
    inconclusive: {
        label: "Inconclusive",
        className:
            "border-amber-300 text-amber-600 dark:border-amber-900 dark:text-amber-500",
    },
};

export const resultMeta = (result) =>
    RESULT_META[result] || {
        label: result ? titleCase(result) : "Flagged",
        className: "border-border text-muted-foreground",
    };
