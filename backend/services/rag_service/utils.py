import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from docx import Document
import pdfplumber

def read_uploaded_file(file_path):
    if file_path.endswith('.docx'):
        doc = Document(file_path)
        return "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
    elif file_path.endswith('.pdf'):
        with pdfplumber.open(file_path) as pdf:
            return "\n".join(page.extract_text() or "" for page in pdf.pages)
    else:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
