import ollama from 'ollama';
import Ollama from '../models/OllamaModel.js';
import User from '../models/UserModel.js';
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { fileURLToPath } from 'url';
import pdf from 'pdf-parse';
import mongoose from 'mongoose';
import axios from 'axios';
import FormData from 'form-data';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KEY = process.env.JWT_KEY;

export const chatWithOllama = async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    try {
        // Token check
        const tokenCheck = jwt.verify(token, KEY);

        const { message, chatId } = req.body;
        const { userId } = req.params;
        let fileData = null;
        let fileName = null;
        let fileType = null;
        let prompt = message;

        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!prompt) {
            return res.status(400).json({ message: "Prompt is required" });
        }

        // Generate new chatId if not provided
        const currentChatId = chatId || `chat_${Date.now()}_${userId}`;

        // Getting chat history by chatId
        const previousChats = await Ollama.find({
            username: user.username,
            chatId: currentChatId
        }).sort({ createdAt: 1 });

        // Chat history formatting
        const chat_history = previousChats.flatMap(chat => {
            const items = [];
            if (chat.message) {
                items.push({ role: "user", content: chat.message });
            }
            if (chat.response) {
                items.push({ role: "ai", content: chat.response });
            }
            return items;
        });

        const form = new FormData();
        form.append('chat_history', JSON.stringify(chat_history));

        // WITHOUT RAG START
    
        // if (req.file) {
        //     console.log('File received:', req.file.originalname);
        //     console.log('File type:', req.file.mimetype);
        //     fileName = req.file.originalname;
        //     fileType = req.file.mimetype;
            
        //     if (fileType.startsWith('text/') || 
        //         fileType === 'application/json' || 
        //         fileType === 'application/xml' ||
        //         fileType === 'application/javascript') {
                
        //         fileData = fs.readFileSync(req.file.path, 'utf8');
                
        //         prompt = `File: ${fileName}\n\nContent:\n${fileData}\n\nUser question: ${message}`;
        //     } else if (fileType.startsWith('image/')) {
        //         fileData = req.file.path;
        //         prompt = `[Image attached: ${fileName}]\n\nUser question: ${message}`;
        //     } else if (fileType === 'application/pdf') {
        //         const dataBuffer = fs.readFileSync(req.file.path);
        //         const pdfData = await pdf(dataBuffer);
        //         fileData = pdfData.text;
        //         prompt = `File: ${fileName}\n\nContent:\n${fileData}\n\nUser question: ${message}`;
        //     } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        //         const dataBuffer = fs.readFileSync(req.file.path);
        //         const result = await mammoth.extractRawText({ buffer: dataBuffer });
        //         fileData = result.value;
        //         prompt = `File: ${fileName}\n\nContent:\n${fileData}\n\nUser question: ${message}`;
        //     } else {
        //         fileData = req.file.path;
        //         prompt = `[File attached: ${fileName}]\n\nUser question: ${message}`;
        //     }
        // }

        // Format the response with bold text and better styling
        // let formattedResponse = response.message.content;

        // WITHOUT RAG END

        // USING RAG START

        form.append('prompt', prompt);
        if (req.file) {
            // Saving file information
            fileName = req.file.originalname;
            fileType = req.file.mimetype;

            form.append('file', fs.createReadStream(req.file.path), req.file.originalname);
        }

        const ragResponse = await axios.post('http://localhost:8001/rag/query', form, {
            headers: form.getHeaders()
        });

        // USING RAG END

        const formattedResponse = ragResponse.data.response
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/^\s*-\s*(.*)$/gm, '• $1')
            .replace(/\n/g, '<br>');
        
        // Simpan ke database
        const ollamaResponse = new Ollama({
            message: message,
            response: formattedResponse,
            user: userId,
            username: user.username,
            chatId: currentChatId,
            fileData: fileData,
            fileName: fileName,
            fileType: fileType
        });
        await ollamaResponse.save();

        // Hapus file temporary jika ada
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (err) {
                console.error('Error deleting temporary file:', err);
            }
        }

        res.status(200).json({
            chatId: currentChatId,
            userMessage: {
                message: message,
                timestamp: new Date(),
                isUser: true,
                status: 'sent',
                file: req.file ? {
                    name: fileName,
                    type: fileType,
                    preview: fileType?.startsWith('image/') ? fileData : null
                } : null
            },
            aiResponse: {
                message: formattedResponse,
                timestamp: new Date(),
                isUser: false,
                status: 'sent'
            }
        });
    } catch (error) {
        console.error('Error in chatWithOllama:', error);
        
        // Hapus file temporary jika ada error
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (err) {
                console.error('Error deleting temporary file:', err);
            }
        }
        
        res.status(500).json({ 
            message: "Internal server error",
            error: error.message 
        });
    }
}; 

export const getOllamaHistory = async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    try {
        const tokenCheck = jwt.verify(token, KEY);
        
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const ollamaHistory = await Ollama.find({ user: userId })
            .sort({ createdAt: 1 });

        const formattedHistory = ollamaHistory.flatMap(chat => [
            {
                message: chat.message,
                timestamp: chat.createdAt,
                isUser: true,
                status: 'sent',
                file: chat.fileName ? {
                    name: chat.fileName,
                    type: chat.fileType,
                    preview: chat.fileType?.startsWith('image/') ? chat.fileData : null
                } : null
            },
            {
                message: chat.response,
                timestamp: chat.createdAt,
                isUser: false,
                status: 'sent'
            }
        ]);

        res.status(200).json(formattedHistory);
    } catch (error) {
        console.error('Error in getOllamaHistory:', error);
        res.status(500).json({ 
            message: "Internal server error",
            error: error.message 
        });
    }
};

export const getChatList = async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    try {
        // Token check
        const tokenCheck = jwt.verify(token, KEY);
        
        const { userId } = req.params;

        // Cek user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Ambil daftar chat berdasarkan username
        const chats = await Ollama.aggregate([
            { $match: { username: user.username } },
            { $sort: { createdAt: -1 } },
            { $group: {
                _id: "$chatId",
                title: { $first: "$message" },
                createdAt: { $first: "$createdAt" },
                lastMessage: { $first: "$message" }
            }},
            { $sort: { createdAt: -1 } }
        ]);

        // Pastikan response selalu berupa array
        res.status(200).json(Array.isArray(chats) ? chats : []);
    } catch (error) {
        console.error('Error in getChatList:', error);
        res.status(500).json({ 
            message: "Internal server error",
            error: error.message 
        });
    }
};

export const getChatHistory = async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    try {
        // Token check
        const tokenCheck = jwt.verify(token, KEY);
        
        const { userId, chatId } = req.params;

        // Cek user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Ambil history chat berdasarkan username dan chatId
        const chatHistory = await Ollama.find({ 
            username: user.username,
            chatId: chatId 
        }).sort({ createdAt: 1 });

        // Format history untuk frontend
        const formattedHistory = chatHistory.flatMap(chat => [
            {
                message: chat.message || '',
                timestamp: chat.createdAt || new Date(),
                isUser: true,
                status: 'sent',
                file: chat.fileName ? {
                    name: chat.fileName,
                    type: chat.fileType,
                    preview: chat.fileType?.startsWith('image/') ? chat.fileData : null
                } : null
            },
            {
                message: chat.response || '',
                timestamp: chat.createdAt || new Date(),
                isUser: false,
                status: 'sent'
            }
        ]);

        res.status(200).json(formattedHistory);
    } catch (error) {
        console.error('Error in getChatHistory:', error);
        res.status(500).json({ 
            message: "Internal server error",
            error: error.message 
        });
    }
};

export const deleteChat = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const { userId, chatId } = req.body;

    if (!userId || !chatId) {
      return res.status(400).json({ message: "Missing userId or chatId in request body" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const deleteResult = await Ollama.deleteMany({ chatId });

    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ message: "Chat not found or already deleted" });
    }

    return res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export const getAllChats = async (req, res) => {
  try {
    const chats = await Ollama.aggregate([
      { $sort: { createdAt: -1 } },
      { $group: {
        _id: "$chatId",
        username: { $first: "$username" },
        lastMessage: { $first: "$message" },
        createdAt: { $first: "$createdAt" }
      }},
      { $sort: { createdAt: -1 } }
    ]);

    res.status(200).json({ 
      message: "Chats fetched successfully",
      chats 
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};
