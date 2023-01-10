import { PrismaClient, Role } from "@prisma/client";
import { links } from "../data/links";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      email: "testemail@gmail.com",
      role: Role.ADMIN,
    },
  });

  await prisma.link.createMany({ data: links });
}

(async () => {
  try {
    await main();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
