import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form
import uvicorn
from rag import process_rag_query

app = FastAPI()

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/rag/query")
async def rag_query(
    prompt: str = Form(...),
    file: Optional[UploadFile] = File(None)
):
    response = await process_rag_query(prompt, file)
    return {"response": response}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)