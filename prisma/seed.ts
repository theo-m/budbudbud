import { faker } from "@faker-js/faker";
import slugify from "slugify";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

const env = (k: string) => {
  const v = process.env[k];
  if (!v) throw new Error(`[${k}] is not set`);
  return v;
};

async function users() {
  const me = await prisma.user.upsert({
    create: {
      email: env("DEV_SEED_EMAIL"),
      emailVerified: new Date(),
      name: "Théo",
    },
    update: {
      email: env("DEV_SEED_EMAIL"),
      emailVerified: new Date(),
      name: "Théo",
    },
    where: { email: env("DEV_SEED_EMAIL") },
  });
  await prisma.user.createMany({
    data: Array(10)
      .fill(0)
      .map(() => {
        const name = faker.name.findName();
        return {
          email: env("DEV_SEED_EMAIL_AUX").replace(
            "?",
            slugify(name, { lower: true })
          ),
          name,
          emailVerified: new Date(),
        };
      }),
  });

  const friends = await prisma.user.findMany({
    where: { email: { not: { equals: env("DEV_SEED_EMAIL") } } },
  });

  Array(5)
    .fill(0)
    .map(async () => {
      const group = await prisma.group.create({
        data: { name: faker.company.companyName() },
      });
      await prisma.userGroup.createMany({
        data: [
          { groupId: group.id, userId: me.id, name: "Richard", admin: true },
          ...friends
            .filter(() => Math.random() > 0.2)
            .map((f) => ({
              groupId: group.id,
              userId: f.id,
              name: faker.name.findName(),
              admin: Math.random() > 0.6,
            })),
        ],
      });
    });
}

users();
