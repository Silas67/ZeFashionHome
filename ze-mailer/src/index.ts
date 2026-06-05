export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin") ?? "";
    const url = new URL(request.url);

    // Admin route
    if (url.pathname === "/admin") {
      return handleAdmin(request, env, origin);
    }

    // Sponsor inquiry route
    if (url.pathname === "/sponsor") {
      return handleSponsor(request, env, origin);
    }

    // CORS preflight
    if (request.method === "OPTIONS") {
      return corsResponse(null, 204, origin);
    }

    if (request.method !== "POST") {
      return corsResponse(JSON.stringify({ error: "Method not allowed" }), 405, origin);
    }

    try {
      const { name, email, tier, code, qr, city, note } = await request.json() as {
        name: string;
        email: string;
        tier: string;
        code: string;
        qr?: string;
        city?: string;
        note?: string;
      };

      if (!name || !email || !tier || !code) {
        return corsResponse(JSON.stringify({ error: "Missing required fields" }), 400, origin);
      }

      const TIER_LABELS: Record<string, string> = {
        general: "General",
        vip: "VIP",
        exhibitor: "Creatives",
        sponsor: "Sponsor",
      };

      const tierLabel = TIER_LABELS[tier] ?? tier;
      const firstName = name.split(" ")[0];

      // Save to KV
      await env.SIGNUPS.put(code, JSON.stringify({
        name,
        email,
        tier,
        city: city ?? "",
        note: note ?? "",
        code,
        timestamp: new Date().toISOString(),
      }));

      // Send email via Resend
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Zë Events <tickets@houseofze.com>",
          to: email,
          subject: `Your Zë Pass · ${code}`,
          html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Zë Pass</title>
</head>
<body style="margin:0;padding:0;background:#0e0e0e;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0e0e0e;padding:48px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr><td style="border-top:1px solid #c9a96e;padding-top:32px;padding-bottom:32px;">
          <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#c9a96e;">Zë · Living Mannequin</p>
        </td></tr>
        <tr><td style="padding-bottom:40px;">
          <h1 style="margin:0 0 16px;font-size:48px;line-height:1;color:#f0ede6;font-weight:400;">Welcome,<br/><em style="color:#c9a96e;">${firstName}.</em></h1>
          <p style="margin:0;font-size:15px;line-height:1.7;color:#9e9e8c;font-family:Arial,sans-serif;max-width:420px;">Your place is reserved. Present this pass at the entrance on the evening of the exhibition.</p>
        </td></tr>
        <tr><td style="border:1px solid rgba(240,237,230,0.12);background:rgba(240,237,230,0.03);padding:32px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td colspan="2" style="padding-bottom:20px;border-bottom:1px solid rgba(240,237,230,0.1);"><p style="margin:0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#9e9e8c;">Pass Details</p></td></tr>
            <tr><td style="padding:16px 0 0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#9e9e8c;">Pass Code</td><td style="padding:16px 0 0;font-family:'Courier New',monospace;font-size:14px;color:#f0ede6;text-align:right;">${code}</td></tr>
            <tr><td style="padding:12px 0 0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#9e9e8c;">Tier</td><td style="padding:12px 0 0;font-size:14px;color:#f0ede6;text-align:right;font-family:Arial,sans-serif;">${tierLabel}</td></tr>
            <tr><td style="padding:12px 0 0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#9e9e8c;">Name</td><td style="padding:12px 0 0;font-size:14px;color:#f0ede6;text-align:right;font-family:Arial,sans-serif;">${name}</td></tr>
            <tr><td style="padding:12px 0 0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#9e9e8c;">Date</td><td style="padding:12px 0 0;font-size:14px;color:#f0ede6;text-align:right;font-family:Arial,sans-serif;">14 · 08 · 2026</td></tr>
          </table>
        </td></tr>
        <tr><td style="border-top:1px solid rgba(240,237,230,0.1);padding-top:32px;padding-bottom:48px;">
          <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:11px;color:#9e9e8c;line-height:1.6;">Questions? Reply to this email and our team will be in touch.</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;color:#9e9e8c50;letter-spacing:0.1em;">© Zë Creative · Unsubscribe by replying STOP</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
        }),
      });

      // Notify the brand
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Zë Events <tickets@houseofze.com>",
          to: "ze.thebrand@gmail.com",
          subject: `New Waitlist Signup — ${name} (${tierLabel})`,
          html: `
      <div style="background:#0e0e0e;padding:40px;font-family:Arial,sans-serif;color:#f0ede6;">
        <p style="color:#c9a96e;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Zë · New Waitlist Signup</p>
        <h2 style="font-size:32px;font-weight:400;margin:16px 0;">${name}</h2>
        <table style="width:100%;border-collapse:collapse;margin-top:24px;">
          <tr><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);color:#9e9e8c;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Email</td><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);text-align:right;">${email}</td></tr>
          <tr><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);color:#9e9e8c;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Tier</td><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);text-align:right;">${tierLabel}</td></tr>
          <tr><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);color:#9e9e8c;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">City</td><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);text-align:right;">${city || "—"}</td></tr>
          <tr><td style="padding:12px 0;color:#9e9e8c;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Pass</td><td style="padding:12px 0;text-align:right;font-family:'Courier New',monospace;">${code}</td></tr>
        </table>
      </div>
    `,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Resend error:", err);
        return corsResponse(JSON.stringify({ error: "Failed to send email" }), 500, origin);
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
      company: string;
      contact: string;
      email: string;
      interest?: string;
    };

    if (!company || !contact || !email) {
      return corsResponse(JSON.stringify({ error: "Missing required fields" }), 400, origin);
    }

    // Save to KV
    const key = `SPONSOR-${Date.now()}`;
    await env.SIGNUPS.put(key, JSON.stringify({
      type: "sponsor",
      company,
      contact,
      email,
      interest: interest ?? "",
      timestamp: new Date().toISOString(),
    }));

    // Notify you
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Zë Events <tickets@houseofze.com>",
        to: "ze.thebrand@gmail.com",
        subject: `New Sponsor Inquiry — ${company}`,
        html: `
          <div style="background:#0e0e0e;padding:40px;font-family:Arial,sans-serif;color:#f0ede6;">
            <p style="color:#c9a96e;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Zë · New Sponsor Inquiry</p>
            <h2 style="font-size:32px;font-weight:400;margin:16px 0;">${company}</h2>
            <table style="width:100%;border-collapse:collapse;margin-top:24px;">
              <tr><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);color:#9e9e8c;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Contact</td><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);text-align:right;">${contact}</td></tr>
              <tr><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);color:#9e9e8c;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Email</td><td style="padding:12px 0;border-bottom:1px solid rgba(240,237,230,0.1);text-align:right;">${email}</td></tr>
              <tr><td style="padding:12px 0;color:#9e9e8c;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Tier Interest</td><td style="padding:12px 0;text-align:right;">${interest || "—"}</td></tr>
            </table>
            <a href="mailto:${email}" style="display:inline-block;margin-top:32px;padding:14px 28px;background:#c9a96e;color:#0e0e0e;text-decoration:none;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;">Reply to ${contact}</a>
          </div>
        `,
      }),
    });

    // Acknowledge the sponsor
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Zë Events <tickets@houseofze.com>",
        to: email,
        subject: "Zë · Partnership Inquiry Received",
        html: `
          <div style="background:#0e0e0e;padding:40px;font-family:Georgia,serif;color:#f0ede6;">
            <p style="color:#c9a96e;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;font-family:Arial,sans-serif;">Zë · Living Mannequin</p>
            <h1 style="font-size:40px;font-weight:400;line-height:1.1;margin:24px 0;">Thank you,<br/><em style="color:#c9a96e;">${contact.split(" ")[0]}.</em></h1>
            <p style="color:#9e9e8c;font-size:15px;line-height:1.7;font-family:Arial,sans-serif;max-width:420px;">
              We've received your partnership inquiry for <strong style="color:#f0ede6;">${company}</strong>. Our team will review your interest in the <strong style="color:#f0ede6;">${interest || "sponsorship"}</strong> tier and be in touch shortly.
            </p>
            <p style="color:#9e9e8c;font-size:11px;margin-top:40px;font-family:Arial,sans-serif;">© Zë Creative · houseofze.com</p>
          </div>
        `,
      }),
    });

    return corsResponse(JSON.stringify({ success: true }), 200, origin);
  } catch (err) {
    console.error("Sponsor handler error:", err);
    return corsResponse(JSON.stringify({ error: "Internal server error" }), 500, origin);
  }
}

// ── Admin handler ────────────────────────────────────────────────────────────

async function handleAdmin(request: Request, env: Env, origin: string): Promise<Response> {
  if (request.method === "OPTIONS") return corsResponse(null, 204, origin);

  const url = new URL(request.url);
  const password = url.searchParams.get("password");
  if (password !== env.ADMIN_PASSWORD) {
    return corsResponse(JSON.stringify({ error: "Unauthorized" }), 401, origin);
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
      "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

interface Env {
  RESEND_API_KEY: string;
  ADMIN_PASSWORD: string;
  SIGNUPS: KVNamespace;
}