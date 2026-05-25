import { Code2, GitBranch, Play, CheckCircle2, Zap, BookOpen } from 'lucide-react'
import Header from '../components/Header'

const EXAMPLE_CONTROL = `# GRC-as-Code Example — Control Definition
# Framework: PCI-DSS 8.4, FFIEC D1.AC.Ac.B, NIST-CSF PR.AC-7

control:
  id: CTRL-IAM-003
  name: Multi-Factor Authentication
  type: preventive
  category: identity_management
  owner: iam-team@bank.com
  automation: full

assertions:
  - id: mfa-enrollment-rate
    description: All users must have MFA enrolled
    source: okta
    endpoint: /api/v1/users
    assertion:
      field: credentials.provider.type
      operator: not_equals
      value: PASSWORD
    threshold:
      minimum_pass_rate: 0.99  # 99% of users must pass
      severity_if_below: critical

  - id: mfa-method-strength
    description: SMS-only MFA is disallowed
    source: okta
    endpoint: /api/v1/users
    assertion:
      field: factors[].factorType
      operator: contains_any
      values: [token:software:totp, push]
    threshold:
      minimum_pass_rate: 0.95

evidence:
  auto_collect: true
  sources:
    - okta
    - azure_ad
  retention_days: 365
  format: json_export

remediation:
  auto_disable_non_compliant: false  # alert only, no auto-action
  alert_channel: "#iam-alerts"
  escalation_path:
    - level: 1
      owner: iam-team@bank.com
      sla_hours: 24
    - level: 2
      owner: ciso@bank.com
      sla_hours: 4

testing:
  frequency: continuous
  report_to:
    - soc2_audit
    - pci_dss_assessment
    - ffiec_cat

metadata:
  created: 2024-01-15
  last_updated: 2025-01-10
  version: "2.1"
  tags: [identity, authentication, pci, sox, ffiec]
`

const EXAMPLE_RISK = `# GRC-as-Code — Risk Definition
# Threat-informed risk with Basel III taxonomy

risk:
  id: RISK-CYB-001
  title: Ransomware Attack on Core Banking Systems
  category: cyber
  basel_event_type: clients_products_business_practices
  business_line: retail_banking

threat_model:
  actor: ransomware_as_a_service
  tactics: [initial_access, execution, impact]
  techniques:
    - T1566.001  # Phishing: Spearphishing Attachment
    - T1486      # Data Encrypted for Impact
  likelihood_basis: >
    FS-ISAC Q4 2024 threat report indicates 340% increase
    in ransomware targeting financial institutions.
    Our sector peers experienced 3 incidents in last 12 months.

scoring:
  inherent:
    likelihood: 4
    impact: 5
    rationale: High likelihood based on threat intel; catastrophic
               impact on payment processing continuity
  residual:
    likelihood: 2
    impact: 5
    rationale: EDR, backup immutability, and IR retainer reduce
               likelihood. Impact unchanged.

financial_exposure:
  methodology: monte_carlo
  simulations: 10000
  distribution: lognormal
  parameters:
    low_usd: 5_000_000
    expected_usd: 18_000_000
    high_usd: 50_000_000
  regulatory_exposure_usd: 10_000_000

mitigating_controls:
  - CTRL-EDR-001   # Endpoint Detection & Response
  - CTRL-BCP-001   # Backup & Recovery
  - CTRL-IR-001    # Incident Response
  - CTRL-LOG-001   # SIEM & Monitoring

kris:
  - name: phishing_click_rate
    threshold_amber: 0.05
    threshold_red: 0.10
    source: phishing_simulation_platform
  - name: unpatched_critical_vulns
    threshold_amber: 5
    threshold_red: 15
    source: qualys
`

const PIPELINE_EXAMPLE = `# CI/CD Pipeline — GRC Control Testing
# .github/workflows/grc-controls.yml

name: GRC Control Testing

on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM UTC
  push:
    paths:
      - 'controls/**/*.yaml'

jobs:
  test-controls:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run GRC Control Tests
        run: |
          grc test \\
            --controls controls/ \\
            --output junit \\
            --fail-on-critical \\
            --evidence-dir ./evidence

      - name: Publish Evidence to GRC Platform
        run: |
          grc evidence push \\
            --dir ./evidence \\
            --platform https://grc.internal \\
            --audit-id \${{ vars.CURRENT_AUDIT_ID }}

      - name: Update Compliance Dashboard
        run: |
          grc report \\
            --framework pci-dss,sox,iso27001 \\
            --send-to compliance-team@bank.com
`

const features = [
  {
    icon: GitBranch,
    title: 'Version-Controlled Controls',
    desc: 'Controls defined in YAML live in your Git repo. Every change is auditable, reviewable, and deployable via CI/CD.',
  },
  {
    icon: Play,
    title: 'Automated Testing Pipeline',
    desc: 'Control tests run automatically on every commit and on schedule. No manual testing. No screenshots.',
  },
  {
    icon: CheckCircle2,
    title: 'Continuous Evidence Collection',
    desc: 'Evidence collected automatically from Okta, AWS, Qualys, Splunk, and 40+ integrations. Stored, indexed, and audit-ready.',
  },
  {
    icon: Zap,
    title: 'Shift-Left Compliance',
    desc: 'Engineers can test GRC compliance in their local dev environment before merging. Compliance is a PR check, not a quarterly exercise.',
  },
]

export default function GRCAsCode() {
  return (
    <div className="flex-1 overflow-y-auto animate-fade-in">
      <Header
        title="GRC-as-Code"
        subtitle="Define, test, and deploy controls as version-controlled code — the engineering way"
      />

      <div className="p-8 space-y-8">
        {/* Hero */}
        <div className="card bg-gradient-to-br from-brand-900/30 to-slate-900 border-brand-700/30">
          <div className="flex items-start gap-5">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center shrink-0">
              <Code2 className="w-6 h-6 text-brand-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 mb-2">GRC Engineering Manifesto in Practice</h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                GRC-as-Code means your controls, risks, and policies are code artifacts — versioned in Git,
                tested in CI/CD, reviewed in pull requests, and deployed automatically. This eliminates manual toil,
                creates a continuous feedback loop, and brings GRC into the modern software delivery lifecycle.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                <Icon className="w-4.5 h-4.5 text-brand-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100 mb-1">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Code examples */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-semibold text-slate-100">Control Definition (YAML)</h3>
              <span className="text-xs text-slate-500 ml-auto">controls/identity/CTRL-IAM-003.yaml</span>
            </div>
            <pre className="code-block overflow-auto max-h-80">{EXAMPLE_CONTROL}</pre>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-semibold text-slate-100">Threat-Informed Risk Definition (YAML)</h3>
              <span className="text-xs text-slate-500 ml-auto">risks/cyber/RISK-CYB-001.yaml</span>
            </div>
            <pre className="code-block overflow-auto max-h-80" style={{ color: '#fcd34d' }}>{EXAMPLE_RISK}</pre>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Play className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-100">CI/CD Pipeline Integration</h3>
              <span className="text-xs text-slate-500 ml-auto">.github/workflows/grc-controls.yml</span>
            </div>
            <pre className="code-block overflow-auto max-h-64" style={{ color: '#86efac' }}>{PIPELINE_EXAMPLE}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
