import type { MetadataRoute } from "next";
import { caseStudies } from "@/lib/projects";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, priority: 1 },
    ...caseStudies.map((p) => ({ url: `${SITE_URL}/work/${p.slug}`, priority: 0.8 })),
  ];
}
