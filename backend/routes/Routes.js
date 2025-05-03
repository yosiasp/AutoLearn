import express from "express";
import { registerUser, loginUser, logoutUser, checkToken, updateUser, deleteUser } from "../controller/UserController.js";
import { chatWithOllama, getOllamaHistory } from "../controller/OllamaController.js";
import upload from "../config/multer.js";

const router = express.Router();

// User Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.put("/update/:userId", updateUser);
router.delete("/delete/:userId", deleteUser);
router.get("/checkToken", checkToken);

// Ollama Routes
router.post("/:userId/ollama/chat", upload.single('file'), chatWithOllama);
router.get("/:userId/ollama/history", getOllamaHistory);

export default router;
