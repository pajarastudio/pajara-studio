
import type { MetadataRoute } from "next";

const BASE_URL = "https://pajara-website.pajarastd.workers.dev";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "",
    "/portfolio",
    "/testimonials",
    "/privacy-policy",
    "/terms",
  ];

  return pages.map((page) => ({
    url: `${BASE_URL}${page}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: page === "" ? 1 : 0.7,
  }));
}
