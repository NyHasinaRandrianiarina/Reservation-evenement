import { seedAdmin } from "./admin.seed.js";
import { seedEvents } from "./events.seed.js";

export const seeders = {
  admin: seedAdmin,
  events: seedEvents,
} as const;

export type SeederKey = keyof typeof seeders;
