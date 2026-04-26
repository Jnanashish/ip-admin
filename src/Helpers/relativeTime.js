const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

const pluralize = (n, unit) => `${n} ${unit}${n === 1 ? "" : "s"} ago`;

export const formatRelativeTime = (input) => {
    if (!input) return "";
    const date = input instanceof Date ? input : new Date(input);
    const ms = Date.now() - date.getTime();
    if (Number.isNaN(ms)) return "";
    if (ms < 0) return "just now";
    if (ms < MINUTE) return "just now";
    if (ms < HOUR) return pluralize(Math.floor(ms / MINUTE), "minute");
    if (ms < DAY) return pluralize(Math.floor(ms / HOUR), "hour");
    if (ms < WEEK) return pluralize(Math.floor(ms / DAY), "day");
    if (ms < MONTH) return pluralize(Math.floor(ms / WEEK), "week");
    if (ms < YEAR) return pluralize(Math.floor(ms / MONTH), "month");
    return pluralize(Math.floor(ms / YEAR), "year");
};
