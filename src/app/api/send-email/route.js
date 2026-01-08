// ボランティア応募確認メール送信API
import { Resend } from "resend";
import { NextResponse } from "next/server";

// Resendの初期化
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    // クライアントから送られてきたデータを受け取る
    const { eventName, applicantEmail, applicantName } = await request.json();

    // 管理者のメールアドレス（環境変数から取得）
    const adminEmail = process.env.ADMIN_EMAIL;

    // 応募者への確認メール送信
    const userMail = await resend.emails.send({
      // ドメイン「link-u-app.xyz」を使用
      from: "Link.U 運営事務局 <noreply@link-u-app.xyz>",
      to: applicantEmail,
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
      from: "Link.U システム <noreply@link-u-app.xyz>",
      to: adminEmail,
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

    // メール送信結果の確認
    if (userMail.error || adminMail.error) {
      console.error("Mail Error:", userMail.error || adminMail.error);
      return NextResponse.json(
        { error: "メール送信に失敗しました" },
        { status: 500 }
      );
    }

    // 成功レスポンス
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
