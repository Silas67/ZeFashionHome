import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const TIER_LABELS: Record<string, string> = {
  general: "General",
  vip: "VIP",
  exhibitor: "Creatives",
  sponsor: "Sponsor",
};

export async function POST(req: Request) {
  try {
    const { email, name, tier, code, qr } = await req.json();

    if (!email || !name || !tier || !code) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const tierLabel = TIER_LABELS[tier] ?? tier;
    const firstName = name.split(" ")[0];

    // QR is a data URI (data:image/png;base64,...) — embed inline so it
    // renders in email clients that block remote images.
    // Strip the data URI prefix to get raw base64 for the attachment.
    const qrBase64 = qr ? qr.replace(/^data:image\/png;base64,/, "") : null;

    await resend.emails.send({
      from: "Zë Events <tickets@houseofze.com>", // swap to your verified domain once ready
      to: email,
      subject: `Your Zë Pass · ${code}`,
      attachments: qrBase64
        ? [
          {
            filename: `ze-pass-${code}.png`,
            content: qrBase64,
          },
        ]
        : [],
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Zë Pass</title>
</head>
<body style="margin:0;padding:0;background:#0e0e0e;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0e0e0e;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header bar -->
          <tr>
            <td style="border-top:1px solid #c9a96e;padding-top:32px;padding-bottom:32px;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#c9a96e;">
                Zë · Living Mannequin
              </p>
            </td>
          </tr>

          <!-- Hero text -->
          <tr>
            <td style="padding-bottom:40px;">
              <h1 style="margin:0 0 16px;font-size:48px;line-height:1;color:#f0ede6;font-weight:400;">
                Welcome,<br/>
                <em style="color:#c9a96e;">${firstName}.</em>
              </h1>
              <p style="margin:0;font-size:15px;line-height:1.7;color:#9e9e8c;font-family:Arial,sans-serif;max-width:420px;">
                Your place is reserved. Present this pass — or the QR code attached — at the entrance on the evening of the exhibition.
              </p>
            </td>
          </tr>

          <!-- Pass details card -->
          <tr>
            <td style="border:1px solid rgba(240,237,230,0.12);background:rgba(240,237,230,0.03);padding:32px 28px;margin-bottom:32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td colspan="2" style="padding-bottom:20px;border-bottom:1px solid rgba(240,237,230,0.1);">
                    <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#9e9e8c;">
                      Pass Details
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 0 0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#9e9e8c;width:50%;">
                    Pass Code
                  </td>
                  <td style="padding:16px 0 0;font-family:'Courier New',monospace;font-size:14px;color:#f0ede6;text-align:right;">
                    ${code}
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0 0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#9e9e8c;">
                    Tier
                  </td>
                  <td style="padding:12px 0 0;font-size:14px;color:#f0ede6;text-align:right;font-family:Arial,sans-serif;">
                    ${tierLabel}
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0 0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#9e9e8c;">
                    Name
                  </td>
                  <td style="padding:12px 0 0;font-size:14px;color:#f0ede6;text-align:right;font-family:Arial,sans-serif;">
                    ${name}
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 0 0;font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#9e9e8c;">
                    Date
                  </td>
                  <td style="padding:12px 0 0;font-size:14px;color:#f0ede6;text-align:right;font-family:Arial,sans-serif;">
                    14 · 08 · 2026
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- QR inline (fallback for clients that show inline images) -->
          ${qrBase64
          ? `<tr>
            <td align="center" style="padding:32px 0;">
              <table cellpadding="0" cellspacing="0" style="background:#f0ede6;padding:20px;">
                <tr>
                  <td>
                    <img src="cid:qr-pass" alt="QR Pass" width="200" height="200"
                      style="display:block;width:200px;height:200px;" />
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:10px;font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#0e0e0e80;">
                    LIVING MANNEQUIN · ${code}
                  </td>
                </tr>
              </table>
              <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#9e9e8c;">
                QR pass also attached as a PNG file.
              </p>
            </td>
          </tr>`
          : ""
        }

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid rgba(240,237,230,0.1);padding-top:32px;padding-bottom:48px;">
              <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:11px;color:#9e9e8c;line-height:1.6;">
                Questions? Reply to this email and our team will be in touch.
              </p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;color:#9e9e8c50;letter-spacing:0.1em;">
                © Zë Creative · Unsubscribe by replying STOP
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Resend error:", error);
    return NextResponse.json(
      { error: "Failed to send confirmation email" },
      { status: 500 }
    );
  }
}