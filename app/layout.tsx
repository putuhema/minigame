import type { Metadata } from "next";
import "./globals.css"
import { GeistMono } from "geist/font/mono"


export const metadata: Metadata = {
  title: "Minigame",
  description: "classic mini games",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en"
      className={GeistMono.variable}
    >
      <body>
        {children}
      </body>
    </html>
  );
}
