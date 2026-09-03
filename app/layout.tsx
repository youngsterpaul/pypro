import React from "react";

export const metadata = {
  title: "ProQuant Terminal",
  description: "Quantitative Trading & Execution Engine",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Inject Tailwind CSS via CDN */}
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-[#0B0E11] text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}