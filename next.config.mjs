/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    emotion: true,
  },
  images: {
    remotePatterns: [
      // Supabaseのストレージからの画像読み込みを許可
      {
        protocol: "https",
        hostname: "icgyvcwxckirglkvlpxu.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      // Supabaseのストレージからの署名付きURL読み込みを許可
      {
        protocol: "https",
        hostname: "icgyvcwxckirglkvlpxu.supabase.co",
        port: "",
        pathname: "/storage/v1/object/sign/**", // "sign" を許可
      },
      // プレースホルダー画像サービスからの画像読み込みを許可
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default nextConfig;
