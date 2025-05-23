import express from "express";
import { chatWithOllama, getOllamaHistory, getChatList, getChatHistory } from "../controller/OllamaController.js";
import { registerUser, loginUser, logoutUser, checkToken, updateUser, deleteUser, forgotPassword, validateResetToken, resetPassword, updateBasicInfo, updatePassword } from "../controller/UserController.js";
import upload from "../config/multer.js";
const router = express.Router();

// User Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.put('/update/basicInfo', updateBasicInfo);
router.put('/update/currentPassword', updatePassword)
router.put("/update/:userId", updateUser);
router.delete("/delete/:userId", deleteUser);
router.post("/checkToken", checkToken);
router.post('/forgotPassword', forgotPassword); 
router.post('/checkResetToken', validateResetToken);
router.post('/resetPassword', resetPassword);

// Ollama Routes
router.post("/:userId/ollama/chat", upload.single('file'), chatWithOllama);
router.get("/:userId/ollama/chats", getChatList);
router.get("/:userId/ollama/history/:chatId", getChatHistory);

export default router;
