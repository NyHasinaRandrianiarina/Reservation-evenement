import { seeders, type SeederKey } from "./index.js";
import prisma from "../db/client.js";

export async function runSeed(key: SeederKey, options?: any) {
  const seedFn = seeders[key];
  if (!seedFn) {
    console.error(`❌ Seed inconnu : ${key}`);
    process.exit(1);
  }

  console.log(`🚀 Lancement du seed : ${key}`);
  const start = Date.now();

  try {
    await seedFn(options);
    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log(`✅ Seed ${key} terminé en ${duration}s`);
  } catch (err) {
    console.error(`❌ Erreur durant le seed ${key} :`, err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

export async function runAllSeeds() {
  console.log("🚀 Lancement de tous les seeds...");
  const start = Date.now();

  for (const key of Object.keys(seeders) as SeederKey[]) {
    try {
      await runSeed(key);
    } catch (err) {
      console.error(`❌ Seed ${key} a échoué, arrêt.`);
      process.exit(1);
    }
  }

  const duration = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`✅ Tous les seeds terminés en ${duration}s`);
}
