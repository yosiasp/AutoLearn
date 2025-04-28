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

export default mongoose.model('Ollama', ollamaSchema);
