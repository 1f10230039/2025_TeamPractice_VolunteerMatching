//　全体のレイアウト設定
export const dynamic = "force-dynamic";
import { Geist, Geist_Mono } from "next/font/google";
import EmotionRegistry from "../lib/EmotionRegistry";
import GlobalStyles from "@/styles/GlobalStyles";
import Header from "../components/common/Header/Header";
import FooterTabBar from "../components/common/FooterTabBar/FooterTabBar";

// フォント設定
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// モノスペースフォント設定
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ビューポート設定
export const viewport = {
  width: "device-width", // デバイスの幅に合わせる
  initialScale: 1, // 初期拡大率
  maximumScale: 1, // 最大拡大率
  userScalable: false, // スマホで勝手にズームされないようにする
  themeColor: "#f5fafc", // 背景色に合わせる
};

// メタデータ設定
export const metadata = {
  title: {
    template: "%s | Link.U",
    default: "Link.U",
  },
  description:
    "2025年度、INIAD3年時にチーム7-1で制作したボランティアマッチングアプリ",

  // PWA用の設定
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Link.U",
  },

  // アイコン設定
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },

  // Open Graph設定（SNSでシェアされたときに使われる）
  openGraph: {
    title: "Link.U - ボランティアマッチング",
    description: "学生とボランティアをつなぐプラットフォーム",
    url: "https://2025-team-practice-volunteer-matchi.vercel.app/",
    siteName: "Link.U",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/ogp.png",
        width: 1024,
        height: 630,
        alt: "Link.U OGP Image",
      },
    ],
  },

  // Twitter(X)用のカード設定
  twitter: {
    card: "summary_large_image",
    title: "Link.U",
    description: "学生とボランティアをつなぐプラットフォーム",
  },
};

// レイアウトコンポーネント本体
export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <EmotionRegistry>
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          <GlobalStyles />
          <Header />
          <main>{children}</main>
          <FooterTabBar />
        </body>
      </EmotionRegistry>
    </html>
  );
}
