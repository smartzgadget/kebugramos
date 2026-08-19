/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@kebugram/tokens', '@kebugram/design-system'],
  // Module Federation disabled for App Router — runtime manifest only (host loads remotes via fetch('/mfe-manifest.json'))
  // NextFederationPlugin with App Directory throws: "App Directory is not supported by nextjs-mf. Use only pages directory"
};

module.exports = nextConfig;
