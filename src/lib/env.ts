/**
 * Validation des variables d'environnement au démarrage
 * Échoue tôt si une variable critique manque
 */

const requiredVars = ["DATABASE_URL", "DIRECT_URL"] as const;

const optionalVars = [
  "PISTE_CLIENT_ID",
  "PISTE_CLIENT_SECRET",
] as const;

type RequiredVar = (typeof requiredVars)[number];
type OptionalVar = (typeof optionalVars)[number];

function getRequired(name: RequiredVar): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variable d'environnement manquante : ${name}. Consultez .env.example.`
    );
  }
  return value;
}

function getOptional(name: OptionalVar): string | undefined {
  return process.env[name] || undefined;
}

export const env = {
  DATABASE_URL: getRequired("DATABASE_URL"),
  DIRECT_URL: getRequired("DIRECT_URL"),
  PISTE_CLIENT_ID: getOptional("PISTE_CLIENT_ID"),
  PISTE_CLIENT_SECRET: getOptional("PISTE_CLIENT_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
} as const;
