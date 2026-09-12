import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const fullName = process.argv[4] || 'Admin User';

  if (!email || !password) {
    console.error('Usage: ts-node create-admin.ts <email> <password> [fullName]');
    process.exit(1);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  if (existingUser) {
    // If user exists, promote them to ADMIN
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });
    console.log(`User ${email} already exists. Promoted to ADMIN.`);
  } else {
    // Create new admin
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role: 'ADMIN',
      },
    });
    console.log(`Successfully created new ADMIN user: ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

