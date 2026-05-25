"""
Automated evidence collector — simulates integrations with cloud providers,
identity systems, and security tools. In production, replace stubs with
real API calls (AWS Config, Azure Policy, Okta, CrowdStrike, etc.).
"""
import uuid
from datetime import datetime, timedelta
from typing import Optional
import random


class EvidenceCollector:
    def collect_aws_config(self, control_id: str, resource_type: str) -> dict:
        return {
            "id": str(uuid.uuid4()),
            "control_id": control_id,
            "evidence_type": "api_response",
            "source": "aws_config",
            "description": f"AWS Config compliance check for {resource_type}",
            "collected_at": datetime.utcnow().isoformat(),
            "collected_by": "automated",
            "is_automated": True,
            "metadata": {
                "compliance_type": "AWS_CONFIG_RULES",
                "resource_type": resource_type,
                "compliant_count": random.randint(45, 60),
                "non_compliant_count": random.randint(0, 5),
                "not_applicable_count": random.randint(0, 3),
            }
        }

    def collect_okta_access_review(self, control_id: str) -> dict:
        users = random.randint(1200, 1500)
        reviewed = random.randint(1100, users)
        return {
            "id": str(uuid.uuid4()),
            "control_id": control_id,
            "evidence_type": "report",
            "source": "okta",
            "description": "Okta user access review report",
            "collected_at": datetime.utcnow().isoformat(),
            "collected_by": "automated",
            "is_automated": True,
            "metadata": {
                "total_users": users,
                "reviewed": reviewed,
                "review_rate": round(reviewed / users * 100, 2),
                "terminated_users_removed": random.randint(15, 40),
                "privilege_changes": random.randint(5, 25),
            }
        }

    def collect_vulnerability_scan(self, control_id: str) -> dict:
        return {
            "id": str(uuid.uuid4()),
            "control_id": control_id,
            "evidence_type": "report",
            "source": "qualys",
            "description": "Qualys vulnerability scan results",
            "collected_at": datetime.utcnow().isoformat(),
            "collected_by": "automated",
            "is_automated": True,
            "metadata": {
                "scan_date": datetime.utcnow().strftime("%Y-%m-%d"),
                "total_assets": random.randint(800, 1200),
                "scanned_assets": random.randint(750, 800),
                "critical_vulns": random.randint(0, 3),
                "high_vulns": random.randint(2, 15),
                "medium_vulns": random.randint(20, 80),
                "low_vulns": random.randint(100, 300),
                "patch_sla_breaches": random.randint(0, 5),
            }
        }

    def collect_encryption_status(self, control_id: str) -> dict:
        total = random.randint(200, 400)
        encrypted = total - random.randint(0, 8)
        return {
            "id": str(uuid.uuid4()),
            "control_id": control_id,
            "evidence_type": "api_response",
            "source": "aws_kms",
            "description": "Data-at-rest encryption compliance status",
            "collected_at": datetime.utcnow().isoformat(),
            "collected_by": "automated",
            "is_automated": True,
            "metadata": {
                "total_data_stores": total,
                "encrypted": encrypted,
                "unencrypted": total - encrypted,
                "encryption_rate": round(encrypted / total * 100, 2),
                "kms_key_rotation_enabled": True,
                "algorithm": "AES-256",
            }
        }

    def collect_mfa_compliance(self, control_id: str) -> dict:
        users = random.randint(1200, 1500)
        mfa_enabled = users - random.randint(0, 20)
        return {
            "id": str(uuid.uuid4()),
            "control_id": control_id,
            "evidence_type": "api_response",
            "source": "okta",
            "description": "MFA enrollment status across all users",
            "collected_at": datetime.utcnow().isoformat(),
            "collected_by": "automated",
            "is_automated": True,
            "metadata": {
                "total_users": users,
                "mfa_enrolled": mfa_enabled,
                "mfa_not_enrolled": users - mfa_enabled,
                "mfa_rate": round(mfa_enabled / users * 100, 2),
                "methods": {"totp": 45, "push": 40, "sms": 15},
            }
        }

    def collect_log_retention(self, control_id: str) -> dict:
        return {
            "id": str(uuid.uuid4()),
            "control_id": control_id,
            "evidence_type": "api_response",
            "source": "splunk",
            "description": "Log retention and ingestion compliance",
            "collected_at": datetime.utcnow().isoformat(),
            "collected_by": "automated",
            "is_automated": True,
            "metadata": {
                "retention_days": 365,
                "required_days": 90,
                "daily_ingest_gb": random.randint(50, 200),
                "log_sources": random.randint(45, 80),
                "alert_rules_active": random.randint(120, 200),
                "incidents_last_30d": random.randint(2, 15),
            }
        }

    def collect_change_management(self, control_id: str) -> dict:
        total = random.randint(200, 400)
        approved = total - random.randint(0, 10)
        return {
            "id": str(uuid.uuid4()),
            "control_id": control_id,
            "evidence_type": "report",
            "source": "servicenow",
            "description": "Change management compliance report",
            "collected_at": datetime.utcnow().isoformat(),
            "collected_by": "automated",
            "is_automated": True,
            "metadata": {
                "total_changes_30d": total,
                "approved_changes": approved,
                "emergency_changes": random.randint(5, 20),
                "unauthorized_changes": total - approved,
                "change_approval_rate": round(approved / total * 100, 2),
                "avg_approval_time_hours": round(random.uniform(2, 8), 2),
            }
        }

    def auto_collect_for_control(self, control: dict) -> list:
        evidence = []
        category = control.get("category", "")
        control_id = control.get("id", "")

        collectors = {
            "access_control": [self.collect_okta_access_review, self.collect_mfa_compliance],
            "identity_management": [self.collect_okta_access_review, self.collect_mfa_compliance],
            "encryption": [self.collect_encryption_status],
            "audit_logging": [self.collect_log_retention],
            "vulnerability_management": [self.collect_vulnerability_scan],
            "change_management": [self.collect_change_management],
            "network_security": [self.collect_aws_config],
        }

        for collector in collectors.get(category, [self.collect_aws_config]):
            evidence.append(collector(control_id))

        return evidence


evidence_collector = EvidenceCollector()
