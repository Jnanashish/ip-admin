export const SCRAPER_SOURCES = [
    { value: "freshershunt", label: "FreshersHunt" },
    { value: "offcampusjobs4u", label: "OffCampusJobs4U" },
    { value: "onlyfrontendjobs", label: "OnlyFrontendJobs" },
    { value: "peerlist", label: "Peerlist" },
];

export const getSourceLabel = (value) => {
    if (!value) return "—";
    const match = SCRAPER_SOURCES.find((s) => s.value === value);
    return match ? match.label : value;
};
