"""
scripts/seed_database.py
Populates SQLite database from data/ JSON files and seeds initial demo data.
"""

import sys
import json
from pathlib import Path

# Add backend directory to sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.db.session import engine, SessionLocal, Base
from app.db.models import User, Tender, TenderRequirement, Bidder, BidderDocument, VerificationResult, OfficerDecision, AuditLog
from app.core.config import settings, DATA_DIR
from app.core.security import get_password_hash
from app.services.verification_service import run_bidder_verification

def seed_all(reset: bool = True):
    print("Initializing database tables...")
    if reset:
        print("Reset flag detected: dropping and recreating all database tables...")
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Demo Officer User
        existing_user = db.query(User).filter(User.email == settings.DEMO_OFFICER_EMAIL).first()
        if not existing_user:
            demo_user = User(
                email=settings.DEMO_OFFICER_EMAIL,
                full_name=settings.DEMO_OFFICER_NAME,
                hashed_password=get_password_hash(settings.DEMO_OFFICER_PASSWORD),
                role="PROCUREMENT_OFFICER",
                designation=settings.DEMO_OFFICER_DESIGNATION,
                department="Public Sector Procurement & Contracts Directorate"
            )
            db.add(demo_user)
            print(f"Created demo officer: {settings.DEMO_OFFICER_EMAIL}")

        # 2. Seed Tenders
        tenders_path = DATA_DIR / "tenders.json"
        if tenders_path.exists():
            with open(tenders_path, "r", encoding="utf-8") as f:
                tenders = json.load(f)
            for td in tenders:
                if not db.query(Tender).filter(Tender.tender_id == td["tender_id"]).first():
                    db.add(Tender(
                        tender_id=td["tender_id"],
                        title=td["title"],
                        department=td["department"],
                        ministry=td.get("ministry"),
                        reference_number=td.get("reference_number"),
                        created_date=td.get("created_date"),
                        closing_date=td.get("closing_date"),
                        estimated_value_inr=td.get("estimated_value_inr", 0.0),
                        status=td.get("status", "ACTIVE"),
                        category=td.get("category"),
                        description=td.get("description")
                    ))
            print(f"Loaded {len(tenders)} tenders.")

        # 3. Seed Requirements
        reqs_path = DATA_DIR / "requirements.json"
        if reqs_path.exists():
            with open(reqs_path, "r", encoding="utf-8") as f:
                reqs = json.load(f)
            for rd in reqs:
                if not db.query(TenderRequirement).filter(TenderRequirement.id == rd["req_id"]).first():
                    db.add(TenderRequirement(
                        id=rd["req_id"],
                        tender_id=rd["tender_id"],
                        title=rd["title"],
                        category=rd["category"],
                        mandatory=rd["mandatory"],
                        condition=rd.get("condition"),
                        verification_source=rd["verification_source"],
                        rule_code=rd.get("rule_code"),
                        weight=rd.get("weight", 10),
                        is_custom=False
                    ))
            print(f"Loaded {len(reqs)} requirements.")

        # 4. Seed Bidders
        bidders_path = DATA_DIR / "bidders.json"
        if bidders_path.exists():
            with open(bidders_path, "r", encoding="utf-8") as f:
                bidders = json.load(f)
            for bd in bidders:
                existing_bidder = db.query(Bidder).filter(Bidder.bidder_id == bd["bidder_id"]).first()
                if not existing_bidder:
                    exp = bd.get("expected_profile", {})
                    bidder_obj = Bidder(
                        bidder_id=bd["bidder_id"],
                        company_name=bd["company_name"],
                        pan=bd["pan"],
                        gstin=bd["gstin"],
                        cin=bd.get("cin"),
                        udyam_number=bd.get("udyam_number"),
                        address=bd.get("address"),
                        company_type=bd.get("company_type", "PRIVATE_LIMITED"),
                        msme_status=bd.get("msme_status", "NOT_APPLICABLE"),
                        msme_category=bd.get("msme_category"),
                        startup_status=bd.get("startup_status", "NOT_APPLICABLE"),
                        startup_certificate=bd.get("startup_certificate"),
                        nsic_status=bd.get("nsic_status", "NOT_REGISTERED"),
                        epfo_id=bd.get("epfo_id"),
                        esic_id=bd.get("esic_id"),
                        claimed_msme_benefit=bd.get("claimed_msme_benefit", False),
                        claimed_startup_benefit=bd.get("claimed_startup_benefit", False),
                        declared_local_content=bd.get("declared_local_content", 0.0),
                        oem_authorized=bd.get("oem_authorized", False),
                        oem_product=bd.get("oem_product"),
                        oem_name=bd.get("oem_name"),
                        oem_expiry=bd.get("oem_expiry"),
                        itr_filed_year=bd.get("itr_filed_year"),
                        blacklisted=bd.get("blacklisted", False),
                        expected_score=exp.get("compliance_score", 0),
                        expected_risk=exp.get("risk_level", "LOW"),
                        notes=exp.get("notes")
                    )
                    db.add(bidder_obj)

                    # Pre-seed documents for this bidder
                    docs = [
                        ("GST Registration Certificate", "GST_CERTIFICATE", "2026-09-02", "VERIFIED", None, {
                            "gstin": bd["gstin"],
                            "legal_name": bd["company_name"],
                            "status": "ACTIVE"
                        }),
                        ("PAN Card Copy", "PAN_CARD", "2026-09-02", "VERIFIED", None, {
                            "pan": bd["pan"],
                            "holder_name": bd["company_name"]
                        }),
                        ("Make in India Local Content Declaration", "LOCAL_CONTENT_DECLARATION", "2026-09-03", "VERIFIED", None, {
                            "declared_percentage": bd.get("declared_local_content", 0.0)
                        })
                    ]

                    if bd.get("udyam_number"):
                        docs.append(("Udyam MSME Registration Certificate", "UDYAM_CERTIFICATE", "2026-09-02", "VERIFIED", None, {
                            "udyam_number": bd["udyam_number"],
                            "enterprise_name": bd["company_name"]
                        }))

                    if bd.get("startup_certificate"):
                        docs.append(("DPIIT Certificate of Recognition", "DPIIT_CERTIFICATE", "2026-09-02", "VERIFIED", None, {
                            "certificate_number": bd["startup_certificate"],
                            "startup_name": bd["company_name"]
                        }))

                    if bd.get("oem_authorized"):
                        docs.append(("Manufacturer Authorization Form (MAF)", "OEM_AUTHORIZATION", "2026-09-04", "VERIFIED", bd.get("oem_expiry"), {
                            "oem_name": bd.get("oem_name"),
                            "authorized_bidder": bd["company_name"],
                            "product": bd.get("oem_product"),
                            "valid_until": bd.get("oem_expiry")
                        }))

                    if bd.get("itr_filed_year"):
                        docs.append(("ITR Acknowledgment Form", "ITR_ACKNOWLEDGMENT", "2026-09-03", "VERIFIED", None, {
                            "pan": bd["pan"],
                            "assessment_year": bd.get("itr_filed_year")
                        }))

                    for d_name, d_type, u_date, v_stat, exp_date, extra in docs:
                        d_id = f"DOC-{bd['bidder_id']}-{d_type[:6]}"
                        db.add(BidderDocument(
                            id=d_id,
                            bidder_id=bd["bidder_id"],
                            tender_id="TND001",
                            document_name=f"{d_name}.pdf",
                            document_type=d_type,
                            upload_date=u_date,
                            status="VERIFIED",
                            expiry_date=exp_date,
                            extracted_data_json=json.dumps(extra),
                            verification_status=v_stat
                        ))
            print(f"Loaded {len(bidders)} bidders and seeded corresponding documents.")

        db.commit()

        # 5. Pre-run verification on primary demo bidders on TND001
        print("Pre-executing AI verification for primary demo bidders on TND001...")
        for bid_id in ["BID001", "BID002", "BID003", "BID004", "BID006", "BID008", "BID016", "BID033"]:
            try:
                run_bidder_verification(db, "TND001", bid_id, settings.DEMO_OFFICER_EMAIL)
                print(f"  Verified bidder {bid_id}")
            except Exception as e:
                print(f"Notice during pre-verification for {bid_id}: {e}")

        # 6. Pre-seed initial officer decision for BID001
        if not db.query(OfficerDecision).filter(OfficerDecision.bidder_id == "BID001").first():
            db.add(OfficerDecision(
                tender_id="TND001",
                bidder_id="BID001",
                officer_email=settings.DEMO_OFFICER_EMAIL,
                officer_name=settings.DEMO_OFFICER_NAME,
                decision="APPROVED",
                comments="All statutory criteria (GSTN, PAN, Udyam Small Enterprise), local content declaration, and OEM authorizations verified with 96% concordance. Qualified for commercial evaluation."
            ))
            db.commit()
            print("Seeded initial officer approval for BID001.")

        print("Database seeding completed successfully.")

    finally:
        db.close()

if __name__ == "__main__":
    reset_db = "--no-reset" not in sys.argv
    seed_all(reset=reset_db)
