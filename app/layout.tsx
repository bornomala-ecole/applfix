import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import AuthProviders from "@/lib/authProvider";


const inter = Inter({
  subsets:['latin'],
  variable: "--font-inter",
  weight: ["300","400","500","600","700"],
})

const playfair = Playfair_Display({
  subsets:['latin'],
  variable: "--font-playfair",
  weight: ["400","500","600","700","800"],
})

export const metadata: Metadata = {
  title: "ApplFix",
  description: "Your all in one stop solution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased`}
      >
        <AuthProviders>
          {children}
        </AuthProviders>
      </body>
    </html>
  );
}
