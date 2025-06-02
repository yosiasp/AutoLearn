import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Admin from '../models/AdminModel.js';
import dotenv from 'dotenv';

dotenv.config();

async function createFirstAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGOURL);
    console.log('Connected to MongoDB');

    // Check if any admin exists
    const adminExists = await Admin.findOne({ role: 'super_admin' });
    if (adminExists) {
      console.log('Super admin already exists');
      process.exit(0);
    }

    // Create super admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new Admin({
      username: 'superadmin',
      email: 'superadmin@example.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'super_admin'
    });
    await admin.save();
    console.log('Super admin created successfully');
  } catch (error) {
    console.error('Error creating super admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createFirstAdmin(); 