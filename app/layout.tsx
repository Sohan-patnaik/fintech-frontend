import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinCopilot — AI Financial Analyst",
  description:
    "FinCopilot is an AI-powered financial platform that delivers real-time market news, intelligent investment insights, portfolio tracking, and transaction management. Ask questions, analyze stocks, build portfolios, and make smarter financial decisions with AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-white text-text-primary font-body">
        {children}
      </body>
    </html>
  );
}