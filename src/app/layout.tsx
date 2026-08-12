import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LanguageProvider } from "@/lib/LanguageContext";
import { WagmiProvider } from "@/components/WagmiProvider";
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
  title: "Base Daily Brief",
  description: "Base ekosisteminden süzülmüş, kaynaklı günlük özetler.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <WagmiProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
