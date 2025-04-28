import User from "../models/UserModel.js";
import bcrypt from "bcrypt";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    const user = await User.findOne({ email });
    if (user) {
        return res.status(400).json({ message: "User already exists" });
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
  res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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


