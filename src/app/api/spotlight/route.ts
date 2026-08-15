import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { projectName, twitter, email, description } = await req.json();

  if (!projectName || !email || !description) {
    return NextResponse.json({ error: "Eksik alan var." }, { status: 400 });
  }

  if (description.length > 500) {
    return NextResponse.json({ error: "Açıklama 500 karakteri geçemez." }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: "Base Daily Brief <onboarding@resend.dev>",
      to: "yysoncul@gmail.com",
      subject: `Project Spotlight Başvurusu: ${projectName}`,
      html: `
        <h2>Yeni Project Spotlight Başvurusu</h2>
        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Proje Adı</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${projectName}</td>
          </tr>
<tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Twitter/X</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${twitter || "—"}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">İletişim Email</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Tanıtım Yazısı</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${description}</td>
          </tr>
        </table>
        <p style="color: #666; font-size: 12px; margin-top: 16px;">Base Daily Brief · basedailybrief.vercel.app</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Email gönderilemedi." }, { status: 500 });
  }
}
