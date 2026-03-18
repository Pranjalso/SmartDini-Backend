import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Smartdini - Contactless QR Ordering System for Cafes",
  description: "Revolutionize your cafe operations with Smartdini's contactless QR-based ordering and digital menu system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="antialiased font-poppins">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}