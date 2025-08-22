import { query } from './app/lib/db';
const bcrypt = require('bcrypt');

async function hashPassword(plainPassword) {
  const saltRounds = 10;  // Salt rounds to make hashing more secure
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
  return hashedPassword;
}

async function seed() {
  const users = [
    {
      username: 'admin',
      password: 'adminpassword123',
      email: 'admin@example.com',
      role: 'admin'
    },
  ];

  for (const user of users) {
    const hashedPassword = await hashPassword(user.password);

    await query(
      `INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)`,
      [user.username, hashedPassword, user.email, user.role]
    );

    console.log(`User ${user.username} has been created.`);
  }
}

// Run the seed function
seed().catch(e => {
  console.error(e);
  process.exit(1);
});
