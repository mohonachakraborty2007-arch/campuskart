const nextConfig = {
  async rewrites() {
    const api = process.env.API_ORIGIN || "http://localhost:5000";
    return [{ source: "/api/:path*", destination: `${api}/api/:path*` }];
  },
};

export default nextConfig;
