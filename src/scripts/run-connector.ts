/**
 * Point d'entrée pour GitHub Actions
 * Usage : tsx src/scripts/run-connector.ts insee
 *         tsx src/scripts/run-connector.ts legifrance
 *         tsx src/scripts/run-connector.ts all
 */

import { prisma } from "@/lib/prisma";
import {
  InseeConnector,
  LegifranceConnector,
  BanqueDeFranceConnector,
  DatagouvConnector,
  OcdeConnector,
} from "@/connectors";
import type { BaseConnector } from "@/connectors/base";

const CONNECTORS: Record<string, () => BaseConnector> = {
  insee: () => new InseeConnector(),
  legifrance: () => new LegifranceConnector(),
  "banque-de-france": () => new BanqueDeFranceConnector(),
  datagouv: () => new DatagouvConnector(),
  ocde: () => new OcdeConnector(),
};

async function main() {
  const target = process.argv[2] ?? "all";
  const connectorKeys = target === "all" ? Object.keys(CONNECTORS) : [target];

  const unknown = connectorKeys.filter((k) => !CONNECTORS[k]);
  if (unknown.length) {
    console.error(`Connecteur(s) inconnu(s) : ${unknown.join(", ")}`);
    console.error(`Disponibles : ${Object.keys(CONNECTORS).join(", ")}, all`);
    process.exit(1);
  }

  const results = await Promise.allSettled(
    connectorKeys.map(async (key) => {
      const connector = CONNECTORS[key]();
      console.log(`[${key}] Démarrage...`);
      const result = await connector.run({ maxDocuments: 200 });
      console.log(
        `[${key}] ✓ ${result.documents_inseres} insérés, ${result.documents_mis_a_jour} mis à jour sur ${result.documents_trouves} trouvés (${result.duree_ms}ms)`
      );
      return result;
    })
  );

  let hasError = false;
  for (const r of results) {
    if (r.status === "rejected") {
      console.error("Erreur inattendue :", r.reason);
      hasError = true;
    }
  }

  await prisma.$disconnect();
  process.exit(hasError ? 1 : 0);
}

main();
