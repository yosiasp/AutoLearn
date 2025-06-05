import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.llms import Ollama
from langchain.chains import RetrievalQA
from utils import read_uploaded_file
from typing import List, Dict, Optional

import tempfile
import os

# Configuration for AI model
SYSTEM_MESSAGE = """
Kamu adalah AI yang membantu membuat soal latihan untuk pelajar berdasarkan materi yang diberikan pengguna.

Sesuaikan responmu tergantung dengan input pengguna:

1. Jika pengguna memberikan **materi pelajaran** (dalam bentuk teks atau dokumen):
   - Soal pilihan ganda harus memiliki 1 jawaban benar dari 4 pilihan (a, b, c, d) yang masuk akal.
   - Soal yang dihasilkan hanya soal pilihan ganda
   - Jika input berbahasa Indonesia, jawaban juga harus dalam Bahasa Indonesia.
   - Jika input berbahasa Inggris, jawaban juga harus dalam Bahasa Inggris.
   - Hanya gunakan dua bahasa tersebut saja

2. Jika pengguna memberikan **soal yang sudah ada**:
   - Hasilkan soal tanpa mengubah konteks, tipe soal, dan kunci jawaban.
   - Untuk soal pilihan ganda, hasilkan soal pilihan ganda lain yang tetap berkaitan
   - Bila ada soal esai, hasilkan soal pilihan ganda dari esainya

3. Jika pengguna hanya menulis pesan biasa (bukan materi atau soal):
   - Jawab secara **singkat, padat, dan langsung ke inti**.

Kamu harus menyesuaikan gaya soal dengan konteks, bahasa, dan relevansi permintaan pengguna.

Jawaban kamu harus:
- Selalu sesuaikan **bahasa balasan dengan bahasa input pengguna**.
- Jawaban harus **rapi dan terstruktur**, fokus pada yang diminta tanpa penjelasan tambahan kecuali diminta
- **Tidak memberi penjelasan tambahan** jika tidak diminta

Contoh struktur soal:
Soal: 1
Pertanyaan
a. ...
b. ...
c. ...
d. ...
<=jawaban:b=>

Soal: 2
Pertanyaan
a. ...
b. ...
c. ...
d. ...
<=jawaban:a=>

dan seterusnya

Jika tidak ada konteks soal atau materi, cukup respon dengan: "Ada yang bisa saya bantu?" (Indonesia) atau "How can i help you" (Inggris)
"""

async def process_rag_query(
    chat_history: List[Dict[str, str]],
    prompt: str,
    file: Optional[object] = None
) -> str:
    tmp_path = None
    try:
        # Full prompt combined with system message and chat history
        full_prompt = SYSTEM_MESSAGE.strip() + "\n\n"
        for msg in chat_history:
            role = "User" if msg["role"] == "user" else "AI"
            full_prompt += f"{role}: {msg['content']}\n"
        full_prompt += f"User: {prompt}\nai:"

        if file:
            with tempfile.NamedTemporaryFile(delete=False, suffix=file.filename) as tmp:
                tmp.write(await file.read())
                tmp_path = tmp.name

            file_text = read_uploaded_file(tmp_path)

            splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
            chunks = splitter.split_text(file_text)

            embeddings = OllamaEmbeddings(model="nomic-embed-text")
            vector_store = FAISS.from_texts(chunks, embeddings)

            retriever = vector_store.as_retriever()

            qa = RetrievalQA.from_chain_type(
                llm=Ollama(model="llama3.1"),
                retriever=retriever,
                return_source_documents=False
            )
            result = qa.run(full_prompt)
        else:
            llm = Ollama(model="llama3.1")
            result = llm(full_prompt)

        return result
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)