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

# async def process_rag_query(prompt, file):
#     # Save file temporarily
#     with tempfile.NamedTemporaryFile(delete=False, suffix=file.filename) as tmp:
#         tmp.write(await file.read())
#         tmp_path = tmp.name

#     try:
#         # Step 1: Read file text
#         file_text = read_uploaded_file(tmp_path)

#         # Step 2: Split into chunks
#         splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
#         chunks = splitter.split_text(file_text)

#         # Step 3: Create vector store
#         embeddings = OllamaEmbeddings(model="nomic-embed-text")
#         vector_store = FAISS.from_texts(chunks, embeddings)

#         # Step 4: RAG QA chain
#         retriever = vector_store.as_retriever()
#         qa = RetrievalQA.from_chain_type(
#             llm=Ollama(model="llama3.1"),
#             retriever=retriever,
#             return_source_documents=False
#         )

#         final_prompt = f"{prompt}"
#         result = qa.run(final_prompt)
#         return result
#     finally:
#         os.remove(tmp_path)

async def process_rag_query(
    chat_history: List[Dict[str, str]],
    prompt: str,
    file: Optional[object] = None
) -> str:
    tmp_path = None
    try:
        # Full prompt combined with chat history
        full_prompt = ""
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