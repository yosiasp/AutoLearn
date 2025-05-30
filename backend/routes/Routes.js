import express from "express";
import { chatWithOllama, getOllamaHistory, getChatList, getChatHistory } from "../controller/OllamaController.js";
import { registerUser, loginUser, logoutUser, checkEmail, checkUsername, checkToken, updateUser, deleteUser, forgotPassword, validateResetToken, resetPassword, updateBasicInfo, updatePassword, updateEmail } from "../controller/UserController.js";
import upload from "../config/multer.js";
const router = express.Router();

// User Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/checkEmail", checkEmail);
router.post("/checkUsername", checkUsername);
router.put('/update/basicInfo', updateBasicInfo);
router.put('/update/password', updatePassword);
router.put('/update/email', updateEmail);
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
