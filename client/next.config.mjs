const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "microphone=(), geolocation=()" },
];

const nextConfig = {
  poweredByHeader: false,

  async rewrites() {
    const api = process.env.API_ORIGIN || "http://localhost:5000";
    return [{ source: "/api/:path*", destination: `${api}/api/:path*` }];
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;