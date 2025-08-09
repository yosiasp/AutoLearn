[![ForTheBadge uses-html](http://ForTheBadge.com/images/badges/uses-html.svg)](http://ForTheBadge.com)  
[![ForTheBadge uses-css](http://ForTheBadge.com/images/badges/uses-css.svg)](http://ForTheBadge.com)  
[![ForTheBadge uses-js](http://ForTheBadge.com/images/badges/uses-js.svg)](http://ForTheBadge.com)  
[![ForTheBadge uses-python](http://ForTheBadge.com/images/badges/uses-python.svg)](http://ForTheBadge.com)  
[![ForTheBadge built-with-love](http://ForTheBadge.com/images/badges/built-with-love.svg)](http://ForTheBadge.com)  

---

## Description:  
Autolearn is an AI-powered learning assistant platform that allows users to learn by uploading study materials, and receiving intelligent responses based on document content. The platform is built with **React** for the frontend, **Node.js** for the backend, and **Python** with FAISS (Facebook AI Similarity Search) for the RAG (Retrieval-Augmented Generation) service powered by **Ollama** by the local **LLaMA 3.1 model** as the main model for AI processing.  

The application consists of the following parts:  
- **Frontend** – React-based user interface.  
- **Backend** – Node.js server for API and authentication.  
- **RAG Service** – Python service for AI document retrieval and processing.  

---

## Features:  

- 💬 AI chatbot that can answer questions and process uploaded `.docx`, `.pdf`, and `.txt` files.  
- ☁️ Local LLaMA model processing via Ollama.  
- 🔍 RAG (Retrieval-Augmented Generation) for better context-based answers.  
- 👤 Account management: edit profile, change account information, change password, delete account.  
- 🔑 Authentication: login with email/password or Google account.   

---

## How to Run:  

### **Without Git**  
1. Click the "<> Code" button at the top right of the repository.  
2. Click **"Download ZIP"**.  
3. Extract the ZIP file.  
4. Follow the **Local Installation** steps below.  

---

### **With Git**  
```bash
git clone https://github.com/example/autolearn.git
```

---

### **Local Installation Steps:**  

**Step 0 – Install Prerequisites**  
- [NPM (Node.js)](https://nodejs.org/en)  
- [Python 3.11](https://www.python.org/downloads/release/python-3110/)  
- [Ollama](https://ollama.com/download)  

**Install Ollama models:**  
```bash
ollama pull llama3.1
ollama pull nomic-embed-text
```

---

**Step 1 – Root Setup:**  
```bash
npm install
```

**Step 2 – Backend Setup:**  
```bash
cd backend
npm install
```

**Step 3 – Frontend Setup:**  
```bash
cd frontend
npm install
```

**Step 4 – RAG Service Setup (Python):**  
```bash
cd backend/services/rag_service
venv\Scripts\activate
pip install -r requirements.txt
```

*(If “Path too long” error occurs on Windows, enable `LongPathsEnabled` in the registry editor and restart the hardware.)*  

---

**Step 5 – Run the App:**  
From the project root:  
```bash
npm run dev
```
Ensure Ollama is running:  
```bash
ollama serve
```
