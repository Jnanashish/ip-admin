// =========================================================
// @careersattech — Caption Template Bank (Nov 2026)
// 7 rotating templates · placeholders below
// =========================================================
//
// PLACEHOLDERS:
//   {COUNT}        — number of jobs (e.g. "4")
//   {ROLE}         — role category, lowercase (e.g. "frontend")
//   {ROLE_CAP}     — capitalized (e.g. "Frontend")
//   {TECH}         — primary tech / language (e.g. "React.js")
//   {COMPANIES}    — comma-separated list
//   {JOBS_LIST}    — formatted list, one job per line
//   {BATCHES}      — eligible batches (e.g. "2024, 2025, 2026")
//   {DEGREES}      — eligible degrees (e.g. "B.E, B.Tech, MCA")
//   {HASHTAGS}     — pulled from hashtagBank
// =========================================================

export const captionTemplates = {
    alert: `🚨 {COUNT} {ROLE_CAP} Engineer jobs open — {COMPANIES} hiring freshers 💻

💬 Comment "LINK" and we'll DM you the apply links 👇

━━━━━━━━━━━━━━━
{JOBS_LIST}

🎓 Open to: {BATCHES} batch — {DEGREES}
━━━━━━━━━━━━━━━

Which one are you applying to first? Drop the company name 👇

📌 Save for later · 🏷️ Tag a friend who needs this
🌐 Full role details on careersat.tech (link in bio)

Follow @careersattech — your daily tech job feed ⚡

{HASHTAGS}`,

    codeFocused: `🔥 If you code in {TECH}, save this — {COMPANIES} are all hiring {ROLE} engineers right now.

💬 Comment "LINK" → all {COUNT} apply links in your DM 👇

━━━━━━━━━━━━━━━
{JOBS_LIST}

🎓 {BATCHES} batch | {DEGREES}
━━━━━━━━━━━━━━━

Which stack are you strongest in? Drop it in the comments 👇

📌 Save · 🏷️ Tag a {TECH} dev
🌐 careersat.tech (link in bio)

Follow @careersattech for daily verified tech jobs ⚡

{HASHTAGS}`,

    curation: `💼 This week's top {COUNT} tech jobs for freshers — {COMPANIES} are hiring across {ROLE_CAP} roles.

💬 Comment "LINK" to get all apply links in your DM 👇

━━━━━━━━━━━━━━━
{JOBS_LIST}

🎓 Eligibility: {BATCHES} batch — {DEGREES}
━━━━━━━━━━━━━━━

Which company has been on your dream list? 👇

📌 Save · 🏷️ Tag your placement-prep group
🌐 More roles on careersat.tech (link in bio)

Follow @careersattech for fresh job drops every day ⚡

{HASHTAGS}`,

    questionHook: `Looking for {ROLE_CAP} jobs as a fresher? 👀

{COMPANIES} are hiring right now — {COUNT} verified openings for {BATCHES} batch.

💬 Comment "LINK" for apply links in your DM 👇

━━━━━━━━━━━━━━━
{JOBS_LIST}

🎓 {DEGREES} eligible
━━━━━━━━━━━━━━━

Drop the company you're applying to first 👇

📌 Save · 🏷️ Tag a friend on the job hunt
🌐 careersat.tech (link in bio)

Follow @careersattech — verified tech job updates daily ⚡

{HASHTAGS}`,

    tier1: `🏆 Tier-1 tech companies hiring freshers — {COMPANIES} have {COUNT} {ROLE_CAP} openings live.

These don't stay open long. 💬 Comment "LINK" for the apply links 👇

━━━━━━━━━━━━━━━
{JOBS_LIST}

🎓 {BATCHES} batch | {DEGREES}
━━━━━━━━━━━━━━━

Which one is your #1? Drop the name 👇

📌 Save before it fills up · 🏷️ Tag a friend
🌐 careersat.tech (link in bio)

Follow @careersattech for verified tier-1 job alerts ⚡

{HASHTAGS}`,

    internship: `🎯 {COUNT} paid {ROLE_CAP} internships open — {COMPANIES} are hiring interns from {BATCHES} batch.

💬 Comment "INTERN" and we'll DM you the apply links 👇

━━━━━━━━━━━━━━━
{JOBS_LIST}

🎓 {DEGREES} eligible · Stipend roles
━━━━━━━━━━━━━━━

Which one matches your skills? Drop the company 👇

📌 Save · 🏷️ Tag a junior who needs this
🌐 careersat.tech (link in bio)

Follow @careersattech for daily internship + job updates ⚡

{HASHTAGS}`,

    spotlight: `📢 {COMPANIES} just opened {COUNT} fresher roles — multiple teams hiring across {ROLE_CAP}.

💬 Comment "LINK" to get all apply links in your DM 👇

━━━━━━━━━━━━━━━
{JOBS_LIST}

🎓 {BATCHES} batch | {DEGREES}
━━━━━━━━━━━━━━━

Which team would you join? Drop the role number 👇

📌 Save this · 🏷️ Tag someone who'd be perfect for this
🌐 careersat.tech (link in bio)

Follow @careersattech for company-specific drops ⚡

{HASHTAGS}`,
};

export const TEMPLATE_OPTIONS = [
    { key: "alert", label: "Alert / urgency" },
    { key: "codeFocused", label: "Code-focused" },
    { key: "curation", label: "Weekly curation" },
    { key: "questionHook", label: "Question hook" },
    { key: "tier1", label: "Tier-1 / aspiration" },
    { key: "internship", label: "Internship" },
    { key: "spotlight", label: "Single-company spotlight" },
];

export const CODEWORDS = ["LINK", "APPLY", "JOBS", "INTERN"];

export const CLOSING_QUESTIONS = [
    "Which one are you applying to first?",
    "Drop your dream company in the comments",
    "Which role matches your stack?",
    "Tag your placement-prep group",
    "Save this and apply this weekend",
];

// =========================================================
// HASHTAG MAPPING — pull tag set per template + role
// =========================================================
export const hashtagsByTemplate = {
    default: ({ techTags = [], companyTag, locationTag }) =>
        [
            ...techTags,
            companyTag,
            locationTag,
            "#offcampusdrive",
            "#placementdrive",
            "#freshershiring",
            "#2026batch",
            "#engineeringstudents",
            "#placementseason",
        ]
            .filter(Boolean)
            .slice(0, 10),

    internship: ({ techTags = [] }) =>
        [
            ...techTags.slice(0, 3),
            "#internshipsindia",
            "#freshersinternship",
            "#techinternship",
            "#internshipopportunity",
            "#engineeringstudents",
            "#2026batch",
            "#campusplacement",
        ].slice(0, 10),

    curation: () => [
        "#offcampusdrive",
        "#placementdrive",
        "#freshershiring",
        "#freshersjobs",
        "#fresherjobsindia",
        "#engineeringstudents",
        "#2026batch",
        "#campusplacement",
        "#placementseason",
        "#techjobsindia",
    ],
};
