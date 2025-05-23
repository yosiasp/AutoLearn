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

        if (req.file) {
            console.log('File received:', req.file.originalname);
            console.log('File type:', req.file.mimetype);
            fileName = req.file.originalname;
            fileType = req.file.mimetype;
            
            if (fileType.startsWith('text/') || 
                fileType === 'application/json' || 
                fileType === 'application/xml' ||
                fileType === 'application/javascript') {
                
                fileData = fs.readFileSync(req.file.path, 'utf8');
                
                prompt = `File: ${fileName}\n\nContent:\n${fileData}\n\nUser question: ${message}`;
            } else if (fileType.startsWith('image/')) {
                fileData = req.file.path;
                prompt = `[Image attached: ${fileName}]\n\nUser question: ${message}`;
            } else if (fileType === 'application/pdf') {
                const dataBuffer = fs.readFileSync(req.file.path);
                const pdfData = await pdf(dataBuffer);
                fileData = pdfData.text;
                prompt = `File: ${fileName}\n\nContent:\n${fileData}\n\nUser question: ${message}`;
            } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const dataBuffer = fs.readFileSync(req.file.path);
                const result = await mammoth.extractRawText({ buffer: dataBuffer });
                fileData = result.value;
                prompt = `File: ${fileName}\n\nContent:\n${fileData}\n\nUser question: ${message}`;
            } else {
                fileData = req.file.path;
                prompt = `[File attached: ${fileName}]\n\nUser question: ${message}`;
            }
        }

        // Chat dengan Ollama
        const response = await ollama.chat({
            model: 'llama3.1', 
            messages: [{ role: 'user', content: prompt }]
        });

        // Format the response with bold text and better styling
        let formattedResponse = response.message.content;
        
        // Add bold formatting to important points
        formattedResponse = formattedResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Add bullet points for lists
        formattedResponse = formattedResponse.replace(/^\s*-\s*(.*)$/gm, '• $1');
        
        // Add line breaks for better readability
        formattedResponse = formattedResponse.replace(/\n/g, '<br>');

        // Simpan ke database
        const ollamaResponse = new Ollama({
            message: message,
            response: formattedResponse,
            user: userId,
            chatId: chatId,
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
        // Token check
        const tokenCheck = jwt.verify(token, KEY);
        
        const { userId } = req.params;

        // Cek user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Ambil history
        const ollamaHistory = await Ollama.find({ user: userId })
            .sort({ createdAt: 1 }); // Urutkan dari yang terlama ke terbaru

        // Format history untuk frontend
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

        // Ambil daftar chat
        const chats = await Ollama.aggregate([
            { $match: { user: mongoose.Types.ObjectId(userId) } },
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

        // Ambil history chat
        const chatHistory = await Ollama.find({ 
            user: userId,
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

