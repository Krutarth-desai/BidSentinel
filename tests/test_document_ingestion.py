"""
tests/test_document_ingestion.py
Comprehensive unit & integration tests for Phase 1: Secure Bid-Aware Document Ingestion.
"""

import io
import sys
from pathlib import Path
import pytest

# Ensure backend is in sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

import pypdf
from PIL import Image
from fastapi.testclient import TestClient

from app.main import app
from app.db.session import SessionLocal, Base, engine
from app.db.models import BidSubmission, Tender, Bidder, SubmittedDocument, AuditLog
from app.core.config import settings
from app.services.document_security import calculate_sha256, sanitize_filename

client = TestClient(app)

# Helper function to get valid auth headers
def get_auth_headers():
    response = client.post("/api/v1/auth/login", json={
        "username": settings.DEMO_OFFICER_EMAIL,
        "password": settings.DEMO_OFFICER_PASSWORD
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# Helper generators for valid sample files with optional unique metadata
def create_valid_pdf_bytes(extra: str = "") -> bytes:
    """Generates a minimal valid unencrypted PDF in memory using pypdf."""
    writer = pypdf.PdfWriter()
    page = writer.add_blank_page(width=100, height=100)
    if extra:
        writer.add_metadata({"/CustomKey": extra})
    out_buf = io.BytesIO()
    writer.write(out_buf)
    return out_buf.getvalue()


def create_encrypted_pdf_bytes() -> bytes:
    """Generates an encrypted PDF in memory using pypdf."""
    writer = pypdf.PdfWriter()
    writer.add_blank_page(width=100, height=100)
    writer.encrypt("userpassword", "ownerpassword")
    out_buf = io.BytesIO()
    writer.write(out_buf)
    return out_buf.getvalue()


def create_valid_png_bytes(color: str = "red") -> bytes:
    """Generates a valid minimal PNG image in memory."""
    img = Image.new("RGB", (10, 10), color=color)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def create_valid_jpg_bytes(color: str = "blue") -> bytes:
    """Generates a valid minimal JPEG image in memory."""
    img = Image.new("RGB", (10, 10), color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def create_valid_webp_bytes(color: str = "green") -> bytes:
    """Generates a valid minimal WEBP image in memory."""
    img = Image.new("RGB", (10, 10), color=color)
    buf = io.BytesIO()
    img.save(buf, format="WEBP")
    return buf.getvalue()


@pytest.fixture(autouse=True)
def setup_db():
    """Ensures clean test database tables and demo submissions exist for each test."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear submitted documents table between tests to avoid SHA-256 conflict between test cases
    db.query(SubmittedDocument).delete()
    db.commit()

    # Ensure tender and bidders exist
    tender = db.query(Tender).filter(Tender.tender_id == "TND001").first()
    if not tender:
        tender = Tender(tender_id="TND001", title="Test Tender", department="Test Dept")
        db.add(tender)

    bidder1 = db.query(Bidder).filter(Bidder.bidder_id == "BID001").first()
    if not bidder1:
        bidder1 = Bidder(bidder_id="BID001", company_name="Test Company 1", pan="ABCDE1234F", gstin="27ABCDE1234F1Z5")
        db.add(bidder1)

    bidder2 = db.query(Bidder).filter(Bidder.bidder_id == "BID002").first()
    if not bidder2:
        bidder2 = Bidder(bidder_id="BID002", company_name="Test Company 2", pan="XYZDE1234F", gstin="27XYZDE1234F1Z5")
        db.add(bidder2)

    sub = db.query(BidSubmission).filter(BidSubmission.submission_id == "SUB001").first()
    if not sub:
        sub = BidSubmission(submission_id="SUB001", tender_id="TND001", bidder_id="BID001", status="SUBMITTED")
        db.add(sub)
    else:
        sub.tender_id = "TND001"
        sub.bidder_id = "BID001"

    sub2 = db.query(BidSubmission).filter(BidSubmission.submission_id == "SUB002").first()
    if not sub2:
        sub2 = BidSubmission(submission_id="SUB002", tender_id="TND001", bidder_id="BID002", status="SUBMITTED")
        db.add(sub2)
    else:
        sub2.tender_id = "TND001"
        sub2.bidder_id = "BID002"

    db.commit()
    db.close()


def test_valid_pdf_upload():
    headers = get_auth_headers()
    pdf_bytes = create_valid_pdf_bytes()
    expected_hash = calculate_sha256(pdf_bytes)

    response = client.post(
        "/api/v1/submissions/SUB001/documents",
        headers=headers,
        files={"file": ("tender_compliance.pdf", pdf_bytes, "application/pdf")},
        data={"document_type": "STATUTORY_DECLARATION"}
    )

    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["submission_id"] == "SUB001"
    assert data["bidder_id"] == "BID001"
    assert data["tender_id"] == "TND001"
    assert data["status"] == "VALIDATED"
    assert data["checksum_sha256"] == expected_hash
    assert data["filename"] == "tender_compliance.pdf"


def test_valid_png_upload():
    headers = get_auth_headers()
    png_bytes = create_valid_png_bytes()

    response = client.post(
        "/api/v1/submissions/SUB001/documents",
        headers=headers,
        files={"file": ("gst_cert.png", png_bytes, "image/png")},
        data={"document_type": "GST_CERTIFICATE"}
    )

    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "VALIDATED"


def test_valid_jpg_upload():
    headers = get_auth_headers()
    jpg_bytes = create_valid_jpg_bytes()

    response = client.post(
        "/api/v1/submissions/SUB001/documents",
        headers=headers,
        files={"file": ("pan_card.jpg", jpg_bytes, "image/jpeg")},
        data={"document_type": "PAN_CARD"}
    )

    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "VALIDATED"


def test_valid_jpeg_upload():
    headers = get_auth_headers()
    jpeg_bytes = create_valid_jpg_bytes()

    response = client.post(
        "/api/v1/submissions/SUB001/documents",
        headers=headers,
        files={"file": ("udyam_certificate.jpeg", jpeg_bytes, "image/jpeg")},
        data={"document_type": "UDYAM_CERTIFICATE"}
    )

    assert response.status_code == 201
    assert response.json()["status"] == "VALIDATED"


def test_valid_webp_upload():
    headers = get_auth_headers()
    webp_bytes = create_valid_webp_bytes()

    response = client.post(
        "/api/v1/submissions/SUB001/documents",
        headers=headers,
        files={"file": ("oem_auth.webp", webp_bytes, "image/webp")},
        data={"document_type": "OEM_AUTHORIZATION"}
    )

    assert response.status_code == 201
    assert response.json()["status"] == "VALIDATED"


def test_unsupported_extension():
    headers = get_auth_headers()
    response = client.post(
        "/api/v1/submissions/SUB001/documents",
        headers=headers,
        files={"file": ("malicious_script.sh", b"#!/bin/bash\necho hello", "application/x-sh")}
    )

    assert response.status_code == 415
    assert "Unsupported extension" in response.json()["detail"]


def test_unsupported_mime_type():
    headers = get_auth_headers()
    response = client.post(
        "/api/v1/submissions/SUB001/documents",
        headers=headers,
        files={"file": ("unknown_file.pdf", b"PLAIN TEXT CONTENT NOT PDF", "application/pdf")}
    )

    assert response.status_code == 415
    assert "signature" in response.json()["detail"].lower() or "mismatch" in response.json()["detail"].lower()


def test_mime_extension_mismatch():
    headers = get_auth_headers()
    png_bytes = create_valid_png_bytes()

    # Named .pdf but actual bytes are PNG
    response = client.post(
        "/api/v1/submissions/SUB001/documents",
        headers=headers,
        files={"file": ("spoof_document.pdf", png_bytes, "application/pdf")}
    )

    assert response.status_code == 415
    assert "mismatch" in response.json()["detail"].lower()


def test_zero_byte_file():
    headers = get_auth_headers()
    response = client.post(
        "/api/v1/submissions/SUB001/documents",
        headers=headers,
        files={"file": ("empty.pdf", b"", "application/pdf")}
    )

    assert response.status_code == 400
    assert "zero-byte" in response.json()["detail"].lower()


def test_oversized_file(monkeypatch):
    headers = get_auth_headers()
    # Set MAX_DOCUMENT_SIZE_MB temporarily to 1MB for quick testing
    monkeypatch.setattr(settings, "MAX_DOCUMENT_SIZE_MB", 1)

    large_bytes = b"%PDF-" + b"0" * (1024 * 1024 + 100) # Exceeds 1MB
    response = client.post(
        "/api/v1/submissions/SUB001/documents",
        headers=headers,
        files={"file": ("large_file.pdf", large_bytes, "application/pdf")}
    )

    assert response.status_code == 413
    assert "exceeds maximum" in response.json()["detail"].lower()


def test_corrupt_pdf():
    headers = get_auth_headers()
    corrupt_pdf_bytes = b"%PDF-1.4\n1 0 obj << /Type /Catalog >> endobj\nCORRUPTED TRAILER INVALID"

    response = client.post(
        "/api/v1/submissions/SUB001/documents",
        headers=headers,
        files={"file": ("corrupt.pdf", corrupt_pdf_bytes, "application/pdf")}
    )

    assert response.status_code == 422
    assert "corrupt" in response.json()["detail"].lower() or "invalid" in response.json()["detail"].lower()


def test_encrypted_pdf():
    headers = get_auth_headers()
    encrypted_pdf_bytes = create_encrypted_pdf_bytes()

    response = client.post(
        "/api/v1/submissions/SUB001/documents",
        headers=headers,
        files={"file": ("protected.pdf", encrypted_pdf_bytes, "application/pdf")}
    )

    assert response.status_code == 422
    assert "encrypted" in response.json()["detail"].lower() or "password" in response.json()["detail"].lower()


def test_duplicate_upload():
    headers = get_auth_headers()
    pdf_bytes = create_valid_pdf_bytes()

    # First upload -> Success
    res1 = client.post(
        "/api/v1/submissions/SUB001/documents",
        headers=headers,
        files={"file": ("original.pdf", pdf_bytes, "application/pdf")}
    )
    assert res1.status_code == 201

    # Second upload with exact same file for same submission -> 409 Conflict
    res2 = client.post(
        "/api/v1/submissions/SUB001/documents",
        headers=headers,
        files={"file": ("copy.pdf", pdf_bytes, "application/pdf")}
    )
    assert res2.status_code == 409
    assert "duplicate" in res2.json()["detail"].lower()


@pytest.mark.parametrize("malicious_filename", [
    "../../secret.pdf",
    "....\\secret.pdf",
    "/etc/passwd.pdf",
    "C:\\Windows\\System32\\cmd.pdf",
    "../../../var/log/syslog.pdf"
])
def test_path_traversal_filenames(malicious_filename):
    headers = get_auth_headers()
    pdf_bytes = create_valid_pdf_bytes()

    response = client.post(
        "/api/v1/submissions/SUB001/documents",
        headers=headers,
        files={"file": (malicious_filename, pdf_bytes, "application/pdf")}
    )

    assert response.status_code in [201, 409]
    if response.status_code == 201:
        sanitized = sanitize_filename(malicious_filename)
        assert "/" not in response.json()["filename"]
        assert "\\" not in response.json()["filename"]
        assert ".." not in response.json()["filename"]


def test_missing_submission():
    headers = get_auth_headers()
    pdf_bytes = create_valid_pdf_bytes()

    response = client.post(
        "/api/v1/submissions/SUB_NON_EXISTENT_999/documents",
        headers=headers,
        files={"file": ("doc.pdf", pdf_bytes, "application/pdf")}
    )

    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_invalid_submission_tender_relationship():
    headers = get_auth_headers()
    pdf_bytes = create_valid_pdf_bytes()

    response = client.post(
        "/api/v1/submissions/SUB001/documents",
        headers=headers,
        files={"file": ("doc.pdf", pdf_bytes, "application/pdf")},
        data={"tender_id": "TND_WRONG_999"}
    )

    assert response.status_code == 400
    assert "does not belong" in response.json()["detail"].lower()


def test_invalid_submission_bidder_relationship():
    headers = get_auth_headers()
    pdf_bytes = create_valid_pdf_bytes()

    response = client.post(
        "/api/v1/submissions/SUB001/documents",
        headers=headers,
        files={"file": ("doc.pdf", pdf_bytes, "application/pdf")},
        data={"bidder_id": "BID_WRONG_999"}
    )

    assert response.status_code == 400
    assert "does not belong" in response.json()["detail"].lower()


def test_unauthorized_upload():
    pdf_bytes = create_valid_pdf_bytes()
    response = client.post(
        "/api/v1/submissions/SUB001/documents",
        headers={"Authorization": "Bearer invalid_token_xyz"},
        files={"file": ("doc.pdf", pdf_bytes, "application/pdf")}
    )
    assert response.status_code == 401


def test_sha256_checksum_correctness():
    headers = get_auth_headers()
    png_bytes = create_valid_png_bytes()
    expected_hash = calculate_sha256(png_bytes)

    response = client.post(
        "/api/v1/submissions/SUB002/documents",
        headers=headers,
        files={"file": ("checksum_test.png", png_bytes, "image/png")}
    )

    assert response.status_code == 201
    assert response.json()["checksum_sha256"] == expected_hash


def test_document_status_api():
    headers = get_auth_headers()
    pdf_bytes = create_valid_pdf_bytes()

    upload_res = client.post(
        "/api/v1/submissions/SUB002/documents",
        headers=headers,
        files={"file": ("status_check.pdf", pdf_bytes, "application/pdf")},
        data={"document_type": "INCORPORATION_CERTIFICATE"}
    )

    doc_id = upload_res.json()["document_id"]

    status_res = client.get(f"/api/v1/documents/{doc_id}", headers=headers)
    assert status_res.status_code == 200
    data = status_res.json()

    assert data["document_id"] == doc_id
    assert data["submission_id"] == "SUB002"
    assert data["bidder_id"] == "BID002"
    assert data["tender_id"] == "TND001"
    assert data["original_filename"] == "status_check.pdf"
    assert data["document_type"] == "INCORPORATION_CERTIFICATE"
    assert data["mime_type"] == "application/pdf"
    assert data["upload_status"] == "VALIDATED"
    assert data["processing_status"] == "PENDING"


def test_submission_document_listing_isolation():
    headers = get_auth_headers()
    pdf_bytes1 = create_valid_pdf_bytes()
    pdf_bytes2 = create_valid_pdf_bytes() + b"\n%extra"

    # Upload doc to SUB001
    client.post(
        "/api/v1/submissions/SUB001/documents",
        headers=headers,
        files={"file": ("sub1_doc.pdf", pdf_bytes1, "application/pdf")}
    )

    # Upload doc to SUB002
    client.post(
        "/api/v1/submissions/SUB002/documents",
        headers=headers,
        files={"file": ("sub2_doc.pdf", pdf_bytes2, "application/pdf")}
    )

    # Fetch docs for SUB001
    res1 = client.get("/api/v1/submissions/SUB001/documents", headers=headers)
    assert res1.status_code == 200
    sub1_docs = res1.json()
    assert all(d["submission_id"] == "SUB001" for d in sub1_docs)
    assert any(d["original_filename"] == "sub1_doc.pdf" for d in sub1_docs)
    assert not any(d["original_filename"] == "sub2_doc.pdf" for d in sub1_docs)

    # Fetch docs for SUB002
    res2 = client.get("/api/v1/submissions/SUB002/documents", headers=headers)
    assert res2.status_code == 200
    sub2_docs = res2.json()
    assert all(d["submission_id"] == "SUB002" for d in sub2_docs)
    assert any(d["original_filename"] == "sub2_doc.pdf" for d in sub2_docs)
    assert not any(d["original_filename"] == "sub1_doc.pdf" for d in sub2_docs)
