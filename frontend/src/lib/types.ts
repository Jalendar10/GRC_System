export interface DashboardSummary {
  overall_compliance_score: number
  control_effectiveness_rate: number
  automation_rate: number
  controls: {
    total: number
    effective: number
    partially_effective: number
    ineffective: number
    automated: number
  }
  risks: {
    total: number
    open: number
    critical_high: number
    mitigated: number
  }
  audits: {
    active: number
    completed: number
    open_findings: number
    critical_findings: number
  }
  policies: {
    total: number
    published: number
    avg_acknowledgment_rate: number
  }
  frameworks: Array<{
    name: string
    score: number
    status: string
  }>
}

export interface Control {
  id: string
  name: string
  description: string
  category: string
  control_type: string
  owner: string
  owner_team: string
  status: string
  effectiveness_score: number
  automation_level: string
  frequency: string
  last_tested: string | null
  next_test_due: string | null
  frameworks: string[]
  tags: string[]
  code_definition: string | null
  integration_source: string | null
  is_automated: boolean
  created_at: string
  tests?: ControlTest[]
  evidence?: ControlEvidence[]
}

export interface ControlTest {
  id: string
  test_date: string
  tester: string
  test_method: string
  result: string
  score: number
  findings: string
  ai_analysis: string
}

export interface ControlEvidence {
  id: string
  evidence_type: string
  source: string
  description: string
  collected_at: string
  is_automated: boolean
  metadata: Record<string, any>
}

export interface Risk {
  id: string
  title: string
  description: string
  category: string
  subcategory: string
  owner: string
  owner_team: string
  status: string
  inherent_likelihood: number
  inherent_impact: number
  inherent_score: number
  residual_likelihood: number
  residual_impact: number
  residual_score: number
  risk_appetite: string
  threat_actor: string | null
  threat_vector: string | null
  financial_impact_low: number | null
  financial_impact_high: number | null
  regulatory_exposure: number | null
  control_ids: string[]
  framework_refs: string[]
  business_line: string | null
  risk_event_type: string | null
  treatments: RiskTreatment[]
  created_at: string
}

export interface RiskTreatment {
  id: string
  treatment_type: string
  description: string
  owner: string
  due_date: string
  status: string
}

export interface Audit {
  id: string
  name: string
  audit_type: string
  framework: string
  scope: string
  status: string
  auditor: string
  audit_lead: string
  period_start: string | null
  period_end: string | null
  overall_score: number | null
  compliance_rate: number | null
  ai_assisted: boolean
  ai_analysis_summary: string | null
  ai_risk_narrative: string | null
  ai_recommendations: string[]
  total_findings: number
  critical_findings: number
  high_findings: number
  medium_findings: number
  low_findings: number
  control_ids: string[]
  findings: AuditFinding[]
  created_at: string
}

export interface AuditFinding {
  id: string
  title: string
  severity: string
  finding_type: string
  description: string
  root_cause: string
  recommendation: string
  remediation_owner: string
  remediation_due: string | null
  remediation_status: string
  ai_generated: boolean
}

export interface Policy {
  id: string
  policy_id: string
  name: string
  version: string
  category: string
  status: string
  owner: string
  approver: string
  description: string
  scope: string
  framework_refs: string[]
  acknowledgment_required: boolean
  acknowledgment_rate: number
  effective_date: string | null
  review_date: string | null
  created_at: string
}

export interface Framework {
  id: string
  name: string
  short_name: string
  version: string
  description: string
  category: string
  compliance_status: string
  compliance_score: number
  total_controls: number
  implemented_controls: number
}

export interface AIProviderConfig {
  id: string
  provider: string
  display_name: string
  model: string
  api_key_masked: string
  api_base_url: string | null
  is_active: boolean
  is_tested: boolean
  test_status: string | null
  test_message: string | null
  created_at: string | null
}

export interface ProviderOption {
  id: string
  name: string
  models: string[]
}
