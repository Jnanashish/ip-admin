import { listJobsV2 } from "api/v2/jobs";

// Jobs already handed out by the digest, so every click yields a fresh set.
// Kept client-side on purpose: the backend has no "shown to admin" concept yet,
// and adding one is only worth it once this runs unattended on a cron.
const SEEN_KEY = "digest:seenJobIds";

// Enough history to stay useful without letting localStorage grow forever.
const SEEN_CAP = 300;

// Jobs arrive newest-first, and new ones keep landing at the top — so a plain
// page cursor would re-serve rows that shifted down between clicks. Instead we
// over-fetch and filter against the seen set, walking pages until the batch
// fills. The cap stops a fully-exhausted list from paging to infinity.
const FETCH_LIMIT = 30;
const MAX_PAGES = 4;

const readSeen = () => {
    try {
        const raw = localStorage.getItem(SEEN_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

const writeSeen = (ids) => {
    try {
        localStorage.setItem(SEEN_KEY, JSON.stringify(ids.slice(-SEEN_CAP)));
    } catch {
        // Private mode / quota — the digest still works, it just repeats jobs.
    }
};

export const jobId = (job) => String(job?._id || job?.id || "");

export const getSeenIds = () => readSeen();

export const markSeen = (jobs = []) => {
    const ids = jobs.map(jobId).filter(Boolean);
    if (!ids.length) return;
    const merged = readSeen().filter((id) => !ids.includes(id)).concat(ids);
    writeSeen(merged);
};

export const resetSeen = () => {
    try {
        localStorage.removeItem(SEEN_KEY);
    } catch {
        // Nothing to do — a failed clear just means the old set stays.
    }
};

/**
 * Fetch the next `count` published jobs not yet shown.
 *
 * Returns { jobs, exhausted } — `exhausted` true means the walk ran out of
 * pages before filling the batch, i.e. you have seen everything published.
 */
export const fetchNextDigestJobs = async (count = 5) => {
    const seen = new Set(readSeen());
    const picked = [];
    let page = 1;
    let exhausted = false;

    while (picked.length < count && page <= MAX_PAGES) {
        const res = await listJobsV2({
            status: "published",
            limit: FETCH_LIMIT,
            page,
            // The banner needs company.logo, which the list omits by default.
            populate: "company",
        });

        if (res.error) throw new Error(res.error?.error || res.error?.message || "Failed to load jobs");

        const batch = res.data?.jobs || [];
        if (!batch.length) {
            exhausted = true;
            break;
        }

        for (const job of batch) {
            const id = jobId(job);
            if (!id || seen.has(id)) continue;
            picked.push(job);
            seen.add(id);
            if (picked.length === count) break;
        }

        const totalPages = res.data?.totalPages ?? 1;
        if (page >= totalPages) {
            exhausted = true;
            break;
        }
        page += 1;
    }

    return { jobs: picked, exhausted };
};
