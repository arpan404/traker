import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const sans = IBM_Plex_Sans({
  variable: "--font-ibm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-ibm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Traker",
    template: "%s · Traker",
  },
  description:
    "Track issues, manage team and personal todos, and keep projects moving in one workspace.",
  applicationName: "Traker",
  keywords: [
    "issue tracking",
    "kanban",
    "project management",
    "team todos",
    "personal todos",
  ],
  authors: [{ name: "Traker" }],
  creator: "Traker",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    title: "Traker",
    description:
      "Track issues, manage team and personal todos, and keep projects moving in one workspace.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Traker",
    description:
      "Track issues, manage team and personal todos, and keep projects moving in one workspace.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${mono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
