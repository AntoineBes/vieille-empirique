import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://veille.empirisme-citoyen.fr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
