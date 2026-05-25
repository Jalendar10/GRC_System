import { useEffect, useState } from 'react'
import { Settings as SettingsIcon, Bot, CheckCircle2, XCircle, Eye, EyeOff, Trash2, Zap, Key, Server, ChevronDown, Activity, Plus, Globe } from 'lucide-react'
import Header from '../components/Header'
import { settings as settingsApi } from '../lib/api'
import type { AIProviderConfig, ProviderOption } from '../lib/types'
import { cn } from '../lib/utils'

const PROVIDER_META: Record<string, { color: string; border: string; bg: string; icon: string; desc: string }> = {
  anthropic: { color: 'text-orange-400', border: 'border-orange-500/40', bg: 'bg-orange-500/10', icon: '🤖', desc: 'Claude Opus, Sonnet, Haiku — best for complex GRC analysis' },
  openai: { color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10', icon: '⚡', desc: 'GPT-4o, o1 — OpenAI\'s flagship models' },
  google: { color: 'text-blue-400', border: 'border-blue-500/40', bg: 'bg-blue-500/10', icon: '✨', desc: 'Gemini 1.5 Pro/Flash — Google\'s multimodal AI' },
  mistral: { color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/10', icon: '🌊', desc: 'Mistral Large/Medium — European AI excellence' },
  cohere: { color: 'text-cyan-400', border: 'border-cyan-500/40', bg: 'bg-cyan-500/10', icon: '🔮', desc: 'Command R+ — enterprise-grade AI' },
  azure_openai: { color: 'text-sky-400', border: 'border-sky-500/40', bg: 'bg-sky-500/10', icon: '☁️', desc: 'Azure-hosted OpenAI — enterprise compliance & data residency' },
}

const PROVIDER_NAMES: Record<string, string> = {
  anthropic: 'Anthropic Claude', openai: 'OpenAI GPT', google: 'Google Gemini',
  mistral: 'Mistral AI', cohere: 'Cohere Command', azure_openai: 'Azure OpenAI',
}

export default function Settings() {
  const [configs, setConfigs] = useState<AIProviderConfig[]>([])
  const [activeConfig, setActiveConfig] = useState<AIProviderConfig | null>(null)
  const [providerOptions, setProviderOptions] = useState<ProviderOption[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedProvider, setSelectedProvider] = useState('anthropic')
  const [selectedModel, setSelectedModel] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [apiBaseUrl, setApiBaseUrl] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [activatingId, setActivatingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await settingsApi.listProviders()
      setConfigs(data.configs || [])
      setActiveConfig(data.active || null)
      setProviderOptions(data.provider_options || [])
      if (data.provider_options?.length && !selectedModel) {
        const firstProvider = data.provider_options.find((p: ProviderOption) => p.id === selectedProvider)
        if (firstProvider?.models?.length) setSelectedModel(firstProvider.models[0])
      }
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const currentProviderOption = providerOptions.find(p => p.id === selectedProvider)
  const availableModels = currentProviderOption?.models || []

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider)
    setTestResult(null)
    setApiKey('')
    setApiBaseUrl('')
    const opt = providerOptions.find(p => p.id === provider)
    if (opt?.models?.length) setSelectedModel(opt.models[0])
  }

  const testConnection = async () => {
    if (!apiKey) return
    setTesting(true)
    setTestResult(null)
    try {
      const result = await settingsApi.testProvider({
        provider: selectedProvider,
        model: selectedModel,
        api_key: apiKey,
        ...(selectedProvider === 'azure_openai' && apiBaseUrl ? { api_base_url: apiBaseUrl } : {}),
      })
      setTestResult(result)
    } catch (e: any) {
      setTestResult({ success: false, message: e.response?.data?.detail || 'Connection failed' })
    } finally { setTesting(false) }
  }

  const saveAndActivate = async () => {
    if (!testResult?.success) return
    setSaving(true)
    try {
      await settingsApi.saveProvider({
        provider: selectedProvider,
        model: selectedModel,
        api_key: apiKey,
        activate: true,
        ...(selectedProvider === 'azure_openai' && apiBaseUrl ? { api_base_url: apiBaseUrl } : {}),
      })
      setApiKey('')
      setTestResult(null)
      await load()
    } catch (e: any) {
      setTestResult({ success: false, message: e.response?.data?.detail || 'Save failed' })
    } finally { setSaving(false) }
  }

  const activate = async (id: string) => {
    setActivatingId(id)
    try { await settingsApi.activateProvider(id); await load() }
    finally { setActivatingId(null) }
  }

  const remove = async (id: string) => {
    setDeletingId(id)
    try { await settingsApi.deleteProvider(id); await load() }
    finally { setDeletingId(null) }
  }

  return (
    <div className="flex-1 overflow-y-auto animate-fade-in">
      <Header title="Settings" subtitle="Configure AI providers, API keys, and platform preferences" loading={loading} onRefresh={load} />

      <div className="p-8 space-y-8 max-w-5xl">
        {/* Active provider banner */}
        {activeConfig && (
          <div className="card border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-emerald-300">AI Provider Active</div>
                <div className="text-xs text-slate-400">
                  {PROVIDER_META[activeConfig.provider]?.icon} {activeConfig.display_name} — {activeConfig.model}
                  <span className="ml-2 text-slate-500">({activeConfig.api_key_masked})</span>
                </div>
              </div>
              <div className="ml-auto text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                ● LIVE
              </div>
            </div>
          </div>
        )}

        {/* AI Provider Configuration */}
        <div>
          <h2 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
            <Bot className="w-5 h-5 text-brand-400" /> AI Provider Configuration
          </h2>
          <p className="text-sm text-slate-500 mb-4">Select your AI provider, enter your API key, test the connection, then save to activate.</p>

          {/* Provider grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {Object.entries(PROVIDER_META).map(([id, meta]) => (
              <button
                key={id}
                onClick={() => handleProviderChange(id)}
                className={cn(
                  'p-3 rounded-xl border text-left transition-all',
                  selectedProvider === id
                    ? `${meta.bg} ${meta.border} ring-1 ring-offset-0 ring-brand-500/30`
                    : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{meta.icon}</span>
                  <span className={cn('text-xs font-bold', selectedProvider === id ? meta.color : 'text-slate-300')}>
                    {PROVIDER_NAMES[id]}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-tight">{meta.desc}</p>
              </button>
            ))}
          </div>

          {/* Config form */}
          <div className="card space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span>{PROVIDER_META[selectedProvider]?.icon}</span> Configure {PROVIDER_NAMES[selectedProvider]}
            </h3>

            {/* Model selector */}
            <div>
              <label className="label block mb-1.5">Model</label>
              <select
                className="select w-full max-w-xs"
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
              >
                {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* API Key */}
            <div>
              <label className="label block mb-1.5">API Key</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-md">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showKey ? 'text' : 'password'}
                    className="input w-full pl-9 pr-10 font-mono text-sm"
                    placeholder={`Enter your ${PROVIDER_NAMES[selectedProvider]} API key...`}
                    value={apiKey}
                    onChange={e => { setApiKey(e.target.value); setTestResult(null) }}
                  />
                  <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                <span>🔒</span> Keys are stored securely and masked in the UI
              </p>
            </div>

            {/* Azure endpoint URL */}
            {selectedProvider === 'azure_openai' && (
              <div>
                <label className="label block mb-1.5">Azure Endpoint URL</label>
                <div className="relative max-w-md">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    className="input w-full pl-9"
                    placeholder="https://your-resource.openai.azure.com/"
                    value={apiBaseUrl}
                    onChange={e => setApiBaseUrl(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Test result */}
            {testResult && (
              <div className={cn(
                'flex items-start gap-2 p-3 rounded-xl border text-sm',
                testResult.success
                  ? 'bg-emerald-950/30 border-emerald-700/40 text-emerald-300'
                  : 'bg-red-950/30 border-red-700/40 text-red-300'
              )}>
                {testResult.success
                  ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  : <XCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
              <button
                onClick={testConnection}
                disabled={!apiKey || testing || (selectedProvider === 'azure_openai' && !apiBaseUrl)}
                className="btn-secondary text-sm"
              >
                {testing ? <><Activity className="w-4 h-4 animate-spin" /> Testing…</> : <><Zap className="w-4 h-4" /> Test Connection</>}
              </button>
              <button
                onClick={saveAndActivate}
                disabled={!testResult?.success || saving}
                className="btn-primary text-sm"
              >
                {saving ? <><Activity className="w-4 h-4 animate-spin" /> Saving…</> : <><CheckCircle2 className="w-4 h-4" /> Save & Activate</>}
              </button>
              {testResult?.success && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Test passed — ready to save
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Saved configurations */}
        {configs.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-slate-100 mb-1 flex items-center gap-2">
              <Server className="w-5 h-5 text-brand-400" /> Saved Configurations
            </h2>
            <p className="text-sm text-slate-500 mb-4">Manage your saved AI provider configurations.</p>
            <div className="space-y-2">
              {configs.map(c => {
                const meta = PROVIDER_META[c.provider]
                return (
                  <div
                    key={c.id}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-xl border transition-all',
                      c.is_active ? 'bg-emerald-950/20 border-emerald-700/40' : 'bg-slate-800/40 border-slate-700/40'
                    )}
                  >
                    <span className="text-xl">{meta?.icon || '🤖'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-sm font-semibold', meta?.color || 'text-slate-300')}>{c.display_name}</span>
                        <span className="text-xs text-slate-500">/ {c.model}</span>
                        {c.is_active && (
                          <span className="badge bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs">
                            ● Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{c.api_key_masked}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!c.is_active && (
                        <button
                          onClick={() => activate(c.id)}
                          disabled={activatingId === c.id}
                          className="btn-secondary text-xs"
                        >
                          {activatingId === c.id ? <Activity className="w-3 h-3 animate-spin" /> : 'Set Active'}
                        </button>
                      )}
                      <button
                        onClick={() => remove(c.id)}
                        disabled={deletingId === c.id}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                      >
                        {deletingId === c.id ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Platform info */}
        <div className="card bg-slate-800/30">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-brand-400" /> Platform Information
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
            {[
              ['Platform', 'GRC Engineering Platform v1.0'],
              ['Organization', 'Acme Bank Corp — Financial Services'],
              ['Database', 'SQLite (dev) / CockroachDB (prod)'],
              ['Compliance Frameworks', '25+ frameworks supported'],
              ['Audit Types', '30+ audit types'],
              ['AI Integration', 'Multi-provider: Anthropic, OpenAI, Gemini, Mistral, Cohere, Azure'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-500">{k}</span>
                <span className="text-slate-300 font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
