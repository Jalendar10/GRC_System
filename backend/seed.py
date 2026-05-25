"""Seed the database with realistic banking GRC data."""
import uuid
from datetime import datetime, timedelta
import random
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.core.database import SessionLocal, engine
from app.core import database as db_module
from app.models.control import Control, ControlEvidence
from app.models.risk import Risk, RiskTreatment
from app.models.audit import Audit, AuditFinding
from app.models.policy import Policy, PolicyAcknowledgment
from app.models.framework import Framework, FrameworkControl
from app.models.user import User
import app.models  # ensure all models are registered


def seed():
    # Create tables
    from app.core.database import Base
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    print("Seeding database...")

    # ── Admin User ────────────────────────────────────────────────────────────
    from app.models.user import User
    from app.core.auth import get_password_hash
    admin_user = db.query(User).filter_by(email="admin@grc.com").first()
    if not admin_user:
        db.add(User(
            id="usr-admin-001",
            email="admin@grc.com",
            full_name="GRC Manager Analyst",
            role="admin",
            hashed_password=get_password_hash("Admin@2026"),
            is_active=True,
            department="GRC & Compliance",
        ))
        db.commit()

    analyst_user = db.query(User).filter_by(email="analyst@grc.com").first()
    if not analyst_user:
        db.add(User(
            id="usr-analyst-001",
            email="analyst@grc.com",
            full_name="Risk Analyst",
            role="grc_manager",
            hashed_password=get_password_hash("Analyst@2026"),
            is_active=True,
            department="Risk Management",
        ))
        db.commit()

    auditor_user = db.query(User).filter_by(email="auditor@grc.com").first()
    if not auditor_user:
        db.add(User(
            id="usr-auditor-001",
            email="auditor@grc.com",
            full_name="External Auditor",
            role="auditor",
            hashed_password=get_password_hash("Auditor@2026"),
            is_active=True,
            department="Internal Audit",
        ))
        db.commit()

    # ── Frameworks ───────────────────────────────────────────────────────────
    frameworks_data = [
        {
            "id": "fw-pci", "name": "Payment Card Industry Data Security Standard",
            "short_name": "PCI-DSS", "version": "4.0",
            "description": "Security standard for organizations handling cardholder data",
            "category": "regulatory", "compliance_score": 84.2,
            "total_controls": 12, "implemented_controls": 10,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-sox", "name": "Sarbanes-Oxley Act Section 404",
            "short_name": "SOX", "version": "2024",
            "description": "Financial reporting internal controls for public companies",
            "category": "regulatory", "compliance_score": 91.5,
            "total_controls": 8, "implemented_controls": 8,
            "compliance_status": "compliant",
        },
        {
            "id": "fw-iso27001", "name": "ISO/IEC 27001:2022",
            "short_name": "ISO 27001", "version": "2022",
            "description": "International standard for information security management",
            "category": "standard", "compliance_score": 78.3,
            "total_controls": 93, "implemented_controls": 73,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-nist-csf", "name": "NIST Cybersecurity Framework",
            "short_name": "NIST-CSF", "version": "2.0",
            "description": "Framework for managing and reducing cybersecurity risk",
            "category": "framework", "compliance_score": 82.7,
            "total_controls": 108, "implemented_controls": 89,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-ffiec", "name": "FFIEC Cybersecurity Assessment Tool",
            "short_name": "FFIEC-CAT", "version": "2023",
            "description": "Cybersecurity maturity for financial institutions",
            "category": "regulatory", "compliance_score": 76.8,
            "total_controls": 30, "implemented_controls": 23,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-basel", "name": "Basel III Operational Risk",
            "short_name": "Basel III", "version": "2024",
            "description": "Capital requirements and operational risk management",
            "category": "regulatory", "compliance_score": 88.0,
            "total_controls": 15, "implemented_controls": 13,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-gdpr", "name": "General Data Protection Regulation",
            "short_name": "GDPR", "version": "2018",
            "description": "EU regulation on data protection and privacy for all individuals within the EU",
            "category": "regulatory", "compliance_score": 73.5,
            "total_controls": 45, "implemented_controls": 33,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-ccpa", "name": "California Consumer Privacy Act / CPRA",
            "short_name": "CCPA-CPRA", "version": "2023",
            "description": "California privacy law granting consumers rights over their personal information",
            "category": "regulatory", "compliance_score": 81.0,
            "total_controls": 25, "implemented_controls": 20,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-hipaa", "name": "Health Insurance Portability and Accountability Act",
            "short_name": "HIPAA", "version": "2023",
            "description": "US regulation for protecting sensitive patient health information",
            "category": "regulatory", "compliance_score": 79.2,
            "total_controls": 42, "implemented_controls": 33,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-soc2", "name": "SOC 2 Type II — Trust Services Criteria",
            "short_name": "SOC 2", "version": "2017",
            "description": "AICPA framework for service organizations — Security, Availability, Confidentiality",
            "category": "standard", "compliance_score": 85.5,
            "total_controls": 64, "implemented_controls": 55,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-fedramp", "name": "Federal Risk and Authorization Management Program",
            "short_name": "FedRAMP", "version": "Rev5",
            "description": "US government cloud security authorization framework",
            "category": "regulatory", "compliance_score": 68.0,
            "total_controls": 325, "implemented_controls": 221,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-dora", "name": "Digital Operational Resilience Act",
            "short_name": "DORA", "version": "2025",
            "description": "EU regulation on digital operational resilience for financial entities",
            "category": "regulatory", "compliance_score": 62.3,
            "total_controls": 58, "implemented_controls": 36,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-nis2", "name": "Network and Information Security Directive 2",
            "short_name": "NIS2", "version": "2024",
            "description": "EU directive on cybersecurity measures for essential and important entities",
            "category": "regulatory", "compliance_score": 70.1,
            "total_controls": 35, "implemented_controls": 25,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-cmmc", "name": "Cybersecurity Maturity Model Certification",
            "short_name": "CMMC", "version": "2.0",
            "description": "DoD framework for protecting controlled unclassified information",
            "category": "regulatory", "compliance_score": 58.7,
            "total_controls": 110, "implemented_controls": 65,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-nist-800-53", "name": "NIST SP 800-53 Security and Privacy Controls",
            "short_name": "NIST 800-53", "version": "Rev5",
            "description": "Comprehensive catalog of security and privacy controls for federal systems",
            "category": "framework", "compliance_score": 74.8,
            "total_controls": 1077, "implemented_controls": 806,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-iso22301", "name": "ISO 22301 Business Continuity Management",
            "short_name": "ISO 22301", "version": "2019",
            "description": "International standard for business continuity management systems",
            "category": "standard", "compliance_score": 83.4,
            "total_controls": 30, "implemented_controls": 25,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-cis", "name": "CIS Critical Security Controls",
            "short_name": "CIS Controls", "version": "v8",
            "description": "Prioritized set of actions to protect organizations from common cyber attacks",
            "category": "framework", "compliance_score": 76.9,
            "total_controls": 153, "implemented_controls": 118,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-aml-bsa", "name": "Anti-Money Laundering / Bank Secrecy Act",
            "short_name": "AML-BSA", "version": "2024",
            "description": "US federal law requiring financial institutions to combat money laundering",
            "category": "regulatory", "compliance_score": 87.6,
            "total_controls": 28, "implemented_controls": 25,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-mifid2", "name": "Markets in Financial Instruments Directive II",
            "short_name": "MiFID II", "version": "2018",
            "description": "EU regulation on investment services and activities in financial markets",
            "category": "regulatory", "compliance_score": 79.5,
            "total_controls": 40, "implemented_controls": 32,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-apra", "name": "APRA CPS 234 Information Security",
            "short_name": "APRA CPS 234", "version": "2019",
            "description": "Australian Prudential Regulation Authority cybersecurity standard",
            "category": "regulatory", "compliance_score": 80.2,
            "total_controls": 22, "implemented_controls": 18,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-mas-trm", "name": "MAS Technology Risk Management Guidelines",
            "short_name": "MAS TRM", "version": "2021",
            "description": "Monetary Authority of Singapore technology risk management guidelines",
            "category": "regulatory", "compliance_score": 77.3,
            "total_controls": 35, "implemented_controls": 27,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-hitrust", "name": "HITRUST Common Security Framework",
            "short_name": "HITRUST CSF", "version": "11.0",
            "description": "Comprehensive security framework for healthcare and other industries",
            "category": "framework", "compliance_score": 71.8,
            "total_controls": 75, "implemented_controls": 54,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-cobit", "name": "COBIT 2019 — Governance of Enterprise IT",
            "short_name": "COBIT 2019", "version": "2019",
            "description": "Framework for governance and management of enterprise information and technology",
            "category": "framework", "compliance_score": 74.5,
            "total_controls": 40, "implemented_controls": 30,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-fisma", "name": "Federal Information Security Management Act",
            "short_name": "FISMA", "version": "2022",
            "description": "US law requiring federal agencies to develop information security programs",
            "category": "regulatory", "compliance_score": 69.3,
            "total_controls": 55, "implemented_controls": 38,
            "compliance_status": "in_progress",
        },
        {
            "id": "fw-finra", "name": "FINRA Rules and Regulations",
            "short_name": "FINRA", "version": "2024",
            "description": "Financial Industry Regulatory Authority rules for broker-dealers",
            "category": "regulatory", "compliance_score": 83.9,
            "total_controls": 32, "implemented_controls": 27,
            "compliance_status": "in_progress",
        },
    ]
    for fd in frameworks_data:
        existing = db.query(Framework).filter_by(id=fd["id"]).first()
        if existing:
            for k, v in fd.items():
                setattr(existing, k, v)
        else:
            db.add(Framework(**fd))

    # ── Controls (Banking-specific) ───────────────────────────────────────────
    controls_data = [
        {
            "id": "CTRL-IAM-001", "name": "Privileged Access Management",
            "description": "Just-in-time privilege escalation for all privileged access. No standing admin accounts. All escalations require peer approval and are time-bounded.",
            "category": "access_control", "control_type": "preventive",
            "owner": "Sarah Chen", "owner_team": "Identity & Access Management",
            "status": "effective", "effectiveness_score": 0.94,
            "automation_level": "automated", "frequency": "continuous",
            "frameworks": ["PCI-DSS 8.2", "SOX CC6.1", "ISO 27001 A.9.2"],
            "is_automated": True, "integration_source": "okta",
            "code_definition": CTRL_IAM_001_CODE,
        },
        {
            "id": "CTRL-IAM-002", "name": "User Access Reviews (Quarterly)",
            "description": "Automated quarterly access reviews via Okta Lifecycle Management. System owners review and certify access. Orphaned accounts automatically deprovisioned after 90 days.",
            "category": "access_control", "control_type": "detective",
            "owner": "Sarah Chen", "owner_team": "Identity & Access Management",
            "status": "effective", "effectiveness_score": 0.91,
            "automation_level": "semi-auto", "frequency": "quarterly",
            "frameworks": ["PCI-DSS 8.3", "SOX CC6.2", "ISO 27001 A.9.5"],
            "is_automated": True, "integration_source": "okta",
        },
        {
            "id": "CTRL-IAM-003", "name": "Multi-Factor Authentication",
            "description": "MFA enforced for all user accounts via Okta. TOTP/push authentication required for all production system access. Zero-trust network access (ZTNA) implemented.",
            "category": "identity_management", "control_type": "preventive",
            "owner": "Sarah Chen", "owner_team": "Identity & Access Management",
            "status": "effective", "effectiveness_score": 0.98,
            "automation_level": "automated", "frequency": "continuous",
            "frameworks": ["PCI-DSS 8.4", "FFIEC D1.AC.Ac.B", "NIST-CSF PR.AC-7"],
            "is_automated": True, "integration_source": "okta",
        },
        {
            "id": "CTRL-ENC-001", "name": "Data-at-Rest Encryption",
            "description": "All data stores encrypted with AES-256. KMS key rotation enforced every 90 days. CMK per data classification tier. Unencrypted resources auto-remediated via AWS Config.",
            "category": "encryption", "control_type": "preventive",
            "owner": "Marcus Williams", "owner_team": "Cloud Security",
            "status": "effective", "effectiveness_score": 0.97,
            "automation_level": "automated", "frequency": "continuous",
            "frameworks": ["PCI-DSS 3.4", "SOX CC6.7", "ISO 27001 A.10.1"],
            "is_automated": True, "integration_source": "aws_kms",
        },
        {
            "id": "CTRL-ENC-002", "name": "Data-in-Transit Encryption",
            "description": "TLS 1.3 enforced for all inter-service communication. Certificate lifecycle managed by cert-manager. Deprecated cipher suites blocked via WAF.",
            "category": "encryption", "control_type": "preventive",
            "owner": "Marcus Williams", "owner_team": "Cloud Security",
            "status": "effective", "effectiveness_score": 0.95,
            "automation_level": "automated", "frequency": "continuous",
            "frameworks": ["PCI-DSS 4.2", "ISO 27001 A.10.1", "NIST-CSF PR.DS-2"],
            "is_automated": True, "integration_source": "aws",
        },
        {
            "id": "CTRL-VM-001", "name": "Vulnerability Management",
            "description": "Continuous asset scanning via Qualys. Critical patches within 24h, High within 72h, Medium within 30 days. SLA breaches trigger automated Jira tickets and escalation.",
            "category": "vulnerability_management", "control_type": "detective",
            "owner": "James Rodriguez", "owner_team": "Security Operations",
            "status": "partially_effective", "effectiveness_score": 0.76,
            "automation_level": "semi-auto", "frequency": "continuous",
            "frameworks": ["PCI-DSS 11.3", "ISO 27001 A.12.6", "NIST-CSF DE.CM-8"],
            "is_automated": True, "integration_source": "qualys",
        },
        {
            "id": "CTRL-LOG-001", "name": "Centralized Security Logging & SIEM",
            "description": "All security events centralized in Splunk. 1-year hot retention, 7-year cold storage (S3 Glacier). 180+ alert rules. SOC monitors 24/7. MTTR < 4 hours for critical alerts.",
            "category": "audit_logging", "control_type": "detective",
            "owner": "James Rodriguez", "owner_team": "Security Operations",
            "status": "effective", "effectiveness_score": 0.92,
            "automation_level": "automated", "frequency": "continuous",
            "frameworks": ["PCI-DSS 10.2", "SOX CC7.2", "ISO 27001 A.12.4", "FFIEC D4.C.So.B"],
            "is_automated": True, "integration_source": "splunk",
        },
        {
            "id": "CTRL-CHG-001", "name": "Change Management & Approval",
            "description": "All production changes require dual approval via ServiceNow. Emergency changes require CISO authorization. Automated rollback capability for 100% of deployments.",
            "category": "change_management", "control_type": "preventive",
            "owner": "Priya Patel", "owner_team": "Platform Engineering",
            "status": "effective", "effectiveness_score": 0.89,
            "automation_level": "semi-auto", "frequency": "continuous",
            "frameworks": ["SOX CC8.1", "PCI-DSS 6.5", "ISO 27001 A.12.1", "ITIL"],
            "is_automated": False, "integration_source": "servicenow",
        },
        {
            "id": "CTRL-IR-001", "name": "Incident Response & Management",
            "description": "Documented IR playbooks for top 15 threat scenarios. Automated triage via SOAR. Tabletop exercises quarterly. IR retainer with Mandiant. MTTR < 4h for P1 incidents.",
            "category": "incident_response", "control_type": "corrective",
            "owner": "James Rodriguez", "owner_team": "Security Operations",
            "status": "effective", "effectiveness_score": 0.88,
            "automation_level": "semi-auto", "frequency": "continuous",
            "frameworks": ["NIST-CSF RS.RP-1", "ISO 27001 A.16.1", "FFIEC D4.C.Co.B"],
            "is_automated": False, "integration_source": "pagerduty",
        },
        {
            "id": "CTRL-VEN-001", "name": "Third-Party Vendor Risk Management",
            "description": "Annual security assessments for Tier-1 vendors. Continuous monitoring via BitSight. Vendor contracts include right-to-audit clauses. SOC 2 reports reviewed annually.",
            "category": "vendor_management", "control_type": "detective",
            "owner": "Linda Thompson", "owner_team": "Procurement & Risk",
            "status": "partially_effective", "effectiveness_score": 0.71,
            "automation_level": "manual", "frequency": "annual",
            "frameworks": ["ISO 27001 A.15.1", "FFIEC D5.TM.B", "NIST-CSF ID.SC-3"],
            "is_automated": False, "integration_source": "bitsight",
        },
        {
            "id": "CTRL-DLP-001", "name": "Data Loss Prevention",
            "description": "Symantec DLP deployed across endpoints and email. Data classification enforced via Azure Purview. PII/PAN detected and blocked in real-time. Weekly DLP policy reviews.",
            "category": "data_protection", "control_type": "preventive",
            "owner": "Marcus Williams", "owner_team": "Cloud Security",
            "status": "partially_effective", "effectiveness_score": 0.73,
            "automation_level": "automated", "frequency": "continuous",
            "frameworks": ["PCI-DSS 3.3", "ISO 27001 A.13.2", "GDPR Art.32"],
            "is_automated": True, "integration_source": "symantec",
        },
        {
            "id": "CTRL-BCP-001", "name": "Business Continuity & Disaster Recovery",
            "description": "RPO < 1h, RTO < 4h for all Tier-1 systems. Annual DR tests with documented results. Multi-region active-active for payment processing. Business impact analysis updated annually.",
            "category": "business_continuity", "control_type": "corrective",
            "owner": "Robert Kim", "owner_team": "IT Infrastructure",
            "status": "effective", "effectiveness_score": 0.86,
            "automation_level": "automated", "frequency": "annual",
            "frameworks": ["ISO 27001 A.17.1", "FFIEC BCP", "Basel III", "SOX CC9.1"],
            "is_automated": True, "integration_source": "aws",
        },
    ]

    for cd in controls_data:
        existing = db.query(Control).filter_by(id=cd["id"]).first()
        if existing:
            for k, v in cd.items():
                setattr(existing, k, v)
        else:
            ctrl = Control(**cd)
            ctrl.last_tested = datetime.utcnow() - timedelta(days=random.randint(1, 30))
            ctrl.next_test_due = datetime.utcnow() + timedelta(days=random.randint(30, 90))
            db.add(ctrl)

    # ── Risks ─────────────────────────────────────────────────────────────────
    risks_data = [
        {
            "id": "RISK-CYB-001", "title": "Ransomware Attack on Core Banking Systems",
            "description": "Adversary encrypts core banking infrastructure disrupting transaction processing and customer access to accounts.",
            "category": "cyber", "subcategory": "malware",
            "owner": "James Rodriguez", "owner_team": "Security Operations",
            "status": "open",
            "inherent_likelihood": 4, "inherent_impact": 5, "inherent_score": 20,
            "residual_likelihood": 2, "residual_impact": 5, "residual_score": 10,
            "risk_appetite": "low",
            "threat_actor": "Ransomware-as-a-Service (RaaS) groups",
            "threat_vector": "Phishing email with malicious attachment",
            "financial_impact_low": 5000000, "financial_impact_high": 50000000,
            "regulatory_exposure": 10000000,
            "business_line": "Retail Banking",
            "risk_event_type": "external_fraud",
            "framework_refs": ["NIST-CSF PR.IP-4", "FFIEC D3.DC.An.B"],
        },
        {
            "id": "RISK-IAM-001", "title": "Insider Threat — Privileged Account Misuse",
            "description": "Malicious or negligent employee with privileged access exfiltrates customer PII or manipulates financial records.",
            "category": "operational", "subcategory": "insider_threat",
            "owner": "Sarah Chen", "owner_team": "Identity & Access Management",
            "status": "open",
            "inherent_likelihood": 3, "inherent_impact": 4, "inherent_score": 12,
            "residual_likelihood": 2, "residual_impact": 4, "residual_score": 8,
            "risk_appetite": "low",
            "threat_actor": "Malicious insider",
            "threat_vector": "Privileged account with excessive permissions",
            "financial_impact_low": 1000000, "financial_impact_high": 15000000,
            "regulatory_exposure": 5000000,
            "business_line": "All",
            "risk_event_type": "internal_fraud",
            "framework_refs": ["SOX CC6.1", "PCI-DSS 8.2"],
        },
        {
            "id": "RISK-REG-001", "title": "PCI-DSS 4.0 Compliance Gap",
            "description": "Failure to achieve full PCI-DSS 4.0 compliance by March 2025 deadline resulting in fines and inability to process card payments.",
            "category": "compliance", "subcategory": "regulatory",
            "owner": "Linda Thompson", "owner_team": "GRC",
            "status": "open",
            "inherent_likelihood": 3, "inherent_impact": 4, "inherent_score": 12,
            "residual_likelihood": 2, "residual_impact": 3, "residual_score": 6,
            "risk_appetite": "low",
            "financial_impact_low": 500000, "financial_impact_high": 5000000,
            "regulatory_exposure": 2000000,
            "business_line": "Card Services",
            "risk_event_type": "compliance",
            "framework_refs": ["PCI-DSS 4.0"],
        },
        {
            "id": "RISK-API-001", "title": "Third-Party API Security Breach",
            "description": "Compromised vendor API key or insecure open banking API integration allows unauthorized access to account data.",
            "category": "cyber", "subcategory": "supply_chain",
            "owner": "Marcus Williams", "owner_team": "Cloud Security",
            "status": "open",
            "inherent_likelihood": 3, "inherent_impact": 3, "inherent_score": 9,
            "residual_likelihood": 2, "residual_impact": 3, "residual_score": 6,
            "risk_appetite": "moderate",
            "threat_actor": "Nation-state and cybercriminal groups",
            "threat_vector": "Supply chain compromise",
            "financial_impact_low": 500000, "financial_impact_high": 5000000,
            "business_line": "Digital Banking",
            "risk_event_type": "external_fraud",
        },
        {
            "id": "RISK-OPS-001", "title": "Core Banking System Outage",
            "description": "Extended outage of core banking platform affecting transaction processing, customer access, and regulatory reporting obligations.",
            "category": "operational", "subcategory": "technology",
            "owner": "Robert Kim", "owner_team": "IT Infrastructure",
            "status": "mitigated",
            "inherent_likelihood": 3, "inherent_impact": 5, "inherent_score": 15,
            "residual_likelihood": 1, "residual_impact": 4, "residual_score": 4,
            "risk_appetite": "low",
            "financial_impact_low": 2000000, "financial_impact_high": 20000000,
            "business_line": "All",
            "risk_event_type": "business_disruption",
        },
        {
            "id": "RISK-DAT-001", "title": "Customer PII Data Breach",
            "description": "Unauthorized disclosure of customer personally identifiable information triggering GDPR, state privacy law notifications and regulatory penalties.",
            "category": "compliance", "subcategory": "data_privacy",
            "owner": "Marcus Williams", "owner_team": "Cloud Security",
            "status": "open",
            "inherent_likelihood": 3, "inherent_impact": 4, "inherent_score": 12,
            "residual_likelihood": 2, "residual_impact": 4, "residual_score": 8,
            "risk_appetite": "low",
            "financial_impact_low": 2000000, "financial_impact_high": 25000000,
            "regulatory_exposure": 8000000,
            "business_line": "All",
            "risk_event_type": "external_fraud",
            "framework_refs": ["GDPR Art.33", "CCPA"],
        },
        {
            "id": "RISK-FRAUD-001", "title": "Payment Fraud — Account Takeover",
            "description": "Credential stuffing or social engineering attacks result in account takeovers and fraudulent payment initiation.",
            "category": "financial", "subcategory": "fraud",
            "owner": "Sarah Chen", "owner_team": "Identity & Access Management",
            "status": "open",
            "inherent_likelihood": 4, "inherent_impact": 3, "inherent_score": 12,
            "residual_likelihood": 2, "residual_impact": 3, "residual_score": 6,
            "risk_appetite": "low",
            "threat_actor": "Organized crime groups",
            "threat_vector": "Credential stuffing, phishing",
            "financial_impact_low": 1000000, "financial_impact_high": 10000000,
            "business_line": "Retail Banking",
            "risk_event_type": "external_fraud",
        },
    ]

    for rd in risks_data:
        existing = db.query(Risk).filter_by(id=rd["id"]).first()
        if existing:
            for k, v in rd.items():
                setattr(existing, k, v)
        else:
            db.add(Risk(**rd))

    # ── Audits ────────────────────────────────────────────────────────────────
    audits_data = [
        {
            "id": "AUD-SOX-2024", "name": "SOX Section 404 Annual Audit FY2024",
            "audit_type": "sox", "framework": "SOX",
            "scope": "IT General Controls and Financial Reporting Controls",
            "status": "completed", "auditor": "Deloitte & Touche LLP",
            "audit_lead": "Linda Thompson",
            "overall_score": 91.5, "compliance_rate": 0.915,
            "ai_assisted": True,
            "ai_analysis_summary": "Controls over financial reporting are operating effectively. Three low-severity findings identified, all with remediation plans in place.",
            "total_findings": 3, "critical_findings": 0, "high_findings": 0,
            "medium_findings": 1, "low_findings": 2,
            "period_start": datetime(2024, 1, 1), "period_end": datetime(2024, 12, 31),
            "ai_recommendations": [
                "Automate SOX evidence collection to reduce manual effort by 60%",
                "Implement continuous monitoring for financial reporting controls",
                "Enhance privileged access monitoring with real-time alerting"
            ],
            "control_ids": ["CTRL-IAM-001", "CTRL-IAM-002", "CTRL-CHG-001", "CTRL-LOG-001"],
        },
        {
            "id": "AUD-PCI-2025", "name": "PCI-DSS 4.0 Assessment Q1 2025",
            "audit_type": "pci", "framework": "PCI-DSS",
            "scope": "Cardholder data environment and all connected systems",
            "status": "in_progress", "auditor": "Coalfire Systems",
            "audit_lead": "Linda Thompson",
            "overall_score": None, "compliance_rate": None,
            "ai_assisted": True,
            "period_start": datetime(2025, 1, 1), "period_end": datetime(2025, 3, 31),
            "control_ids": ["CTRL-ENC-001", "CTRL-ENC-002", "CTRL-IAM-003", "CTRL-LOG-001"],
        },
        {
            "id": "AUD-ISO-2024", "name": "ISO 27001:2022 Surveillance Audit",
            "audit_type": "iso27001", "framework": "ISO 27001",
            "scope": "Information Security Management System (ISMS)",
            "status": "completed", "auditor": "BSI Group",
            "audit_lead": "Priya Patel",
            "overall_score": 78.3, "compliance_rate": 0.783,
            "ai_assisted": True,
            "ai_analysis_summary": "ISMS demonstrates continual improvement. Eight findings identified including two major non-conformities requiring corrective action within 90 days.",
            "total_findings": 8, "critical_findings": 0, "high_findings": 2,
            "medium_findings": 4, "low_findings": 2,
            "period_start": datetime(2024, 6, 1), "period_end": datetime(2024, 6, 30),
            "ai_recommendations": [
                "Address supplier security assessment gaps immediately",
                "Implement automated control testing for ISO Annex A controls",
                "Develop threat intelligence program aligned with ISO 27001 A.5.7"
            ],
            "control_ids": ["CTRL-VEN-001", "CTRL-IR-001", "CTRL-LOG-001"],
        },
        {
            "id": "AUD-INT-2025-Q1", "name": "Internal GRC Audit Q1 2025",
            "audit_type": "internal", "framework": "NIST-CSF",
            "scope": "All 12 security controls across 5 domains",
            "status": "planned", "auditor": "Internal Audit Team",
            "audit_lead": "Linda Thompson",
            "ai_assisted": True,
            "period_start": datetime(2025, 3, 1), "period_end": datetime(2025, 3, 31),
            "control_ids": ["CTRL-IAM-001", "CTRL-IAM-002", "CTRL-IAM-003",
                           "CTRL-ENC-001", "CTRL-ENC-002", "CTRL-VM-001"],
        },
    ]

    for ad in audits_data:
        existing = db.query(Audit).filter_by(id=ad["id"]).first()
        if existing:
            for k, v in ad.items():
                setattr(existing, k, v)
        else:
            db.add(Audit(**ad))

    # SOX findings
    sox_findings = [
        {
            "id": str(uuid.uuid4()), "audit_id": "AUD-SOX-2024",
            "title": "Incomplete Evidence for Quarterly Access Reviews",
            "severity": "medium", "finding_type": "deficiency",
            "description": "Three of twelve access reviews in Q3 lacked documented completion sign-off from system owners within the required timeframe.",
            "root_cause": "Manual access review process with no automated reminder or escalation workflow.",
            "recommendation": "Implement automated Okta Lifecycle Management workflows with escalation rules for overdue reviews.",
            "remediation_owner": "Sarah Chen",
            "remediation_due": datetime(2025, 3, 31),
            "remediation_status": "in_progress", "ai_generated": True,
        },
        {
            "id": str(uuid.uuid4()), "audit_id": "AUD-SOX-2024",
            "title": "Change Management Log Gaps",
            "severity": "low", "finding_type": "observation",
            "description": "Seven emergency change records lacked post-implementation review documentation within the 5-business-day requirement.",
            "root_cause": "Emergency change process does not enforce post-implementation review before closure.",
            "recommendation": "Configure ServiceNow to require PIR completion before emergency change ticket can be closed.",
            "remediation_owner": "Priya Patel",
            "remediation_due": datetime(2025, 2, 28),
            "remediation_status": "completed", "ai_generated": True,
        },
    ]

    iso_findings = [
        {
            "id": str(uuid.uuid4()), "audit_id": "AUD-ISO-2024",
            "title": "Supplier Security Assessment Coverage Below 80%",
            "severity": "high", "finding_type": "deficiency",
            "description": "Only 65% of Tier-1 suppliers completed annual security assessments. ISO 27001 A.15.1 requires documented assessment of all suppliers with access to information assets.",
            "root_cause": "No automated tracking system for supplier assessment due dates. Manual spreadsheet process leads to missed deadlines.",
            "recommendation": "Implement a vendor risk management platform with automated assessment scheduling and escalation workflows.",
            "remediation_owner": "Linda Thompson",
            "remediation_due": datetime(2025, 6, 30),
            "remediation_status": "open", "ai_generated": True,
        },
        {
            "id": str(uuid.uuid4()), "audit_id": "AUD-ISO-2024",
            "title": "Threat Intelligence Program Absent",
            "severity": "high", "finding_type": "deficiency",
            "description": "No formal threat intelligence program exists per ISO 27001:2022 A.5.7. Threat intelligence data is not systematically informing risk assessments or control updates.",
            "root_cause": "Budget constraints have prevented investment in a formal threat intelligence capability.",
            "recommendation": "Subscribe to FS-ISAC feeds and implement a threat intelligence platform. Integrate with SIEM for automated IoC ingestion.",
            "remediation_owner": "James Rodriguez",
            "remediation_due": datetime(2025, 9, 30),
            "remediation_status": "open", "ai_generated": True,
        },
    ]

    for fd in sox_findings + iso_findings:
        finding = AuditFinding(**fd)
        db.add(finding)

    # ── Policies ──────────────────────────────────────────────────────────────
    policies_data = [
        {
            "id": str(uuid.uuid4()), "policy_id": "POL-001",
            "name": "Information Security Policy", "version": "4.2",
            "category": "information_security", "status": "published",
            "owner": "CISO", "approver": "CEO",
            "description": "Master information security policy establishing security requirements across the organization.",
            "scope": "All employees, contractors, and third parties with access to company systems",
            "framework_refs": ["ISO 27001 A.5.1", "NIST-CSF GV.PO-01"],
            "acknowledgment_required": True, "acknowledgment_rate": 94.2,
            "effective_date": datetime(2024, 1, 1),
            "review_date": datetime(2025, 1, 1),
        },
        {
            "id": str(uuid.uuid4()), "policy_id": "POL-002",
            "name": "Acceptable Use Policy", "version": "3.1",
            "category": "acceptable_use", "status": "published",
            "owner": "CISO", "approver": "CPO",
            "description": "Defines acceptable use of company technology assets, networks, and data.",
            "scope": "All employees and contractors",
            "framework_refs": ["ISO 27001 A.6.2", "PCI-DSS 12.4"],
            "acknowledgment_required": True, "acknowledgment_rate": 97.8,
            "effective_date": datetime(2024, 3, 1),
            "review_date": datetime(2025, 3, 1),
        },
        {
            "id": str(uuid.uuid4()), "policy_id": "POL-003",
            "name": "Data Classification & Handling Policy", "version": "2.3",
            "category": "data_governance", "status": "published",
            "owner": "Chief Data Officer", "approver": "CISO",
            "description": "Defines data classification tiers (Public, Internal, Confidential, Restricted) and handling requirements for each tier including encryption, access control, and disposal.",
            "scope": "All data assets owned or processed by Acme Bank Corp",
            "framework_refs": ["PCI-DSS 3.1", "ISO 27001 A.5.12", "GDPR Art.25"],
            "acknowledgment_required": True, "acknowledgment_rate": 88.5,
            "effective_date": datetime(2024, 6, 1),
            "review_date": datetime(2025, 6, 1),
        },
        {
            "id": str(uuid.uuid4()), "policy_id": "POL-004",
            "name": "Incident Response Policy", "version": "2.0",
            "category": "incident_response", "status": "published",
            "owner": "VP Security Operations", "approver": "CISO",
            "description": "Defines incident classification, response procedures, escalation paths, and regulatory notification requirements.",
            "scope": "Security Operations Center and all incident responders",
            "framework_refs": ["NIST-CSF RS.RP-1", "ISO 27001 A.16.1", "FFIEC"],
            "acknowledgment_required": True, "acknowledgment_rate": 100.0,
            "effective_date": datetime(2024, 2, 1),
            "review_date": datetime(2025, 2, 1),
        },
        {
            "id": str(uuid.uuid4()), "policy_id": "POL-005",
            "name": "Third-Party Vendor Security Policy", "version": "1.5",
            "category": "vendor_management", "status": "published",
            "owner": "Linda Thompson", "approver": "CISO",
            "description": "Security requirements for third-party vendors including due diligence, contract requirements, and ongoing monitoring.",
            "scope": "All vendors with access to company data or systems",
            "framework_refs": ["ISO 27001 A.15.1", "FFIEC D5.TM.B", "SOC 2"],
            "acknowledgment_required": False, "acknowledgment_rate": 0.0,
            "effective_date": datetime(2024, 4, 1),
            "review_date": datetime(2025, 4, 1),
        },
        {
            "id": str(uuid.uuid4()), "policy_id": "POL-006",
            "name": "Cryptography & Key Management Policy", "version": "1.2",
            "category": "cryptography", "status": "review",
            "owner": "Marcus Williams", "approver": "CISO",
            "description": "Defines approved cryptographic algorithms, key management lifecycle, and HSM usage requirements.",
            "scope": "All systems processing or storing sensitive data",
            "framework_refs": ["PCI-DSS 3.6", "ISO 27001 A.10.1", "NIST SP 800-57"],
            "acknowledgment_required": False, "acknowledgment_rate": 0.0,
            "review_date": datetime(2025, 12, 31),
        },
    ]

    for pd in policies_data:
        existing = db.query(Policy).filter_by(policy_id=pd["policy_id"]).first()
        if existing:
            for k, v in pd.items():
                setattr(existing, k, v)
        else:
            db.add(Policy(**pd))

    db.commit()

    # ── Vendors ───────────────────────────────────────────────────────────────
    from app.models.vendor import Vendor
    vendors_data = [
        {"id": "v-001", "name": "AWS (Amazon Web Services)", "vendor_type": "cloud", "category": "technology", "risk_tier": 1, "risk_score": 72.0, "primary_contact": "AWS Enterprise Support", "contact_email": "enterprise@aws.amazon.com", "country": "United States", "data_access": True, "data_types": ["financial", "pii", "confidential"], "certifications": ["SOC 2", "ISO 27001", "PCI-DSS", "FedRAMP"], "assessment_score": 85.0, "status": "active", "services_provided": ["Cloud Infrastructure", "Storage", "Compute", "Databases"], "issues_count": 2, "critical_issues": 0},
        {"id": "v-002", "name": "Okta Identity Platform", "vendor_type": "saas", "category": "security", "risk_tier": 1, "risk_score": 68.0, "primary_contact": "Okta Support", "contact_email": "support@okta.com", "country": "United States", "data_access": True, "data_types": ["pii", "credentials"], "certifications": ["SOC 2", "ISO 27001"], "assessment_score": 88.0, "status": "active", "services_provided": ["Identity & Access Management", "MFA", "SSO"], "issues_count": 1, "critical_issues": 0},
        {"id": "v-003", "name": "Splunk SIEM", "vendor_type": "saas", "category": "security", "risk_tier": 2, "risk_score": 55.0, "primary_contact": "Splunk Account Manager", "contact_email": "enterprise@splunk.com", "country": "United States", "data_access": True, "data_types": ["logs", "confidential"], "certifications": ["SOC 2", "ISO 27001"], "assessment_score": 79.0, "status": "active", "services_provided": ["SIEM", "Log Management", "Security Analytics"], "issues_count": 3, "critical_issues": 1},
        {"id": "v-004", "name": "Deloitte Risk Advisory", "vendor_type": "consulting", "category": "financial", "risk_tier": 2, "risk_score": 40.0, "primary_contact": "Engagement Manager", "contact_email": "grc@deloitte.com", "country": "United States", "data_access": True, "data_types": ["financial", "confidential"], "certifications": ["ISO 27001"], "assessment_score": 92.0, "status": "active", "services_provided": ["External Audit", "Risk Consulting", "Regulatory Advisory"], "issues_count": 0, "critical_issues": 0},
        {"id": "v-005", "name": "Qualys Vulnerability Management", "vendor_type": "saas", "category": "security", "risk_tier": 2, "risk_score": 60.0, "primary_contact": "Qualys Support", "contact_email": "support@qualys.com", "country": "United States", "data_access": True, "data_types": ["system_data", "vulnerabilities"], "certifications": ["SOC 2", "ISO 27001", "PCI-DSS"], "assessment_score": 81.0, "status": "active", "services_provided": ["Vulnerability Scanning", "Patch Management", "Compliance Monitoring"], "issues_count": 1, "critical_issues": 0},
    ]
    for vd in vendors_data:
        existing = db.query(Vendor).filter_by(id=vd["id"]).first()
        if not existing:
            db.add(Vendor(**vd))

    # ── Incidents ─────────────────────────────────────────────────────────────
    from app.models.incident import Incident
    incidents_data = [
        {"id": "inc-001", "title": "Ransomware Detected on Workstation Fleet", "description": "Security team detected ransomware activity on 3 workstations in the trading floor network segment.", "incident_type": "cyberattack", "severity": "critical", "status": "resolved", "category": "cyber", "detected_at": datetime(2026, 3, 15, 9, 30), "reporter": "SOC Analyst", "assigned_to": "CISO", "financial_impact": 45000.0, "affected_systems": ["Trading Workstations", "Network Segment B"], "affected_users_count": 12, "data_compromised": False, "regulatory_notification_required": True, "root_cause": "Phishing email opened by trading desk employee. MFA bypass via session token theft.", "lessons_learned": "Enhanced phishing training deployed. EDR rules updated.", "regulatory_frameworks": ["PCI-DSS", "SOX"]},
        {"id": "inc-002", "title": "Third-Party Data Exposure via Vendor API", "description": "Customer PII data was inadvertently exposed through an unsecured vendor API endpoint for 6 hours.", "incident_type": "data_breach", "severity": "high", "status": "closed", "category": "vendor", "detected_at": datetime(2026, 2, 8, 14, 15), "reporter": "Vendor Security Team", "assigned_to": "GRC Manager Analyst", "financial_impact": 125000.0, "affected_systems": ["Customer Portal", "Vendor Integration API"], "affected_users_count": 847, "data_compromised": True, "data_types_affected": ["pii", "account_numbers"], "regulatory_notification_required": True, "regulatory_notified_at": datetime(2026, 2, 9, 10, 0), "root_cause": "Missing authentication on vendor webhook endpoint. Access controls not reviewed post-deployment.", "regulatory_frameworks": ["GDPR", "CCPA-CPRA", "PCI-DSS"]},
        {"id": "inc-003", "title": "Core Banking System Outage - 4 Hours", "description": "Unplanned outage of core banking system due to failed database failover during maintenance window.", "incident_type": "system_outage", "severity": "high", "status": "resolved", "category": "operational", "detected_at": datetime(2026, 4, 2, 2, 0), "reporter": "NOC", "assigned_to": "Infrastructure Lead", "financial_impact": 380000.0, "affected_systems": ["Core Banking", "ATM Network", "Mobile Banking App"], "affected_users_count": 15000, "data_compromised": False, "regulatory_notification_required": True, "root_cause": "Database failover misconfiguration introduced during patching. Backup verification not completed.", "regulatory_frameworks": ["Basel III", "FFIEC-CAT", "DORA"]},
    ]
    for id_data in incidents_data:
        existing = db.query(Incident).filter_by(id=id_data["id"]).first()
        if not existing:
            db.add(Incident(**id_data))

    # ── Notifications ─────────────────────────────────────────────────────────
    from app.models.notification import Notification
    notifications_data = [
        {"id": "notif-001", "title": "DORA Compliance Below 65%", "body": "Digital Operational Resilience Act compliance has dropped to 62.3%. Q2 2026 deadline at risk. Immediate action required.", "notification_type": "critical", "category": "compliance", "entity_type": "framework", "entity_id": "fw-dora", "read": False},
        {"id": "notif-002", "title": "Quarterly Audit Due in 7 Days", "body": "Q2 2026 automated compliance audit is scheduled for June 1, 2026. Ensure all controls have recent evidence collected.", "notification_type": "warning", "category": "audit", "entity_type": "audit", "read": False},
        {"id": "notif-003", "title": "3 Controls Overdue for Testing", "body": "Controls CTRL-NET-001, CTRL-BC-001, and CTRL-DLP-001 have not been tested in the required timeframe.", "notification_type": "alert", "category": "control", "entity_type": "control", "read": False},
        {"id": "notif-004", "title": "New Incident Requires Assignment", "body": "Incident INC-2026-004 'Suspicious Login Attempts from Foreign IPs' has been opened and requires investigation assignment.", "notification_type": "warning", "category": "incident", "entity_type": "incident", "read": True},
        {"id": "notif-005", "title": "Vendor Assessment Overdue: Splunk", "body": "Splunk SIEM annual vendor assessment is 45 days overdue. Risk score may be understated.", "notification_type": "alert", "category": "vendor", "entity_type": "vendor", "entity_id": "v-003", "read": False},
    ]
    for nd in notifications_data:
        existing = db.query(Notification).filter_by(id=nd["id"]).first()
        if not existing:
            db.add(Notification(**nd))

    db.commit()
    print(f"Seeded: {len(controls_data)} controls, {len(risks_data)} risks, "
          f"{len(audits_data)} audits, {len(policies_data)} policies, {len(frameworks_data)} frameworks, "
          f"{len(vendors_data)} vendors, {len(incidents_data)} incidents, {len(notifications_data)} notifications")
    db.close()


CTRL_IAM_001_CODE = """# GRC-as-Code: Privileged Access Management
# Control: CTRL-IAM-001
# Framework: PCI-DSS 8.2, SOX CC6.1, ISO 27001 A.9.2

control:
  id: CTRL-IAM-001
  name: Privileged Access Management
  type: preventive
  automation: full

testing:
  method: api
  frequency: continuous
  integrations:
    - source: okta
      endpoint: /api/v1/users
      filters:
        role: admin
      assertions:
        - field: profile.mfaEnabled
          operator: equals
          expected: true
        - field: credentials.provider.type
          operator: not_equals
          expected: PASSWORD
    - source: okta
      endpoint: /api/v1/logs
      filters:
        eventType: user.session.start
      assertions:
        - field: context.ipAddress
          operator: in_allowlist
          list: approved_ip_ranges

remediation:
  auto_revoke_orphaned: true
  orphan_threshold_days: 7
  alert_channel: "#security-alerts"
  escalation_path:
    - iam-team@bank.com
    - ciso@bank.com
"""


if __name__ == "__main__":
    seed()
