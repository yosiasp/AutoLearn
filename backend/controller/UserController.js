import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

dotenv.config();

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    const user = await User.findOne({ email });
    if (user) {
        return res.status(400).json({ message: "Email already used" });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const KEY = process.env.JWT_KEY;

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const token = jwt.sign({ email }, KEY, { expiresIn: '1d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false, 
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkToken = async (req, res) => {
  const token = req.cookies.token;
  const { email: storageEmail } = req.body.user;

  if (!token) return res.status(401).json({ error: 'Not authenticated' });

  try {
    const decodedToken = jwt.verify(token, KEY);
    const cookieEmail = decodedToken.email;

    if (cookieEmail !== storageEmail) {
      await res.clearCookie('token');
      return res.status(403).json({ error: 'Email mismatch — invalid token' });
    }

    res.status(200).json({ message: 'Authenticated', email: storageEmail });
  } catch (err) {
    await res.clearCookie('token');
    res.status(403).json({ error: 'Invalid token' });
  }
}

export const logoutUser = async (req, res) => {
  try{
    await res.clearCookie('token');
    res.status(200).json({ message: 'Logged out' });
  } catch (err) {
    res.status(403).json({ error: 'Log out error' });
  }
}

export const updateUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    const { userId } = req.params;
    if (password && password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.name = name || user.name;
    user.email = email || user.email;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }
    await user.save();
    res.status(200).json({ message: "User updated successfully"});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Saving reset password information
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expire time
    await user.save();

    const resetURL = `http://localhost:3000/reset-password?token=${token}`;

    // Nodemailer configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.ACCOUNT_EMAIL,      
        pass: process.env.ACCOUNT_PASSWORD,   
      },
    });

    // Sending the email
    const mailOptions = {
      from: 'Autolearn <${process.env.ACCOUNT_EMAIL}>',
      to: email,
      subject: 'Reset your Autolearn password',
      text: `You are receiving this email because you have requested a password reset. Click on this link to reset your password:\n\n${resetURL}\n\nThis link will expire in 1 hour.\nIf you didn't request a password reset, you can ignore this email. Your password will not be changed\n\nSincerly,\n\nAutolearn Team`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error('Error in forgotPassword:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const validateResetToken = async (req, res) => {
  try {
    const { token } = req.body; 

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, 
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    res.status(200).json({ message: 'Token is valid' });
  } catch (err) {
    console.error('Token validation error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body;
    if (password && password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Find user by token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Updating the password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    // Resetting the token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    
    res.status(200).json({ message: "Password reset succesfull"});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


