import type { Metadata } from "next";
import "./globals.css";

const fontClass = "font-poppins";

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
    <html lang="en" className={fontClass}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
