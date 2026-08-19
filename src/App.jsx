import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'
import Dashboard from './components/Dashboard'
import { SAMPLE_DATA } from './data/sampleData'
import ReportListPage from './components/ReportListPage'
import ReportPage from './components/ReportPage'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
const PASSWORD = import.meta.env.VITE_APP_PASSWORD

const parseRows = (rows) => rows
  .filter(r => r.Name && r.Stasiun)
  .map((r, idx) => ({
  id:  idx + 1,
  id2: parseInt(r['ID2']) || 0,
  
  tgl: (() => {
  const raw = r['Completion time']
  if (!raw) return ''
  const d = new Date(raw)
  if (isNaN(d)) return raw
  return d.toLocaleDateString('id-ID', { weekday:'long', day:'2-digit', month:'2-digit', year:'numeric' })
})(),
tglRaw: (() => {
  const raw = r['Completion time']
  if (!raw) return 0
  const d = new Date(raw)
  return isNaN(d) ? 0 : d.getTime()
})(),
  bulan:           r.Bulan || '',
  nama:            r.Name || '',
  stasiun:         r.Stasiun || '',
  shift:           r.Shift || '',
  kategori:        r['Klasifikasi Laporan'] || '',
  subkategoriAsli: r['Sub Kategori'] || '',
  subkategori: (() => {
    const raw = r['Sub Kategori'] || ''
    const toGangguan = ['Gangguan Gate & Mesin Tiket','Gangguan Lift & Eskalator','Gangguan Sistem Digital','Kerusakan Fisik']
    if (toGangguan.includes(raw)) return 'Gangguan'
    if (raw === 'Saran & Observasi') return 'Kaizen'
    return raw
  })(),
  jenisGangguan:   r['Gangguan Fasilitas'] || '',
  lokasi:          r.Lokasi || '',
  deskripsi:       r['Deskripsi Highlight'] || '',
  tindaklanjut:    r['Tindak Lanjut'] || '',
  lampiran:        r.Lampiran || '',
}))

export default function App() {
  const [data, setData]           = useState(SAMPLE_DATA)
  const [loading, setLoading]     = useState(true)
  const [uploading, setUploading] = useState(false)
  const [lastUpload, setLastUpload] = useState(null)
  const [page, setPage]           = useState('dashboard')
  const [selectedAA, setSelectedAA] = useState(null)
  const [reportFilterStasiun, setReportFilterStasiun] = useState(null)

  useEffect(() => {
  fetchLatest()
}, [])

  const navigate = (p, aa = null) => { setPage(p); setSelectedAA(aa); window.scrollTo(0,0) }

  async function fetchLatest() {
    setLoading(true)
    const { data: rows } = await supabase
      .from('bank_data')
      .select('rows, uploaded_at')
      .order('uploaded_at', { ascending: false })
      .limit(1)
      .single()
    if (rows?.rows) {
      setData(parseRows(rows.rows))
      setLastUpload(new Date(rows.uploaded_at).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }))
    }
    setLoading(false)
  }

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop().toLowerCase()
    if (ext === 'csv') {
      const text = await file.text()
      const Papa = (await import('papaparse')).default
      const result = Papa.parse(text, { header: true, skipEmptyLines: true })
      await supabase.from('bank_data').insert({ rows: result.data })
      setData(parseRows(result.data))
      setLastUpload(new Date().toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }))
      setUploading(false)
      return
    }
    const reader = new FileReader()
    reader.onload = async (e) => {
      const wb = XLSX.read(e.target.result, { type: 'array' })
      const ws = wb.Sheets['Sheet1'] || wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })
      await supabase.from('bank_data').insert({ rows })
      setData(parseRows(rows))
      setLastUpload(new Date().toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' }))
      setUploading(false)
    }
    reader.readAsArrayBuffer(file)
  }

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'Inter,sans-serif',color:'#6B7280'}}>
      Memuat data...
    </div>
  )

  if (page === 'report' && selectedAA) return <ReportPage data={data} nama={selectedAA} onBack={() => navigate('report')} lastUpload={lastUpload} />
  if (page === 'report') return <ReportListPage data={data} onSelect={(nama) => navigate('report', nama)} onBack={() => navigate('dashboard')} lastUpload={lastUpload} initialStasiun={reportFilterStasiun} onStasiunChange={setReportFilterStasiun} />
  return <Dashboard data={data} onUpload={handleUpload} uploading={uploading} lastUpload={lastUpload} onNavigate={navigate} />
}