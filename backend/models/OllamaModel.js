import mongoose from 'mongoose';

const ollamaSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    response: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    chatId: {
        type: String,
        required: true
    },
    fileData: {
        type: String,
        required: false
    },
    fileName: {
        type: String,
        required: false
    },
    fileType: {
        type: String,
        required: false
    }
}, { timestamps: true });

// Index untuk mempercepat pencarian
ollamaSchema.index({ user: 1, chatId: 1 });
ollamaSchema.index({ username: 1, chatId: 1 });

export default mongoose.model('Ollama', ollamaSchema);
