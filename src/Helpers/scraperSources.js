// Mirrors the adapters in the backend's src/modules/scraper/adapters/, listed
// in the order their crons fire (12:00 IST through 06:00 IST). This list has
// to be updated by hand whenever a source is added — it drifts silently when
// nobody does. "freshersjobs" shipped in the backend on 2026-06-02 and was
// still absent from this list in September.
//
// Only the Staging source filter reads the array; every other screen renders
// adapters straight from GET /admin/scrape/health, which enumerates the
// adapter directory on disk. So a missing entry here hides a source from one
// dropdown, it does not hide it from the panel.
export const SCRAPER_SOURCES = [
    { value: "freshershunt", label: "FreshersHunt" },
    { value: "freshersjobs", label: "FreshersJobs" },
    { value: "offcampusjobs4u", label: "OffCampusJobs4U" },
    { value: "onlyfrontendjobs", label: "OnlyFrontendJobs" },
    { value: "peerlist", label: "Peerlist" },
    { value: "engineerhub", label: "EngineerHub" },
    { value: "talentd", label: "Talentd" },
    { value: "frontendgeek", label: "FrontendGeek" },
];

export const getSourceLabel = (value) => {
    if (!value) return "—";
    const match = SCRAPER_SOURCES.find((s) => s.value === value);
    return match ? match.label : value;
};
