import ollama from 'ollama';
import Ollama from '../models/OllamaModel.js';
import User from '../models/UserModel.js';
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { fileURLToPath } from 'url';
import pdf from 'pdf-parse';


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
            } else if (fileType === 'application/docx') {
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
            response: formattedResponse,
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

