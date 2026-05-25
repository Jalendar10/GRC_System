import { createContext, useContext, useState, ReactNode } from 'react'

export interface OrgProfile {
  id: string
  name: string
  shortName: string
  type: string
  industry: string
  icon: string
  regulator: string
  jurisdiction: string
  frameworks: string[]
  auditTypes: string[]
  accentColor: string
  description: string
}

export const ORGS: OrgProfile[] = [
  {
    id: 'acme-bank',
    name: 'Acme Bank Corp',
    shortName: 'Acme Bank',
    type: 'Commercial Bank',
    industry: 'Banking & Financial Services',
    icon: '🏦',
    regulator: 'OCC / Federal Reserve / FDIC',
    jurisdiction: 'United States',
    accentColor: 'brand',
    description: 'Full-service commercial bank with retail, commercial, and investment banking divisions.',
    frameworks: [
      'PCI-DSS', 'SOX', 'Basel III', 'FFIEC-CAT', 'AML-BSA',
      'DORA', 'NIST-CSF', 'ISO 27001', 'APRA CPS 234', 'MAS TRM', 'NIST 800-53',
    ],
    auditTypes: [
      'internal', 'sox_404', 'model_risk', 'capital_adequacy', 'aml_review',
      'bsa_review', 'dora', 'it_general', 'pci_qsa', 'penetration_test', 'operational',
    ],
  },
  {
    id: 'finserv-capital',
    name: 'FinServ Capital',
    shortName: 'FinServ',
    type: 'Investment Firm',
    industry: 'Capital Markets & Wealth Management',
    icon: '📈',
    regulator: 'SEC / FINRA / CFTC',
    jurisdiction: 'United States / European Union',
    accentColor: 'emerald',
    description: 'Asset management and investment banking firm operating in US and EU capital markets.',
    frameworks: [
      'SOX', 'MiFID II', 'FINRA', 'CCAR-DFAST', 'GDPR',
      'CCPA-CPRA', 'SOC 2', 'NIST-CSF', 'ISO 27001', 'COBIT 2019',
    ],
    auditTypes: [
      'internal', 'sox_404', 'finra', 'stress_test', 'gdpr', 'ccpa',
      'soc2_t2', 'it_general', 'model_risk', 'vendor', 'operational',
    ],
  },
  {
    id: 'shield-insurance',
    name: 'Shield Insurance Co',
    shortName: 'Shield Insurance',
    type: 'Insurance Company',
    industry: 'Property & Casualty / Health Insurance',
    icon: '🛡️',
    regulator: 'NAIC / State DOI / CMS',
    jurisdiction: 'United States (All States)',
    accentColor: 'purple',
    description: 'Multi-line insurance carrier offering P&C, life, and health insurance products nationwide.',
    frameworks: [
      'HIPAA', 'SOC 2', 'SOX', 'GDPR', 'CCPA-CPRA',
      'ISO 22301', 'NIST-CSF', 'ISO 27001', 'HITRUST CSF', 'FISMA',
    ],
    auditTypes: [
      'internal', 'hipaa', 'soc2_t2', 'sox_404', 'gdpr', 'ccpa',
      'dpia', 'bcm', 'it_general', 'vendor', 'operational',
    ],
  },
]

interface OrgContextType {
  activeOrg: OrgProfile
  setActiveOrg: (org: OrgProfile) => void
  orgs: OrgProfile[]
}

const OrgContext = createContext<OrgContextType>({
  activeOrg: ORGS[0],
  setActiveOrg: () => {},
  orgs: ORGS,
})

export function OrgProvider({ children }: { children: ReactNode }) {
  const [activeOrg, setActiveOrg] = useState<OrgProfile>(ORGS[0])
  return (
    <OrgContext.Provider value={{ activeOrg, setActiveOrg, orgs: ORGS }}>
      {children}
    </OrgContext.Provider>
  )
}

export function useOrg() {
  return useContext(OrgContext)
}
