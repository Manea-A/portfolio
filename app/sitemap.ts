import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // single-page portfolio — every case study lives on the home page
  return [{ url: SITE_URL, priority: 1 }];
}
