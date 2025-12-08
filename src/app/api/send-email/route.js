import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    // クライアントから送られてきたデータを受け取る
    const { eventName, applicantEmail, applicantName } = await request.json();

    const adminEmail = process.env.ADMIN_EMAIL;

    // 応募者への確認メール送信
    const userMail = await resend.emails.send({
      from: "onboarding@resend.dev", // テスト用のアドレス (本番では自分のドメインに変える)
      to: applicantEmail, // 応募者のメアド
      subject: `【応募完了】「${eventName}」への応募を受け付けました`,
      html: `
        <p>${applicantName} 様</p>
        <p>ボランティア活動「<strong>${eventName}</strong>」への応募ありがとうございます。</p>
        <p>主催者からの連絡をお待ちください。</p>
        <hr />
        <p>※このメールは自動送信されています。</p>
      `,
    });

    // 管理者への通知メール送信
    const adminMail = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: adminEmail, // 管理者のメアド
      subject: `【新規応募】「${eventName}」に新しい応募がありました`,
      html: `
        <p>新しい応募がありました。</p>
        <ul>
          <li><strong>イベント名:</strong> ${eventName}</li>
          <li><strong>応募者名:</strong> ${applicantName}</li>
          <li><strong>連絡先:</strong> ${applicantEmail}</li>
        </ul>
        <p>管理画面から確認してください。</p>
      `,
    });

    if (userMail.error || adminMail.error) {
      console.error("Mail Error:", userMail.error || adminMail.error);
      return NextResponse.json(
        { error: "メール送信に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
