/**
 * API Route publique — GET /api/documents
 * Accès programmatique aux métadonnées avec validation, rate limiting et cache
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { searchParamsSchema } from "@/lib/sanitize";
import { checkRateLimit } from "@/lib/rate-limit";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateLimit = checkRateLimit(ip);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Trop de requêtes. Réessayez dans une minute." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // Validation des paramètres
  const rawParams = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = searchParamsSchema.safeParse(rawParams);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Paramètres invalides",
        details: parsed.error.issues.map((issue: { path: (string | number)[]; message: string }) => ({
          champ: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 }
    );
  }

  const { q, categorie, institution, type, sous_categorie, depuis, limit, page } = parsed.data;

  // Construction de la requête Prisma
  const where: Prisma.DocumentWhereInput = {};
  if (q) where.titre = { contains: q, mode: "insensitive" };
  if (categorie) where.categorie = categorie as any;
  if (institution) where.institution = institution as any;
  if (type) where.type = type as any;
  if (sous_categorie) where.sous_categorie = sous_categorie as any;
  if (depuis) where.date_publication = { gte: new Date(depuis) };

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      select: {
        id: true,
        titre: true,
        institution: true,
        type: true,
        categorie: true,
        sous_categorie: true,
        resume: true,
        url: true,
        date_publication: true,
        cree_le: true,
      },
      orderBy: { date_publication: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.document.count({ where }),
  ]);

  return NextResponse.json(
    {
      data: documents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
        "X-RateLimit-Remaining": String(rateLimit.remaining),
      },
    }
  );
}
