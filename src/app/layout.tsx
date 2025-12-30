import type { Metadata } from "next";
import { Roboto_Serif, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "../components/NavBar";

const Sans = Roboto_Serif({
  variable: "--font-roboto-serif",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prext | Ecommerce",
  description:
    "Shop quality products at unbeatable prices. Discover electronics, fashion, home essentials, and more with fast delivery, secure payments, and excellent customer support. Your one-stop online store for all your needs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${Sans.variable} ${geistMono.variable} antialiased mt-20`}
      >
        <NavBar />
        {children}
      </body>
    </html>
  );
}
