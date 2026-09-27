/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // @xenova/transformers ships native ONNX deps that must not be bundled
    // for server components / route handlers. Keep them external so the model
    // runs on the Node runtime. (Top-level `serverExternalPackages` in Next 15.)
    serverComponentsExternalPackages: ["@xenova/transformers"],
    // Allow longer job descriptions / resumes through Server Actions.
    serverActions: { bodySizeLimit: "2mb" },
  },
};

export default nextConfig;
