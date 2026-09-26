"""
backend/app/services/document_security.py
Document security, sanitization, validation, checksum, and corruption/encryption detection utilities.
"""

import io
import os
import re
import hashlib
from pathlib import Path
from typing import Tuple, Optional
import pypdf
from PIL import Image

from app.core.config import settings

# Dangerous filename/path traversal patterns
PATH_TRAVERSAL_PATTERN = re.compile(
    r"(\.\./|\.\.\\|/etc/passwd|c:\\windows|/|\\|\x00)", re.IGNORECASE
)

# Magic Bytes Signatures
MAGIC_SIGNATURES = {
    "application/pdf": [b"%PDF-"],
    "image/png": [b"\x89PNG\r\n\x1a\n"],
    "image/jpeg": [b"\xff\xd8\xff"],
    "image/webp": [b"RIFF"] # Checked with WEBP at offset 8
}

EXTENSION_MIME_MAP = {
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp"
}


def is_path_traversal_attempt(filename: str) -> bool:
    """Detects path traversal indicators in original filename."""
    if not filename:
        return True
    if ".." in filename or "/" in filename or "\\" in filename:
        return True
    if filename.startswith("/") or filename.startswith("\\"):
        return True
    if re.search(r"^[a-zA-Z]:", filename): # Windows drive prefix
        return True
    return bool(PATH_TRAVERSAL_PATTERN.search(filename))


def sanitize_filename(filename: str) -> str:
    """
    Sanitizes filename by stripping paths, directory components, and unsafe characters.
    Preserves original extension.
    """
    if not filename:
        return "unnamed_document.bin"
    
    # Strip any directory path components
    basename = Path(filename).name
    basename = os.path.basename(basename)
    
    # Remove path separators or control characters
    cleaned = re.sub(r"[^\w\.\-\_]", "_", basename)
    
    # Ensure not empty
    if not cleaned or cleaned.startswith("."):
        cleaned = f"doc_{cleaned}"
    
    return cleaned


def calculate_sha256(file_bytes: bytes) -> str:
    """Calculates SHA-256 hex digest of file bytes."""
    return hashlib.sha256(file_bytes).hexdigest()


def detect_mime_and_magic(filename: str, file_bytes: bytes) -> Tuple[str, str, bool, Optional[str]]:
    """
    Validates both filename extension and actual MIME/content header magic bytes.
    
    Returns:
        (detected_mime, extension, is_valid_match, error_reason)
    """
    ext = Path(filename).suffix.lower()
    
    # Check extension whitelist
    if ext not in settings.ALLOWED_DOCUMENT_EXTENSIONS:
        return (
            "application/octet-stream",
            ext,
            False,
            f"Unsupported extension: {ext}. Allowed: {settings.ALLOWED_DOCUMENT_EXTENSIONS}"
        )
    
    expected_mime = EXTENSION_MIME_MAP.get(ext)
    
    # Detect magic bytes from content
    actual_mime = None
    if file_bytes.startswith(b"%PDF-"):
        actual_mime = "application/pdf"
    elif file_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
        actual_mime = "image/png"
    elif file_bytes.startswith(b"\xff\xd8\xff"):
        actual_mime = "image/jpeg"
    elif file_bytes.startswith(b"RIFF") and len(file_bytes) >= 12 and file_bytes[8:12] == b"WEBP":
        actual_mime = "image/webp"
    
    if not actual_mime:
        return (
            "application/octet-stream",
            ext,
            False,
            "File header does not match any supported document signature."
        )
    
    # Check dual validation match (extension vs magic bytes)
    if expected_mime != actual_mime:
        return (
            actual_mime,
            ext,
            False,
            f"MIME-extension mismatch. Extension '{ext}' expects '{expected_mime}', but file header is '{actual_mime}'."
        )
    
    return actual_mime, ext, True, None


def validate_document_content(file_bytes: bytes, mime_type: str) -> Tuple[str, Optional[str]]:
    """
    Validates file content integrity and checks for PDF encryption / password protection.
    
    Returns:
        (status, error_detail)
        status can be: "VALIDATED", "ENCRYPTED", "VALIDATION_FAILED"
    """
    if mime_type == "application/pdf":
        try:
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            if reader.is_encrypted:
                return "ENCRYPTED", "PDF document is encrypted or password-protected."
            # Attempt to read page count to ensure structure is valid
            _ = len(reader.pages)
            return "VALIDATED", None
        except Exception as e:
            return "VALIDATION_FAILED", f"Corrupt or invalid PDF file structure: {str(e)}"
    
    elif mime_type in ["image/png", "image/jpeg", "image/webp"]:
        try:
            img = Image.open(io.BytesIO(file_bytes))
            img.verify()
            return "VALIDATED", None
        except Exception as e:
            return "VALIDATION_FAILED", f"Corrupt or invalid image file: {str(e)}"
            
    return "VALIDATED", None
