"""
backend/app/ai_engine/ocr_extractor.py
OCR and Text Extraction pipeline.
Extracts raw text from uploaded PDFs, text files, and images.
"""

from pathlib import Path
from typing import Optional

def extract_text_from_file(file_path: Path, filename: str = "") -> str:
    """
    Extracts text from file. Uses direct text reading for text/pdf mocks or
    deterministic template fallback for mock demo documents.
    """
    if not file_path.exists():
        return ""

    # Check if text file
    suffix = file_path.suffix.lower()
    if suffix in [".txt", ".json", ".md", ".csv"]:
        try:
            return file_path.read_text(encoding="utf-8")
        except Exception:
            return file_path.read_text(encoding="latin-1")

    # For binary/PDF or demo mocks, try reading UTF-8 strings or return generated OCR representation
    try:
        content = file_path.read_bytes()
        # Extract ASCII strings from binary
        ascii_chars = []
        for b in content:
            if 32 <= b <= 126 or b in [10, 13, 9]:
                ascii_chars.append(chr(b))
            else:
                ascii_chars.append(" ")
        extracted_str = "".join(ascii_chars)
        if len(extracted_str.strip()) > 50:
            return extracted_str[:5000]
    except Exception:
        pass

    return f"Simulated OCR document extract for {filename or file_path.name}"
