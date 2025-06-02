import Admin from "../models/AdminModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

const KEY = process.env.JWT_KEY;
// Middleware untuk verifikasi token admin
export const verifyAdminToken = async (req, res, next) => {
  const token = req.cookies.adminToken;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, KEY);
    const admin = await Admin.findById(decoded.adminId);
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    req.admin = admin;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Find admin by username (case insensitive)
    const admin = await Admin.findOne({ 
      username: username.toLowerCase(),
      role: { $in: ['admin', 'super_admin'] }
    });

    if (!admin) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    const token = jwt.sign({ adminId: admin._id }, KEY, { expiresIn: '1h' });
    
    // Set cookie
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600000, // 1 hour
      path: '/'
    });

    // Send response with admin data
    res.status(200).json({
      message: "Login successful",
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: admin.role
      }
    });
  
  } catch (error) {
    console.error('Login error details:', error);
    res.status(500).json({ 
      message: "An error occurred during login. Please try again."
    });
  }
};

export const logoutAdmin = async (req, res) => {
  try {
    await res.clearCookie('adminToken');
    res.status(200).json({ message: 'Logged out' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create new admin (protected route, only super_admin can create new admins)
export const createAdmin = async (req, res) => {
  try {
    if (req.admin.role !== 'super_admin') {
      return res.status(403).json({ message: "Only super admin can create new admins" });
    }

    const { username, email, password, name, role } = req.body;

    // Validate required fields
    if (!username || !email || !password || !name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() }
      ]
    });

    if (existingAdmin) {
      return res.status(400).json({ message: "Username or email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = new Admin({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: role || 'admin'
    });

    await newAdmin.save();

    res.status(201).json({ 
      message: "Admin created successfully",
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all admins (protected route)
export const getAllAdmins = async (req, res) => {
  try {
    const token = jwt.sign({ adminId: req.admin._id }, KEY, { expiresIn: '1h' });
    const admins = await Admin.find({}, '-password');
    res.status(200).json({
      message: "Admins fetched successfully",
      admins,
      token
    });
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAdminToken = async (req, res) => {
  try {
    const token = req.cookies.adminToken;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      const decoded = jwt.verify(token, KEY);

      const admin = await Admin.findById(decoded.adminId);
      
      if (!admin || !admin.isActive) {
        return res.status(401).json({ message: "Invalid or inactive admin account" });
      }

      res.status(200).json({ 
        message: "Token valid", 
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          name: admin.name,
          role: admin.role
        }
      });
    } catch (jwtError) {
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Invalid token" });
      }
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Token expired" });
      }
      throw jwtError;
    }
  } catch (error) {
    console.error('Token check error:', error);
    res.status(500).json({ message: "Error checking token" });
  }
};

export const loginSuperAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Find super admin by username
    const superAdmin = await Admin.findOne({ username, role: 'super_admin' });

    if (!superAdmin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, superAdmin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Update last login
    superAdmin.lastLogin = new Date();
    await superAdmin.save();

    const token = jwt.sign({ adminId: superAdmin._id }, KEY, { expiresIn: '1h' });
    
    // Set cookie
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600000, // 1 hour
      path: '/'
    });

    // Send response with admin data
    res.status(200).json({
      message: "Login successful",
      admin: {
        id: superAdmin._id,
        username: superAdmin.username,
        email: superAdmin.email,
        name: superAdmin.name,
        role: superAdmin.role
      }
    });
  
  } catch (error) {
    console.error('Super admin login error:', error);
    res.status(500).json({ 
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};





