import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Freight Emissions Calculator",
  description: "Calculate CO2 emissions for freight shipments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
