import "@/styles/globals.css";

import { Montserrat as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/sonner";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Admin | HIMARPL",
  description: "Admin Panel for HIMARPL",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <TRPCReactProvider>{children}</TRPCReactProvider>

        <Toaster />
      </body>
    </html>
  );
}
