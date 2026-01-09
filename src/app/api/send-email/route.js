// メール送信API
import { Resend } from "resend";
import { NextResponse } from "next/server";

// Resendの初期化
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    // データを受け取る
    const {
      eventName,
      applicantEmail,
      applicantName,
      type = "apply",
    } = await request.json();

    // 管理者のメールアドレス
    const adminEmail = process.env.ADMIN_EMAIL;

    // --- 1. メールの内容で分岐 ---
    let userSubject = "";
    let userBody = "";
    let adminSubject = "";
    let adminBody = "";

    if (type === "cancel") {
      // キャンセルの場合
      userSubject = `【キャンセル完了】「${eventName}」の応募をキャンセルしました`;
      userBody = `
        <p>${applicantName} 様</p>
        <p>以下のボランティア活動の応募をキャンセルしました。</p>
        <p><strong>・イベント名：</strong>${eventName}</p>
        <p>またのご参加をお待ちしております。</p>
        <hr />
        <p>※このメールは自動送信されています。</p>
      `;

      adminSubject = `【キャンセル通知】「${eventName}」の応募がキャンセルされました`;
      adminBody = `
        <p>以下の応募がキャンセルされました。</p>
        <ul>
          <li><strong>イベント名:</strong> ${eventName}</li>
          <li><strong>キャンセル者名:</strong> ${applicantName}</li>
          <li><strong>連絡先:</strong> ${applicantEmail}</li>
        </ul>
        <p>管理画面から確認してください。</p>
      `;
    } else {
      // 応募の場合 (デフォルト)
      userSubject = `【応募完了】「${eventName}」への応募を受け付けました`;
      userBody = `
        <p>${applicantName} 様</p>
        <p>ボランティア活動「<strong>${eventName}</strong>」への応募ありがとうございます。</p>
        <p>主催者からの連絡をお待ちください。</p>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #fff8e1; border: 1px solid #ffe082; border-radius: 5px; color: #5d4037; font-size: 0.9em;">
          <strong>【キャンセルについて】</strong><br>
          原則として、<span style="color: #d32f2f; font-weight: bold;">開催日の3日前以降</span>のキャンセルはお控えください。<br>
          やむを得ない事情で参加できなくなった場合は、お早めにアプリからキャンセルの手続きをお願いいたします。
        </div>

        <hr />
        <p>※このメールは自動送信されています。</p>
      `;

      adminSubject = `【新規応募】「${eventName}」に新しい応募がありました`;
      adminBody = `
        <p>新しい応募がありました。</p>
        <ul>
          <li><strong>イベント名:</strong> ${eventName}</li>
          <li><strong>応募者名:</strong> ${applicantName}</li>
          <li><strong>連絡先:</strong> ${applicantEmail}</li>
        </ul>
        <p>管理画面から確認してください。</p>
      `;
    }

    // --- 2. メール送信実行 ---

    // ユーザーへのメール
    const userMail = await resend.emails.send({
      from: "Link.U 運営事務局 <noreply@link-u-app.xyz>",
      to: applicantEmail,
      subject: userSubject,
      html: userBody,
    });

    // 管理者へのメール
    const adminMail = await resend.emails.send({
      from: "Link.U システム <noreply@link-u-app.xyz>",
      to: adminEmail,
      subject: adminSubject,
      html: adminBody,
    });

    // 結果確認
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
