import { apiV2 } from "./client";

const BASE = "/api/admin/social-digest";

// The backend's daily Telegram digest: top best-to-post jobs plus an Instagram
// caption and WhatsApp message, sent at 4 PM IST.

// Dry run — the jobs and messages a send would post right now. Sends nothing.
// Responds { data: { jobs, messages, reason, lookbackHours } }.
export const previewSocialDigest = () => apiV2.get(`${BASE}/preview`);

// Post the digest to Telegram now. Sent jobs are stamped, so the 4 PM run picks
// others. 200 { data: { sent, jobs } } (sent:false when nothing qualifies),
// 409 while another send is in flight, 502 when Telegram refuses it.
export const sendSocialDigest = () => apiV2.post(`${BASE}/send`);
