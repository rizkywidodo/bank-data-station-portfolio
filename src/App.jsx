import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import Dashboard from './components/Dashboard'
import { SAMPLE_DATA } from './data/sampleData'
import ReportPage from './components/ReportPage'
import ReportListPage from './components/ReportListPage'

const parseRows = (rows) => rows
  .filter(r => r.Name && r.Stasiun)
  .map((r, idx) => ({
    id:  idx + 1,
    id2: parseInt(r['ID2']) || 0,
    tglRaw: (() => {
      const raw = r['Completion time']
      if (!raw) return 0
      const d = new Date(raw)
      return isNaN(d) ? 0 : d.getTime()
    })(),
    tgl: (() => {
      const raw = r['Completion time']
      if (!raw) return ''
      const d = new Date(raw)
      if (isNaN(d)) return raw
      return d.toLocaleDateString('id-ID', { weekday:'long', day:'2-digit', month:'2-digit', year:'numeric' })
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
  const [data, setData]     = useState(SAMPLE_DATA)
  const [loading, setLoading] = useState(true)
  const [page, setPage]     = useState('dashboard')
  const [selectedAA, setSelectedAA] = useState(null)
  const [reportFilterStasiun, setReportFilterStasiun] = useState(null)

  useEffect(() => {
    fetch('/data.csv')
      .then(r => r.text())
      .then(csv => {
        const result = Papa.parse(csv, { header: true, skipEmptyLines: true })
        setData(parseRows(result.data))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const navigate = (p, aa = null) => { setPage(p); setSelectedAA(aa); window.scrollTo(0,0) }

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'Inter,sans-serif',color:'#6B7280'}}>
      Memuat data...
    </div>
  )

  if (page === 'report' && selectedAA) return <ReportPage data={data} nama={selectedAA} onBack={() => navigate('report')} lastUpload={null} />
  if (page === 'report') return <ReportListPage data={data} onSelect={(nama) => navigate('report', nama)} onBack={() => navigate('dashboard')} lastUpload={null} initialStasiun={reportFilterStasiun} onStasiunChange={setReportFilterStasiun} />
  return <Dashboard data={data} onUpload={null} uploading={false} lastUpload={null} onNavigate={navigate} />
}