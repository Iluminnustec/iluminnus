import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://telas.iluminnus.com.br";

export default function sitemap(): MetadataRoute.Sitemap {
  const paginas = ["", "/planos", "/sobre", "/contato"];

  return paginas.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));
}
