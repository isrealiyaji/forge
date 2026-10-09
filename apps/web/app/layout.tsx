import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted (files copied from @fontsource into app/fonts/) rather than
// next/font/google — the latter fetches from Google at dev-server request
// time, and an unreliable network path to fonts.googleapis.com was
// intermittently breaking page compiles. The files live inside apps/web
// itself, not the hoisted workspace root node_modules — Vercel's build
// sandboxes each project to its own directory and refuses to resolve a
// font file that "leaves the filesystem root".
const display = localFont({
  src: "./fonts/anton-latin-400-normal.woff2",
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const body = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Forge Athletic Club",
  description: "Member, instructor, and admin operations for Forge Athletic Club.",
};

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("forge-theme");
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    document.documentElement.dataset.theme = theme;
  } catch (e) {}
})();
`;

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={`${display.variable} ${body.variable} font-body`}>{children}</body>
    </html>
  );
};

export default RootLayout;
