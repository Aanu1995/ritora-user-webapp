import type { MetadataRoute } from "next";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/lib/site";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const t = await getTranslations("site");

  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: t("description"),
    start_url: "/",
    display: "standalone",
    background_color: "#f7f5f0",
    theme_color: "#1f5f3d",
    icons: [
      {
        src: "/brand/ritora-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/ritora-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/brand/ritora-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
