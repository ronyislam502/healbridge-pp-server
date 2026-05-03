
import prisma from "./prisma";

async function verify() {
  const specialties = await prisma.specialty.findMany();
  console.log("Total Specialties:", specialties.length);
  specialties.forEach(s => {
    console.log(`- ${s.title}: ${s.icon}`);
  });
  process.exit(0);
}

verify();
