import { runSeed, runAllSeeds } from "./seeds/seed-runner.js";
import { seeders, type SeederKey } from "./seeds/index.js";

const args = process.argv.slice(2);
const seedName = args[0];
const resetPassword = args.includes("--reset-password");

function printUsage() {
  console.log("Usage:");
  console.log("  npm run seed <seed>          Lance un seed spécifique");
  console.log("  npm run seed all             Lance tous les seeds");
  console.log("");
  console.log("Seeds disponibles:");
  Object.keys(seeders).forEach((k) => console.log(`  - ${k}`));
  console.log("");
  console.log("Options:");
  console.log("  --reset-password            (admin only) Réinitialise le mot de passe admin");
}

async function main() {
  if (!seedName || seedName === "--help" || seedName === "-h") {
    printUsage();
    process.exit(0);
  }

  if (seedName === "all") {
    await runAllSeeds();
    return;
  }

  if (!(seedName in seeders)) {
    console.error(`❌ Seed inconnu : ${seedName}`);
    printUsage();
    process.exit(1);
  }

  const options: any = {};
  if (seedName === "admin" && resetPassword) {
    options.resetPassword = true;
  }

  await runSeed(seedName as SeederKey, options);
}

main().catch((err) => {
  console.error("❌ Erreur inattendue :", err);
  process.exit(1);
});
