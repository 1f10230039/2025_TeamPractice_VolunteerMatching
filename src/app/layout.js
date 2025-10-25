import { Geist, Geist_Mono } from "next/font/google";
import EmotionRegistry from "../lib/EmotionRegistry";
import GlobalStyles from "@/styles/GlobalStyles";

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
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <EmotionRegistry>
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          <GlobalStyles />
          {children}
        </body>
      </EmotionRegistry>
    </html>
  );
}
