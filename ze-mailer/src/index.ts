/**
 * Mirror of src/lib/event.ts on the site. Change both together — these are the
 * only place event facts should be written.
 */
const EVENT = {
  name: "LIVING MANNEQUIN",
  dateEmail: "29 August 2026",
  doors: "16:00",
  location: "Abuja, Nigeria",
  venue: "Venue details to follow",
  siteUrl: "https://houseofze.com",
} as const;

type SignupRecord = {
  name?: string;
  email: string;
  phone?: string;
  tier?: string;
  city?: string;
  note?: string;
  code?: string;
  intent?: string;
  timestamp?: string;
  type?: string;
};

const passUrl = (code: string) => `${EVENT.siteUrl}/pass/${encodeURIComponent(code)}`;

export default {

  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin") ?? "";
    const url = new URL(request.url);

    if (url.pathname === "/admin") return handleAdmin(request, env, origin);
    if (url.pathname === "/admin/announcement") return handleAnnouncement(request, env, origin);
    if (url.pathname === "/sponsor") return handleSponsor(request, env, origin);
    if (url.pathname === "/pass") return handlePass(request, env, origin);

    if (request.method === "OPTIONS") return corsResponse(null, 204, origin);
    if (request.method !== "POST") return corsResponse(JSON.stringify({ error: "Method not allowed" }), 405, origin);

    try {
      const { name, email, phone, tier, code, qr, city, note, intent } = await request.json() as {
        name: string;
        email: string;
        phone?: string;
        tier?: string;
        code: string;
        qr?: string;
        city?: string;
        note?: string;
        intent?: string;
      };

      if (!name || !email || !code) {
        return corsResponse(JSON.stringify({ error: "Missing required fields" }), 400, origin);
      }

      const isWaitlist = intent === "waitlist";
      const firstName = name.split(" ")[0];

      const TIER_LABELS: Record<string, string> = {
        general: "General", vip: "VIP", exhibitor: "Creatives", sponsor: "Sponsor",
      };
      const tierLabel = TIER_LABELS[tier ?? ""] ?? tier ?? "";

      // Save to KV
      await env.SIGNUPS.put(code, JSON.stringify({
        name, email,
        phone: phone ?? "",
        tier: tier ?? "",
        city: city ?? "",
        note: note ?? "",
        code,
        intent: intent ?? "ticket",
        timestamp: new Date().toISOString(),
      }));

      if (isWaitlist) {
        // Waitlist confirmation
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Zë Events <tickets@houseofze.com>",
            to: email,
            subject: `You're on the Zë Waitlist · ${code}`,
            html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#0e0e0e;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0e0e0e;padding:48px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr><td style="border-top:1px solid #c9a96e;padding-top:24px;padding-bottom:24px;">
          <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#c9a96e;">Zë · Living Mannequin</p>
        </td></tr>
        <tr><td style="padding-bottom:32px;">
          <h1 style="margin:0 0 16px;font-size:44px;line-height:1;color:#f0ede6;font-weight:400;">Thank you,<br/><em style="color:#c9a96e;">${firstName}.</em></h1>
          <p style="margin:0;font-size:15px;line-height:1.7;color:#9e9e8c;font-family:Arial,sans-serif;">You're on the Zë waitlist for the Living Mannequin exhibition. We'll be in touch as the event approaches with priority access and updates.</p>
        </td></tr>
        <tr><td style="background:#1a1a1a;border:1px solid rgba(201,169,110,0.2);padding:28px;">
          <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a96e;">About the Event</p>
          <h2 style="margin:0 0 12px;font-size:22px;font-weight:400;color:#f0ede6;">Living Mannequin Exhibition</h2>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#9e9e8c;font-family:Arial,sans-serif;">A gallery-style evening in Abuja where twenty models wear the Zë collection as living art — still, slow, and intentional — surrounded by visual art installations, live performances, spoken word, live violin, and a closing runway showcase.</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:10px 0;border-top:1px solid rgba(240,237,230,0.08);">
              <table width="100%"><tr>
                <td style="font-family:Arial,sans-serif;font-size:11px;color:#9e9e8c;">📅 &nbsp;Date</td>
                <td style="font-family:Arial,sans-serif;font-size:13px;color:#f0ede6;text-align:right;">${EVENT.dateEmail} · Doors ${EVENT.doors}</td>
              </tr></table>
            </td></tr>
            <tr><td style="padding:10px 0;border-top:1px solid rgba(240,237,230,0.08);">
              <table width="100%"><tr>
                <td style="font-family:Arial,sans-serif;font-size:11px;color:#9e9e8c;">📍 &nbsp;Location</td>
                <td style="font-family:Arial,sans-serif;font-size:13px;color:#f0ede6;text-align:right;">${EVENT.location}</td>
              </tr></table>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="border:1px solid rgba(240,237,230,0.12);background:rgba(240,237,230,0.03);padding:28px;border-top:none;">
          <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#9e9e8c;">What to expect as a waitlist member</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${["Priority access before general registration opens","First to receive collection and event details","Exclusive discount on future Zë label pieces","Guaranteed souvenir bag at the event"].map(item => `
            <tr><td style="padding:6px 0;font-family:Arial,sans-serif;font-size:13px;color:#9e9e8c;line-height:1.5;"><span style="color:#c9a96e;margin-right:8px;">✦</span>${item}</td></tr>`).join("")}
          </table>
        </td></tr>
        <tr><td style="border:1px solid rgba(240,237,230,0.08);border-top:none;padding:20px 28px;">
          <table width="100%"><tr>
            <td style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#9e9e8c;">Reference</td>
            <td style="font-family:'Courier New',monospace;font-size:13px;color:#c9a96e;text-align:right;">${code}</td>
          </tr></table>
        </td></tr>
        <tr><td style="border-top:1px solid rgba(240,237,230,0.1);padding-top:28px;padding-bottom:48px;margin-top:4px;">
          <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;color:#9e9e8c;">Follow us: <a href="https://www.instagram.com/ze.thebrand" style="color:#c9a96e;text-decoration:none;">@ze.thebrand</a></p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;color:#9e9e8c50;letter-spacing:0.1em;">© Zë Creative · Unsubscribe by replying STOP</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
          }),
        });

        // Notify brand
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Zë Events <tickets@houseofze.com>",
            to: "ze.thebrand@gmail.com",
            subject: `New Waitlist Signup — ${name}`,
            html: `<div style="background:#0e0e0e;padding:40px;font-family:Arial,sans-serif;color:#f0ede6;">
              <p style="color:#c9a96e;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Zë · New Waitlist Signup</p>
              <h2 style="font-size:32px;font-weight:400;margin:16px 0;">${name}</h2>
              <table style="width:100%;border-collapse:collapse;margin-top:24px;">
                <tr><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);color:#9e9e8c;font-size:11px;text-transform:uppercase;">Email</td><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);text-align:right;">${email}</td></tr>
                <tr><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);color:#9e9e8c;font-size:11px;text-transform:uppercase;">Phone</td><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);text-align:right;">${phone || "—"}</td></tr>
                <tr><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);color:#9e9e8c;font-size:11px;text-transform:uppercase;">City</td><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);text-align:right;">${city || "—"}</td></tr>
                <tr><td style="padding:12px 0;color:#9e9e8c;font-size:11px;text-transform:uppercase;">Ref</td><td style="padding:12px 0;text-align:right;font-family:'Courier New',monospace;">${code}</td></tr>
              </table>
            </div>`,
          }),
        });

      } else {
        // Extract base64 from data URI for attachment
        const qrBase64 = qr ? qr.replace(/^data:image\/png;base64,/, "") : null;
        // The QR resolves to the guest's live pass page. Only the opaque pass
        // code travels through the third-party image service — no name or tier.
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&bgcolor=f0ede6&color=121212&data=${encodeURIComponent(passUrl(code))}`;

        // Ticket confirmation with QR as attachment
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Zë Events <tickets@houseofze.com>",
            to: email,
            subject: `Your Zë Pass · ${code} — Living Mannequin, ${EVENT.dateEmail}`,
            attachments: qrBase64 ? [{ filename: `ze-pass-${code}.png`, content: qrBase64 }] : [],
            html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#0e0e0e;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0e0e0e;padding:48px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <tr><td style="border-top:1px solid #c9a96e;padding-top:24px;padding-bottom:24px;">
          <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#c9a96e;">Zë · Living Mannequin</p>
        </td></tr>

        <tr><td style="padding-bottom:32px;">
          <h1 style="margin:0 0 16px;font-size:44px;line-height:1;color:#f0ede6;font-weight:400;">Welcome,<br/><em style="color:#c9a96e;">${firstName}.</em></h1>
          <p style="margin:0;font-size:15px;line-height:1.7;color:#9e9e8c;font-family:Arial,sans-serif;">Your place is reserved for the Living Mannequin exhibition. We can't wait to have you.</p>
        </td></tr>

        <tr><td style="background:#1a1a1a;border:1px solid rgba(201,169,110,0.2);padding:28px;">
          <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a96e;">About the Event</p>
          <h2 style="margin:0 0 12px;font-size:22px;font-weight:400;color:#f0ede6;line-height:1.2;">Living Mannequin Exhibition</h2>
          <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#9e9e8c;font-family:Arial,sans-serif;">A gallery-style evening where twenty models wear the Zë collection as living art — still, slow, and intentional — surrounded by visual art installations, live performances, spoken word, live violin, and a closing runway showcase. There will be food, champagne, and a Zë souvenir to take home.</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:10px 0;border-top:1px solid rgba(240,237,230,0.08);">
              <table width="100%"><tr>
                <td style="font-family:Arial,sans-serif;font-size:11px;color:#9e9e8c;">📅 &nbsp;Date</td>
                <td style="font-family:Arial,sans-serif;font-size:13px;color:#f0ede6;text-align:right;">${EVENT.dateEmail} · Doors ${EVENT.doors}</td>
              </tr></table>
            </td></tr>
            <tr><td style="padding:10px 0;border-top:1px solid rgba(240,237,230,0.08);">
              <table width="100%"><tr>
                <td style="font-family:Arial,sans-serif;font-size:11px;color:#9e9e8c;">📍 &nbsp;Location</td>
                <td style="font-family:Arial,sans-serif;font-size:13px;color:#f0ede6;text-align:right;">${EVENT.location}<br/><span style="color:#9e9e8c;font-size:11px;">${EVENT.venue}</span></td>
              </tr></table>
            </td></tr>
            <tr><td style="padding:10px 0;border-top:1px solid rgba(240,237,230,0.08);">
              <table width="100%"><tr>
                <td style="font-family:Arial,sans-serif;font-size:11px;color:#9e9e8c;">🎟 &nbsp;Entry</td>
                <td style="font-family:Arial,sans-serif;font-size:13px;color:#f0ede6;text-align:right;">Free — by pass only</td>
              </tr></table>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="border:1px solid rgba(240,237,230,0.12);background:rgba(240,237,230,0.03);padding:28px;border-top:none;">
          <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#9e9e8c;">Your Pass</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:10px 0;border-top:1px solid rgba(240,237,230,0.08);">
              <table width="100%"><tr>
                <td style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#9e9e8c;">Pass Code</td>
                <td style="font-family:'Courier New',monospace;font-size:14px;color:#c9a96e;text-align:right;">${code}</td>
              </tr></table>
            </td></tr>
            <tr><td style="padding:10px 0;border-top:1px solid rgba(240,237,230,0.08);">
              <table width="100%"><tr>
                <td style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#9e9e8c;">Tier</td>
                <td style="font-size:13px;color:#f0ede6;text-align:right;font-family:Arial,sans-serif;">${tierLabel}</td>
              </tr></table>
            </td></tr>
            <tr><td style="padding:10px 0;border-top:1px solid rgba(240,237,230,0.08);">
              <table width="100%"><tr>
                <td style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#9e9e8c;">Name</td>
                <td style="font-size:13px;color:#f0ede6;text-align:right;font-family:Arial,sans-serif;">${name}</td>
              </tr></table>
            </td></tr>
            <tr><td style="padding:10px 0;border-top:1px solid rgba(240,237,230,0.08);">
              <table width="100%"><tr>
                <td style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#9e9e8c;">Phone</td>
                <td style="font-size:13px;color:#f0ede6;text-align:right;font-family:Arial,sans-serif;">${phone || "—"}</td>
              </tr></table>
            </td></tr>
          </table>
        </td></tr>

        <tr><td align="center" style="padding:28px;background:rgba(240,237,230,0.02);border:1px solid rgba(240,237,230,0.08);border-top:none;">
          <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#9e9e8c;">Your Entry QR Code</p>
          <table cellpadding="0" cellspacing="0" style="background:#f0ede6;padding:16px;margin:0 auto;">
            <tr><td><img src="${qrUrl}" alt="Entry QR Code" width="200" height="200" style="display:block;width:200px;height:200px;" /></td></tr>
          </table>
          <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#9e9e8c;">Scan it to open your live pass — countdown, venue and add-to-calendar. Present it at the entrance on the night.</p>
          <p style="margin:8px 0 0;"><a href="${passUrl(code)}" style="font-family:Arial,sans-serif;font-size:11px;color:#c9a96e;text-decoration:none;letter-spacing:0.1em;">View your pass →</a></p>
          <p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:10px;color:#9e9e8c50;letter-spacing:0.15em;text-transform:uppercase;">Your QR pass is also attached as a PNG file.</p>
        </td></tr>

        <tr><td style="padding:28px;border:1px solid rgba(240,237,230,0.08);border-top:none;background:#1a1a1a;">
          <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#c9a96e;">What to Expect</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${["20 models as living mannequins wearing the Zë collection","Visual art installations throughout the space","Live violin, spoken word & performances","Champagne service","Closing runway showcase of the full collection","Zë souvenir to take home"].map(item => `
            <tr><td style="padding:6px 0;font-family:Arial,sans-serif;font-size:13px;color:#9e9e8c;line-height:1.5;"><span style="color:#c9a96e;margin-right:8px;">✦</span>${item}</td></tr>`).join("")}
          </table>
        </td></tr>

        <tr><td style="border-top:1px solid rgba(240,237,230,0.1);padding-top:28px;padding-bottom:48px;margin-top:4px;">
          <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:11px;color:#9e9e8c;line-height:1.6;">Questions? Reply to this email and our team will be in touch.</p>
          <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:11px;color:#9e9e8c;">Follow us: <a href="https://www.instagram.com/ze.thebrand" style="color:#c9a96e;text-decoration:none;">@ze.thebrand</a></p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;color:#9e9e8c50;letter-spacing:0.1em;">© Zë Creative · Unsubscribe by replying STOP</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
          }),
        });

        // Notify brand of ticket signup
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "Zë Events <tickets@houseofze.com>",
            to: "ze.thebrand@gmail.com",
            subject: `New Ticket Signup — ${name} (${tierLabel})`,
            html: `<div style="background:#0e0e0e;padding:40px;font-family:Arial,sans-serif;color:#f0ede6;">
              <p style="color:#c9a96e;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Zë · New Ticket Signup</p>
              <h2 style="font-size:32px;font-weight:400;margin:16px 0;">${name}</h2>
              <table style="width:100%;border-collapse:collapse;margin-top:24px;">
                <tr><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);color:#9e9e8c;font-size:11px;text-transform:uppercase;">Email</td><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);text-align:right;">${email}</td></tr>
                <tr><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);color:#9e9e8c;font-size:11px;text-transform:uppercase;">Phone</td><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);text-align:right;">${phone || "—"}</td></tr>
                <tr><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);color:#9e9e8c;font-size:11px;text-transform:uppercase;">Tier</td><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);text-align:right;">${tierLabel}</td></tr>
                <tr><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);color:#9e9e8c;font-size:11px;text-transform:uppercase;">City</td><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);text-align:right;">${city || "—"}</td></tr>
                <tr><td style="padding:12px 0;color:#9e9e8c;font-size:11px;text-transform:uppercase;">Pass</td><td style="padding:12px 0;text-align:right;font-family:'Courier New',monospace;">${code}</td></tr>
              </table>
            </div>`,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          console.error("Resend error:", err);
          return corsResponse(JSON.stringify({ error: "Failed to send email" }), 500, origin);
        }
      }

      return corsResponse(JSON.stringify({ success: true }), 200, origin);
    } catch (err) {
      console.error("Worker error:", err);
      return corsResponse(JSON.stringify({ error: "Internal server error" }), 500, origin);
    }
  },
};

// ── Sponsor inquiry handler ──────────────────────────────────────────────────

async function handleSponsor(request: Request, env: Env, origin: string): Promise<Response> {
  if (request.method === "OPTIONS") return corsResponse(null, 204, origin);
  if (request.method !== "POST") return corsResponse(JSON.stringify({ error: "Method not allowed" }), 405, origin);

  try {
    const { company, contact, email, interest } = await request.json() as {
      company: string; contact: string; email: string; interest?: string;
    };

    if (!company || !contact || !email) {
      return corsResponse(JSON.stringify({ error: "Missing required fields" }), 400, origin);
    }

    const key = `SPONSOR-${Date.now()}`;
    await env.SIGNUPS.put(key, JSON.stringify({
      type: "sponsor", company, contact, email, interest: interest ?? "", timestamp: new Date().toISOString(),
    }));

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Zë Events <tickets@houseofze.com>",
        to: "ze.thebrand@gmail.com",
        subject: `New Sponsor Inquiry — ${company}`,
        html: `<div style="background:#0e0e0e;padding:40px;font-family:Arial,sans-serif;color:#f0ede6;">
          <p style="color:#c9a96e;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Zë · New Sponsor Inquiry</p>
          <h2 style="font-size:32px;font-weight:400;margin:16px 0;">${company}</h2>
          <table style="width:100%;border-collapse:collapse;margin-top:24px;">
            <tr><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);color:#9e9e8c;font-size:11px;text-transform:uppercase;">Contact</td><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);text-align:right;">${contact}</td></tr>
            <tr><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);color:#9e9e8c;font-size:11px;text-transform:uppercase;">Email</td><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);text-align:right;">${email}</td></tr>
            <tr><td style="padding:12px 0;color:#9e9e8c;font-size:11px;text-transform:uppercase;">Tier Interest</td><td style="padding:12px 0;text-align:right;">${interest || "—"}</td></tr>
          </table>
          <a href="mailto:${email}" style="display:inline-block;margin-top:32px;padding:14px 28px;background:#c9a96e;color:#0e0e0e;text-decoration:none;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Reply to ${contact}</a>
        </div>`,
      }),
    });

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Zë Events <tickets@houseofze.com>",
        to: email,
        subject: "Zë · Partnership Inquiry Received",
        html: `<div style="background:#0e0e0e;padding:40px;font-family:Georgia,serif;color:#f0ede6;">
          <p style="color:#c9a96e;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;font-family:Arial,sans-serif;">Zë · Living Mannequin</p>
          <h1 style="font-size:40px;font-weight:400;line-height:1.1;margin:24px 0;">Thank you,<br/><em style="color:#c9a96e;">${contact.split(" ")[0]}.</em></h1>
          <p style="color:#9e9e8c;font-size:15px;line-height:1.7;font-family:Arial,sans-serif;max-width:420px;">We've received your partnership inquiry for <strong style="color:#f0ede6;">${company}</strong>. Our team will review your interest in the <strong style="color:#f0ede6;">${interest || "sponsorship"}</strong> tier and be in touch shortly.</p>
          <p style="color:#9e9e8c;font-size:11px;margin-top:40px;font-family:Arial,sans-serif;">© Zë Creative · houseofze.com</p>
        </div>`,
      }),
    });

    return corsResponse(JSON.stringify({ success: true }), 200, origin);
  } catch (err) {
    console.error("Sponsor handler error:", err);
    return corsResponse(JSON.stringify({ error: "Internal server error" }), 500, origin);
  }
}

// ── Public pass lookup ───────────────────────────────────────────────────────

/**
 * Backs the /pass/<code> page a guest reaches by scanning their QR.
 *
 * Unauthenticated by design — anyone holding the code can view it, the same way
 * anyone holding a paper ticket can read it. It therefore returns only what a
 * ticket shows: name, tier, code. Email, phone, city and note are never exposed.
 */
async function handlePass(request: Request, env: Env, origin: string): Promise<Response> {
  if (request.method === "OPTIONS") return corsResponse(null, 204, origin);
  if (request.method !== "GET") return corsResponse(JSON.stringify({ error: "Method not allowed" }), 405, origin);

  const code = new URL(request.url).searchParams.get("code");
  if (!code) return corsResponse(JSON.stringify({ error: "Missing code" }), 400, origin);

  const raw = await env.SIGNUPS.get(code);
  if (raw === null) return corsResponse(JSON.stringify({ error: "Not found" }), 404, origin);

  const signup = JSON.parse(raw) as { name?: string; tier?: string; intent?: string };

  // Waitlist entries hold a reference, not an admission pass.
  if (signup.intent === "waitlist") {
    return corsResponse(JSON.stringify({ error: "Not found" }), 404, origin);
  }

  return corsResponse(JSON.stringify({
    name: signup.name ?? "",
    tier: signup.tier ?? "",
    code,
  }), 200, origin);
}

// ── Admin handler ────────────────────────────────────────────────────────────

async function handleAdmin(request: Request, env: Env, origin: string): Promise<Response> {
  if (request.method === "OPTIONS") return corsResponse(null, 204, origin);

  const url = new URL(request.url);
  const password = url.searchParams.get("password");
  if (password !== env.ADMIN_PASSWORD) {
    return corsResponse(JSON.stringify({ error: "Unauthorized" }), 401, origin);
  }

  // Delete a single signup by its KV key (the pass/reference code).
  if (request.method === "DELETE") {
    const code = url.searchParams.get("code");
    if (!code) return corsResponse(JSON.stringify({ error: "Missing code" }), 400, origin);

    const existing = await env.SIGNUPS.get(code);
    if (existing === null) return corsResponse(JSON.stringify({ error: "Not found" }), 404, origin);

    await env.SIGNUPS.delete(code);
    return corsResponse(JSON.stringify({ success: true, code }), 200, origin);
  }

  const list = await env.SIGNUPS.list();
  const signups = await Promise.all(
    list.keys.map(async (key) => {
      const value = await env.SIGNUPS.get(key.name);
      return value ? JSON.parse(value) : null;
    })
  );

  const filtered = signups.filter(Boolean).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return corsResponse(JSON.stringify({ signups: filtered, total: filtered.length }), 200, origin);
}

// ── Admin announcement handler ───────────────────────────────────────────────

async function handleAnnouncement(
  request: Request,
  env: Env,
  origin: string
): Promise<Response> {
  if (request.method === "OPTIONS") {
    return corsResponse(null, 204, origin);
  }

  if (request.method !== "POST") {
    return corsResponse(
      JSON.stringify({ error: "Method not allowed" }),
      405,
      origin
    );
  }

  const url = new URL(request.url);
  const password = url.searchParams.get("password");

  if (password !== env.ADMIN_PASSWORD) {
    return corsResponse(
      JSON.stringify({ error: "Unauthorized" }),
      401,
      origin
    );
  }

  try {
    const body = await request.json() as {
      subject: string;
      message: string;
      audience: string;
    };

    const { subject, message, audience } = body;

    if (!subject?.trim() || !message?.trim() || !audience) {
      return corsResponse(
        JSON.stringify({
          error: "Subject, message and audience are required"
        }),
        400,
        origin
      );
    }

    // Collect every signup from KV, including paginated results.
    const signups: SignupRecord[] = [];

    let cursor: string | undefined;

    do {
      const page = await env.SIGNUPS.list(
        cursor ? { cursor } : undefined
      );

      for (const key of page.keys) {
        const raw = await env.SIGNUPS.get(key.name);

        if (!raw) continue;

        try {
          const signup = JSON.parse(raw) as SignupRecord;

          // Ignore sponsor records for normal event announcements.
          if (signup.type === "sponsor") continue;

          signups.push(signup);
        } catch {
          console.error(`Could not parse signup: ${key.name}`);
        }
      }

      cursor = page.list_complete ? undefined : page.cursor;
    } while (cursor);

    // Select audience.
    const recipients = signups.filter((signup) => {
      const intent = signup.intent ?? "ticket";

      switch (audience) {
        case "everyone":
          return true;

        case "tickets":
          return intent === "ticket";

        case "waitlist":
          return intent === "waitlist";

        case "general":
        case "vip":
        case "exhibitor":
        case "sponsor":
          return intent === "ticket" && signup.tier === audience;

        default:
          return false;
      }
    });

    if (recipients.length === 0) {
      return corsResponse(
        JSON.stringify({
          error: "No recipients found for this audience"
        }),
        400,
        origin
      );
    }

    let sent = 0;
    let failed = 0;

    /*
     * Send individually so every person can receive a personalised
     * first-name greeting.
     *
     * We send sequentially rather than firing hundreds of requests
     * simultaneously.
     */
    for (const signup of recipients) {
      const firstName = escapeHtml(
        signup.name?.split(" ")[0] || "Guest"
      );

      const html = announcementEmail({
        firstName,
        subject,
        message,
      });

      try {
        const response = await fetch(
          "https://api.resend.com/emails",
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Zë Events <tickets@houseofze.com>",
              to: signup.email,
              subject,
              html,
            }),
          }
        );

        if (response.ok) {
          sent++;
        } else {
          failed++;

          const errorText = await response.text();
          console.error(
            `Failed to send to ${signup.email}:`,
            errorText
          );
        }
      } catch (error) {
        failed++;

        console.error(
          `Announcement error for ${signup.email}:`,
          error
        );
      }
    }

    return corsResponse(
      JSON.stringify({
        success: true,
        total: recipients.length,
        sent,
        failed,
      }),
      200,
      origin
    );

  } catch (error) {
    console.error("Announcement handler error:", error);

    return corsResponse(
      JSON.stringify({
        error: "Failed to send announcement"
      }),
      500,
      origin
    );
  }
}

// ── CORS helper ──────────────────────────────────────────────────────────────

function corsResponse(body: string | null, status: number, origin: string = ""): Response {
  const allowed = [
    "https://houseofze.com",
    "https://www.houseofze.com",
    "https://ze-fashion-home.vercel.app",
    "http://localhost:8080",
    "http://localhost:5173",
    "http://localhost:3000",
  ];
  const allowedOrigin = allowed.includes(origin) ? origin : allowed[0];

  return new Response(body, {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS, GET, DELETE",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function announcementEmail({
  firstName,
  subject,
  message,
}: {
  firstName: string;
  subject: string;
  message: string;
}): string {
  const safeSubject = escapeHtml(subject);

  const safeMessage = escapeHtml(message)
    .replace(/\r?\n\r?\n/g, "</p><p>")
    .replace(/\r?\n/g, "<br/>");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta
    name="viewport"
    content="width=device-width,initial-scale=1.0"
  />
  <title>${safeSubject}</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#0e0e0e;
  font-family:Georgia,'Times New Roman',serif;
">

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  style="background:#0e0e0e;padding:48px 16px;"
>
  <tr>
    <td align="center">

      <table
        width="560"
        cellpadding="0"
        cellspacing="0"
        style="max-width:560px;width:100%;"
      >

        <tr>
          <td style="
            border-top:1px solid #c9a96e;
            padding-top:24px;
            padding-bottom:24px;
          ">
            <p style="
              margin:0;
              font-family:Arial,sans-serif;
              font-size:10px;
              letter-spacing:0.25em;
              text-transform:uppercase;
              color:#c9a96e;
            ">
              Zë · Living Mannequin
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding-bottom:32px;">

            <h1 style="
              margin:0 0 16px;
              font-size:44px;
              line-height:1;
              color:#f0ede6;
              font-weight:400;
            ">
              Hello,<br/>
              <em style="color:#c9a96e;">
                ${firstName}.
              </em>
            </h1>

            <p style="
              margin:0;
              font-family:Arial,sans-serif;
              font-size:11px;
              letter-spacing:0.2em;
              text-transform:uppercase;
              color:#9e9e8c;
            ">
              Important Event Update
            </p>

          </td>
        </tr>

        <tr>
          <td style="
            background:#1a1a1a;
            border:1px solid rgba(201,169,110,0.2);
            padding:32px;
          ">

            <h2 style="
              margin:0 0 24px;
              font-size:25px;
              font-weight:400;
              color:#f0ede6;
              line-height:1.25;
            ">
              ${safeSubject}
            </h2>

            <div style="
              font-family:Arial,sans-serif;
              font-size:14px;
              line-height:1.8;
              color:#9e9e8c;
            ">
              <p style="margin:0;">
                ${safeMessage}
              </p>
            </div>

          </td>
        </tr>

        <tr>
          <td style="
            padding-top:32px;
            padding-bottom:48px;
            border-bottom:1px solid rgba(240,237,230,0.1);
          ">

            <p style="
              margin:0 0 8px;
              font-family:Arial,sans-serif;
              font-size:11px;
              color:#9e9e8c;
              line-height:1.6;
            ">
              If you have any questions, simply reply to this email
              and our team will be in touch.
            </p>

            <p style="
              margin:0 0 4px;
              font-family:Arial,sans-serif;
              font-size:11px;
              color:#9e9e8c;
            ">
              Follow us:
              <a
                href="https://www.instagram.com/ze.thebrand"
                style="
                  color:#c9a96e;
                  text-decoration:none;
                "
              >
                @ze.thebrand
              </a>
            </p>

            <p style="
              margin:0;
              font-family:Arial,sans-serif;
              font-size:10px;
              color:#777;
              letter-spacing:0.1em;
            ">
              © Zë Creative
            </p>

          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>`;
}

interface Env {
  RESEND_API_KEY: string;
  ADMIN_PASSWORD: string;
  SIGNUPS: KVNamespace;
}