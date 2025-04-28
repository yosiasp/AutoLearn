import ollama from 'ollama';
import Ollama from '../models/OllamaModel.js';
import User from '../models/UserModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const chatWithOllama = async (req, res) => {
    try {
        const { message } = req.body;
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

        // Simpan ke database
        const ollamaResponse = new Ollama({
            message: message,
            response: response.message.content,
            user: userId,
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
            response: response.message.content,
            history: ollamaResponse
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
    try {
        const { userId } = req.params;

        // Cek user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Ambil history
        const ollamaHistory = await Ollama.find({ user: userId })
            .sort({ createdAt: -1 }); // Urutkan dari yang terbaru

        res.status(200).json(ollamaHistory);
    } catch (error) {
        console.error('Error in getOllamaHistory:', error);
        res.status(500).json({ 
            message: "Internal server error",
            error: error.message 
        });
    }
};

