/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.PYP_STATIC_EXPORT === "true" ? "export" : undefined,
  reactStrictMode: true,
};

export default nextConfig;
