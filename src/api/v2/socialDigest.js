import { apiV2 } from "./client";

const BASE = "/api/admin/social-digest";

// The backend's daily Telegram digest: top best-to-post jobs plus an Instagram
// caption and WhatsApp message, sent at 4 PM IST.

// Post the top `count` jobs (1–6; omitted → 6, the 4 PM run's size) to the
// Telegram channel now. Sent jobs are stamped, so the 4 PM run picks others.
// 200 { data: { sent, jobs, lookbackHours } } (sent:false when nothing
// qualifies), 409 while another send is in flight, 502 when Telegram refuses it.
export const sendSocialDigest = (count) =>
    apiV2.post(`${BASE}/send`, count ? { count } : {});
