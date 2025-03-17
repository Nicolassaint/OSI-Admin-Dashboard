import { Geist, Geist_Mono } from "next/font/google";
import { NextAuthProvider } from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Dashboard Admin - OSI",
  description: "Tableau de bord d'administration pour OSI",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/osi_favicon.png' },
      { url: '/osi_favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/osi_favicon.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/osi_favicon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextAuthProvider>{children}</NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
