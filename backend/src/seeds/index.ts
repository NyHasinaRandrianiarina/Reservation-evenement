import { seedAdmin } from "./admin.seed.js";
import { seedEvents } from "./events.seed.js";
import { seedOrganizers } from "./organizer.seed.js";

export const seeders = {
  admin: seedAdmin,
  events: seedEvents,
  organizers: seedOrganizers,
} as const;

export type SeederKey = keyof typeof seeders;
