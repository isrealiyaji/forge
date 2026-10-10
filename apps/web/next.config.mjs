// The API lives on a different domain (Render) than this app (Vercel), so a
// browser fetch straight to it is cross-site — auth cookies the API sets can
// never be sent back to this domain, which breaks every protected page.
// Proxying /api/* through this server keeps the browser talking to a single
// origin, so Set-Cookie ends up scoped here instead.
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    return [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }];
  },
};

export default nextConfig;
