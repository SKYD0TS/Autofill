const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function hashPassword(plainPassword) {
  const saltRounds = 10;  // Salt rounds to make hashing more secure
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
  return hashedPassword;
}

async function seed() {
  const users = [
    {
      username: 'admin',
      password: 'adminpassword123',  // Plain password that will be hashed
      email: 'admin@example.com',
      role: 'admin'
    },
  ];

  for (const user of users) {
    // Hash the password before saving
    const hashedPassword = await hashPassword(user.password);

    // Create the user in the database with the hashed password
    await prisma.user.create({
      data: {
        username: user.username,
        password: hashedPassword,  // Save the hashed password
        email: user.email,
        role: user.role,
      }
    });

    console.log(`User ${user.username} has been created.`);
  }

  // Disconnect the Prisma Client after seeding
  await prisma.$disconnect();
}

// Run the seed function
seed().catch(e => {
  console.error(e);
  process.exit(1);
});
