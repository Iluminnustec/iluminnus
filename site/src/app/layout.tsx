import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { VersionBadge } from "@/components/version-badge";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://iluminnus.com.br"),
  title: "Iluminnus Technology",
  description:
    "Iluminnus Technology desenvolve e opera sistemas próprios, vendidos por assinatura mensal.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <VersionBadge />
      </body>
    </html>
  );
}
