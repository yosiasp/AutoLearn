import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

dotenv.config();

export const registerUser = async (req, res) => {
  try {
    const { name, username, email, password, confirmPassword } = req.body;

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    if (/\s/.test(password)) {
      return res.status(400).json({ message: "Password must not contain spaces" });
    }

    const upperCase = /[A-Z]/;
    const lowerCase = /[a-z]/;

    if (!upperCase.test(password)) {
      return res.status(400).json({ message: "Password must contain at least one uppercase letter" });
    }
    if (!lowerCase.test(password)) {
      return res.status(400).json({ message: "Password must contain at least one lowercase letter" });
    }

    const userWithEmail = await User.findOne({ email });
    if (userWithEmail) {
        return res.status(400).json({ message: "Email already used" });
    }
    const userWithUsername = await User.findOne({ username });
    if (userWithUsername) {
        return res.status(400).json({ message: "Username already used" });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkUsername = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ available: false, message: 'Username is required' });

    const existingUser = await User.findOne({ username }); 

    return res.status(200).json({
      available: !existingUser,
      message: existingUser ? 'Username already taken' : 'Username is available',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ available: false, message: 'Server error' });
  }
};

export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ available: false, message: 'Email is required' });
    }

    const existingUser = await User.findOne({ email });

    return res.status(200).json({
      available: !existingUser,
      message: existingUser ? 'Email already taken' : 'Email is available',
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ available: false, message: 'Server error' });
  }
};

const KEY = process.env.JWT_KEY;

export const loginUser = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Check if input is an email 
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrUsername);

    // Find user by email or username
    const user = await User.findOne(
      isEmail ? { email: emailOrUsername } : { username: emailOrUsername }
    );

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const token = jwt.sign({ id: user._id, email: user.email }, KEY, { expiresIn: '1d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false, 
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 day to expire
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

export const updateBasicInfo = async (req, res) => {
  try {
    const { id, name, username } = req.body;

    if (!id || !name || !username) {
      return res.status(400).json({ message: 'Credentials is not complete' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, username },
      { new: true } 
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'Basic info updated successfully',
      user: updatedUser
    });
  } catch (error) {
    return res.status(500).json({ message: 'An error occured while updating data' });
  }
};

export const updateEmail = async (req, res) => {
  try {
    const { id, email } = req.body;

    if (!id || !email) {
      return res.status(400).json({ message: 'Credentials are not complete' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { email },
      { new: true } 
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = updatedUser;

    // Generate new token
    const token = jwt.sign({ id: user._id, email: user.email }, KEY, { expiresIn: '1d' });

    // Set new cookie
    await res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    return res.status(200).json({
      message: 'Email updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update email error:', error);
    return res.status(500).json({ message: 'An error occurred while updating email' });
  }
};

export const updatePassword = async (req, res) => {
  const { id, currentPassword, newPassword, confirmPassword } = req.body;
  if (!id || !currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'New password and confirmation do not match' });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

    const password = await bcrypt.hash(newPassword, 10);

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { password },
      { new: true } 
    );
    
    return res.status(200).json({
      message: 'Password updated successfully',
      user: updatedUser
    });

  } catch (err) {
    return res.status(500).json({ message: 'An error occured while updating data' });
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

export const deleteUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      message: "User deleted successfully",
      userId 
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: "Internal server error" });
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

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.status(200).json({ 
      message: "Users fetched successfully",
      users 
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};


