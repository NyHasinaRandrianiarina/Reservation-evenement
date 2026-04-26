import type { Express } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import swaggerUi from "swagger-ui-express";

// ── Helpers ────────────────────────────────────

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Les fichiers YAML sont dans backend/docs/, un niveau au-dessus de src/ (ou dist/ après build)
const DOCS_DIR = path.resolve(__dirname, "../docs");

/**
 * Reads and parses all `.yaml` files in a directory.
 * Returns a single merged object (keys from each file are merged at the top level).
 */
function loadYamlDir(dirPath: string): Record<string, unknown> {
  const absoluteDir = path.resolve(__dirname, dirPath);

  if (!fs.existsSync(absoluteDir)) return {};

  const merged: Record<string, unknown> = {};

  for (const file of fs.readdirSync(absoluteDir)) {
    if (!file.endsWith(".yaml") && !file.endsWith(".yml")) continue;

    const content = fs.readFileSync(path.join(absoluteDir, file), "utf-8");
    const parsed = parseYaml(content) as Record<string, unknown> | null;

    if (parsed) {
      Object.assign(merged, parsed);
    }
  }

  return merged;
}

// ── Build OpenAPI spec ─────────────────────────

function buildSwaggerSpec(): object {
  const paths = loadYamlDir(path.join(DOCS_DIR, "paths"));

  // Load each component category individually
  const securitySchemesFile = path.join(DOCS_DIR, "components/security-schemes.yaml");
  const schemasFile = path.join(DOCS_DIR, "components/schemas.yaml");
  const responsesFile = path.join(DOCS_DIR, "components/responses.yaml");
  const parametersFile = path.join(DOCS_DIR, "components/parameters.yaml");

  const readYaml = (filePath: string): Record<string, unknown> => {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, "utf-8");
    return (parseYaml(content) as Record<string, unknown>) ?? {};
  };

  const spec = {
    openapi: "3.0.3",
    info: {
      title: "HandyHub — Local Marketplace API",
      version: "1.0.0",
      description:
        "API for HandyHub, a local marketplace connecting buyers and sellers in Antsiranana.",
      contact: {
        name: "Yonni",
        url: "https://github.com/Yonni-coder/Local-Marketplace",
      },
    },
    servers: [
      {
        url: "/api/v1",
        description: "API v1",
      },
    ],
    tags: [
      {
        name: "Auth",
        description: "Registration, login, logout, and token management.",
      },
      {
        name: "Auth – 2FA",
        description: "Two-factor authentication setup and management.",
      },
    ],
    paths,
    components: {
      securitySchemes: readYaml(securitySchemesFile),
      schemas: readYaml(schemasFile),
      responses: readYaml(responsesFile),
      parameters: readYaml(parametersFile),
    },
  };

  return spec;
}

export const swaggerSpec = buildSwaggerSpec();

// ── Mount on Express ───────────────────────────

export function setupSwagger(app: Express): void {
  app.use(
    "/api/v1/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec as object, {
      explorer: true,
      customSiteTitle: "HandyHub API Docs",
      customCss: `
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info .title { font-size: 2em; }
      `,
    })
  );

  app.get("/api/v1/docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
}
