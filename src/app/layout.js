export const dynamic = "force-dynamic";
import { Geist, Geist_Mono } from "next/font/google";
import EmotionRegistry from "../lib/EmotionRegistry";
import GlobalStyles from "@/styles/GlobalStyles";
import Header from "../components/common/Header/Header";
import FooterTabBar from "../components/common/FooterTabBar/FooterTabBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ボランティアマッチング",
  description: "Next.jsとSupabaseで作るボランティアマッチングアプリ",
  icons: {
    icon: "/public/favicon.ico",
  },
};

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
