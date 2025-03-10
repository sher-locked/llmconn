import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LLM Connect",
  description: "Text analysis tool for extracting key recommendations and insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
