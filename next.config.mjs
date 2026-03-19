const isStaticExport = process.env.PYP_STATIC_EXPORT === "true";
const enableRepoPath = process.env.PYP_PAGES_ENABLE_REPO_PATH === "true";
const repoPath = process.env.PYP_PAGES_REPO_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep static export opt-in so local development and standard production builds stay unchanged.
  output: isStaticExport ? "export" : undefined,
  // GitHub Pages serves exported routes more reliably when each path resolves to a directory index.
  trailingSlash: true,
  // Enable repo-subpath hosting for default GitHub Pages URLs, but allow a clean switch-off for custom domains later.
  basePath: enableRepoPath ? repoPath : undefined,
  assetPrefix: enableRepoPath ? repoPath : undefined,
  reactStrictMode: true,
};

export default nextConfig;
