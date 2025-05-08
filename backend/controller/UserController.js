import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

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


