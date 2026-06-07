import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorBanner, PageHeader } from '../components/UI'
import { api, errorMessage } from '../lib/api'

export function NewObservationPage() {
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [submittedBy, setSubmittedBy] = useState('')
  const [department, setDepartment] = useState('Customer Success')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault(); setSubmitting(true); setError('')
    try { const result = await api.createObservation({ text, submitted_by: submittedBy, department: department || undefined }); navigate(`/observations/${result.id}`) }
    catch (err) { setError(errorMessage(err)) } finally { setSubmitting(false) }
  }
  return <div className="page narrow-page"><PageHeader eyebrow="Capture a signal" title="Share an operational observation" description="SynapseOS connects your signal to related issues, prior work, and proven solutions." />{error && <ErrorBanner message={error} />}<form className="card observation-form" onSubmit={submit}><label>What are you observing?<textarea value={text} onChange={e => setText(e.target.value)} minLength={10} required placeholder="Describe the issue, pattern, or opportunity with enough context for other teams..." /><span>{text.length} characters · minimum 10</span></label><div className="form-grid"><label>Your name<input value={submittedBy} onChange={e => setSubmittedBy(e.target.value)} required placeholder="Jane Smith" /></label><label>Department<input value={department} onChange={e => setDepartment(e.target.value)} placeholder="Customer Success" /></label></div><div className="form-actions"><button className="secondary-button" type="button" onClick={() => navigate('/')}>Cancel</button><button className="primary-button" disabled={submitting}>{submitting ? 'Submitting…' : 'Analyze observation'}</button></div></form></div>
}
