import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://veille.empirisme-citoyen.fr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const documents = await prisma.document.findMany({
    select: { id: true, mis_a_jour_le: true },
    orderBy: { date_publication: "desc" },
    take: 5000,
  });

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/documents`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/statistiques`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/documentation`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/mentions-legales`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/politique-confidentialite`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const documentPages: MetadataRoute.Sitemap = documents.map((doc) => ({
    url: `${BASE_URL}/documents/${doc.id}`,
    lastModified: doc.mis_a_jour_le,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...documentPages];
}
