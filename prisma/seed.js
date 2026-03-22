const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const availability = [
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
    { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
    { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Wednesday
    { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
    { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }, // Friday
  ];

  for (const item of availability) {
    await prisma.availability.upsert({
      where: { dayOfWeek: item.dayOfWeek },
      update: {},
      create: item,
    });
  }

  console.log('Seeded initial availability');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
