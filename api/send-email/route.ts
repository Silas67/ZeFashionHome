import nodemailer from "nodemailer";
import QRCode from "qrcode";
import { ticketTemplate } from "@/app/emails/ticketTemplate";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

export async function POST(req: Request) {

    try {
        const { name, email, phone, ageRange, creative, creativeField, } = await req.json();

        if (!email || !name) {
            return new Response("Missing name or email", { status: 400 });
        }

        const ticketId = Math.random().toString(36).slice(2, 10).toUpperCase()
        const qrData = `ticket:${ticketId}`; // whatever you want inside the QR
        const qrImage = await QRCode.toDataURL(qrData);

        await db.ticket.create({
            data: {
                name,
                email,
                phone,
                ageRange,
                isCreative: creative === true,
                creativeField: creativeField || null,
            },
        });

        // Create transporter (example: Gmail)
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        // Email contents
        const mailOptions = {
            from: `"ZË Tickets" < ${process.env.MAIL_USER}> `,
            to: email,
            subject: "Your ZË Entry Ticket",
            html: ticketTemplate({
                name,
                eventDate: "Dec 15, 2025",
                startTime: "12:00 PM",
                venue: "The Commune Studio, Abuja",
                ticketType: "General Entry",
                ticketId,
                qrImage,
            }),
            attachments: [
                {
                    filename: "ze-logo.png",
                    path: "./public/email.jpeg",  // local file
                    cid: "zeLogo",  // must match src="cid:zeLogo"
                }
            ]
        };

        await transporter.sendMail(mailOptions);

        return new Response("Email sent successfully", { status: 200 });
    } catch (err) {
        console.error(err);
        return new Response("Failed to send email", { status: 500 });
    }
}
