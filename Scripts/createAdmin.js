// run ONE TIME. I already ran this on 5/2
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const db = require('../database.js');
const User = require('../models/user');

async function createAdmin() {
  await db.connectToMongo();

  const adminUsername = '<usernameemail>';
  const adminPassword = '<password>';

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const adminUser = new User({
    username: adminUsername,
    password: hashedPassword,
    isAdmin: true,
  });

  try {
    const existingUser = await User.findOne({ username: adminUsername });

    if (existingUser) {
      console.log('Admin user already exists.');
      process.exit(1);
    }

    await adminUser.save();
    console.log('Admin user created successfully.');
  } catch (error) {
    console.log('Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

createAdmin();
