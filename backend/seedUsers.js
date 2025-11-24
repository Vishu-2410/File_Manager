import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const users = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'alice', password: 'alice123', role: 'user' },
  { username: 'bob', password: 'bob123', role: 'user' }
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await User.create({ username: u.username, passwordHash: hash, role: u.role });
  }
  console.log('Seed done');
  process.exit(0);
};

seed();
