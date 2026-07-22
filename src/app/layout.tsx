import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import { ThemeSync } from "@/components/ThemeSync";
import { AuthProvider } from "@/components/AuthProvider";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Life Simulator Dashboard",
  description: "Your life is a story. Discover it.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Life Dashboard",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#B8695C",
};

// Runs before first paint (see <head> below) to set data-theme from
// localStorage synchronously — without this, the theme only becomes known
// after ThemeSync's effect resolves an async /api/theme fetch, which is
// what caused the visible day->night flash on refresh. Kept tiny and
// dependency-free since it has to be inlined.
const THEME_INIT_SCRIPT = `
(function() {
  try {
    var theme = localStorage.getItem("theme");
    if (theme === "night" || theme === "day") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${lora.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-terracotta/20">
        <AuthProvider>
          <ThemeSync />
          <ServiceWorkerRegister />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
