import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { QueryProvider } from "@checkergie/api/query";
import { SITE_URL } from "src/constants/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Production에만 설정해 로컬·Preview 방문이 통계에 섞이지 않게 한다.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const SITE_TITLE = "체커기 | 온라인 강의 비교와 추천";
const SITE_DESCRIPTION = "여러 플랫폼에 흩어진 온라인 강의를 한곳에서 비교하고, 나에게 맞는 강의를 찾아보세요.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  verification: {
    google: "TY0dpmOBeICJi7tuCftK4XfY9PZgW2F7_F3K4ccIUJ0",
  },
  alternates: {
    canonical: "/",
  },
  icons: {
		icon: "/logo.svg",
	},
  openGraph: {
    url: "/",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: "체커기",
    locale: "ko_KR",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  );
}