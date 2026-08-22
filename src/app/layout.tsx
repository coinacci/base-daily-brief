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
  other: {
      "base:app_id": "6a7d7123ff2c2a5c4a672477",
      "base:builder_code": "bc_2iax4m4l",
      "fc:miniapp": '{"version":"1","imageUrl":"https://basedailybrief.vercel.app/og-image.png","button":{"title":"Read Brief","action":{"type":"launch_frame","name":"Base Daily Brief","url":"https://basedailybrief.vercel.app","splashImageUrl":"https://basedailybrief.vercel.app/icon.png","splashBackgroundColor":"#f5f0e8"}}}',
      "fc:frame": '{"version":"1","imageUrl":"https://basedailybrief.vercel.app/og-image.png","button":{"title":"Read Brief","action":{"type":"launch_frame","name":"Base Daily Brief","url":"https://basedailybrief.vercel.app","splashImageUrl":"https://basedailybrief.vercel.app/icon.png","splashBackgroundColor":"#f5f0e8"}}}',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <WagmiProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
