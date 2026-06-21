import { useState, useMemo } from 'react'
import { countBy, initials } from '../hooks/useFilters'
import { COLORS } from '../data/sampleData'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import s from './ReportPage.module.css'

const BULAN_ORDER = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const BADGE = { Safety: s.bSafety, Service: s.bService, Security: s.bSecurity }

function Modal({ entry, onClose }) {
  if (!entry) return null
  const BADGE_STYLE = {
    Safety:   {background:'#EEF3FB',color:'#4472C4'},
    Service:  {background:'#FFF8E1',color:'#B38600'},
    Security: {background:'#FEF2F2',color:'#CC0000'},
  }
  const lampiranList = entry.lampiran ? entry.lampiran.split('; ').map(u => u.trim()).filter(Boolean) : []
  const isImage = url => /\.(jpg|jpeg|png|gif|webp)/i.test(url)
  const isVideo = url => /\.(mp4|mov|avi|webm)/i.test(url)
  const [lightbox, setLightbox] = useState(null)

  return (
    <>
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',zIndex:3000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
          <button onClick={() => setLightbox(null)} style={{position:'absolute',top:16,right:20,background:'rgba(255,255,255,0.15)',border:'none',color:'#fff',fontSize:18,width:36,height:36,borderRadius:'50%',cursor:'pointer'}}>✕</button>
          {isVideo(lightbox)
            ? <video src={lightbox} controls autoPlay style={{maxWidth:'90vw',maxHeight:'88vh',borderRadius:8}} onClick={e=>e.stopPropagation()}/>
            : <img src={lightbox} alt="Lampiran" style={{maxWidth:'90vw',maxHeight:'88vh',objectFit:'contain',borderRadius:8}} onClick={e=>e.stopPropagation()}/>
          }
        </div>
      )}
      <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
        <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:14,width:'100%',maxWidth:640,maxHeight:'85vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',padding:'18px 22px 14px',borderBottom:'1px solid #F3F4F6',position:'sticky',top:0,background:'#fff',zIndex:1}}>
            <div>
              <div style={{fontSize:15,fontWeight:600,color:'#0D1B2A'}}>{entry.nama}</div>
              <div style={{fontSize:12,color:'#9CA3AF',marginTop:2}}>{entry.tgl} · {entry.stasiun} · Shift {entry.shift}</div>
            </div>
            <button onClick={onClose} style={{background:'none',border:'none',fontSize:16,color:'#9CA3AF',cursor:'pointer',padding:'4px 8px',borderRadius:6}}>✕</button>
          </div>
          <div style={{padding:'18px 22px'}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14,flexWrap:'wrap'}}>
              <span style={{...BADGE_STYLE[entry.kategori],padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:600}}>{entry.kategori}</span>
              <span style={{fontSize:12,fontWeight:500,color:'#374151'}}>{entry.subkategori}</span>
              {entry.jenisGangguan && <span style={{fontSize:12,color:'#6B7280',background:'#F3F4F6',padding:'2px 10px',borderRadius:20}}>{entry.jenisGangguan}</span>}
              <span style={{fontSize:12,color:'#6B7280',background:'#F3F4F6',padding:'2px 10px',borderRadius:20}}>{entry.lokasi}</span>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:600,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:5}}>Deskripsi Highlight</div>
              <div style={{fontSize:14,color:'#374151',lineHeight:1.6}}>{entry.deskripsi || '—'}</div>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:600,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:5}}>Tindak Lanjut</div>
              <div style={{fontSize:14,color:'#374151',lineHeight:1.6}}>{entry.tindaklanjut || '—'}</div>
            </div>
            {lampiranList.length > 0 && (
              <div>
                <div style={{fontSize:11,fontWeight:600,color:'#9CA3AF',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:8}}>Lampiran ({lampiranList.length})</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:8}}>
                  {lampiranList.map((url,i) => (
                    <div key={i} style={{borderRadius:8,overflow:'hidden',border:'1px solid #E5E7EB',background:'#F8F9FA'}}>
                      {isImage(url) ? (
                        <img src={url} alt={`Lampiran ${i+1}`} onClick={()=>setLightbox(url)}
                          style={{width:'100%',maxHeight:160,objectFit:'cover',display:'block',cursor:'pointer'}}
                          onError={e=>{e.target.style.display='none'}}/>
                      ) : isVideo(url) ? (
                        <div onClick={()=>setLightbox(url)} style={{position:'relative',cursor:'pointer'}}>
                          <video src={url} style={{width:'100%',maxHeight:160,objectFit:'cover',display:'block',pointerEvents:'none'}}/>
                          <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.3)',fontSize:28,color:'#fff'}}>▶</div>
                        </div>
                      ) : (
                        <a href={url} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',justifyContent:'center',padding:24,fontSize:12,color:'#0057A8',fontWeight:500,textDecoration:'none'}}>
                          Buka Lampiran {lampiranList.length>1?i+1:''} →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default function ReportPage({ data, nama, onBack, lastUpload }) {
  const pd = useMemo(() => data.filter(d => d.nama === nama), [data, nama])
  const allNames = useMemo(() => [...new Set(data.map(d => d.nama))], [data])
  const byKat = useMemo(() => countBy(pd, 'kategori'), [pd])
  const total = pd.length

  const topSt = Object.entries(countBy(pd, 'stasiun')).sort((a,b) => b[1]-a[1])[0]
  const allBulan = [...new Set(data.map(d => d.bulan))].filter(Boolean)
  const bulanAktif = new Set(pd.map(d => d.bulan)).size
  const konsistensi = Math.round(bulanAktif / (allBulan.length || 1) * 100)

  const avgTotal = Math.round(
    allNames.map(n => data.filter(d => d.nama === n).length)
      .reduce((a,b) => a+b, 0) / (allNames.length || 1)
  )
  const rank = allNames
    .map(n => ({ n, c: data.filter(d => d.nama === n).length }))
    .sort((a,b) => b.c - a.c)
    .findIndex(x => x.n === nama) + 1

  const trendData = BULAN_ORDER
    .filter(b => allBulan.includes(b))
    .map(b => ({
      name: b.slice(0,3),
      total: pd.filter(d => d.bulan === b).length,
      Safety: pd.filter(d => d.bulan === b && d.kategori === 'Safety').length,
      Service: pd.filter(d => d.bulan === b && d.kategori === 'Service').length,
      Security: pd.filter(d => d.bulan === b && d.kategori === 'Security').length,
    }))

  const subKatData = Object.entries(countBy(pd, 'subkategori'))
    .sort((a,b) => b[1]-a[1]).slice(0,6)

  const shiftData = Object.entries(countBy(pd, 'shift'))
    .sort((a,b) => b[1]-a[1])

  const lokasiData = Object.entries(countBy(pd, 'lokasi'))
    .sort((a,b) => b[1]-a[1]).slice(0,5)

  const avgLen = pd.length
    ? Math.round(pd.reduce((acc, d) => acc + (d.deskripsi?.length || 0), 0) / pd.length)
    : 0
  const detailCount = pd.filter(d => (d.deskripsi?.length || 0) > 80).length
  const singkatCount = pd.filter(d => (d.deskripsi?.length || 0) < 30).length
  const qualityScore = Math.round((detailCount / (total || 1)) * 100)

  const recentLaporan = [...pd].sort((a,b) => b.id2 - a.id2)

  const targetBulanIni = useMemo(() => {
  const lastBulan = allBulan[allBulan.length - 1]
  if (!lastBulan) return null
  const thisMonthData = pd.filter(d => d.bulan === lastBulan)
  const target = 20 // default, bisa disesuaikan
  const pct = Math.min(Math.round(thisMonthData.length / target * 100), 100)
  return { bulan: lastBulan, total: thisMonthData.length, target, pct }
}, [pd, allBulan])

const bulanAA = BULAN_ORDER.filter(b => pd.some(d => d.bulan === b))
const firstBulanIdx = BULAN_ORDER.indexOf(bulanAA[0])
const lastBulanIdx = BULAN_ORDER.indexOf(allBulan[allBulan.length - 1])
const expectedBulan = Math.max(lastBulanIdx - firstBulanIdx + 1, 1)
const konsistensiScore = Math.min(Math.round(bulanAA.length / expectedBulan * 100), 100)

const [fBulan, setFBulan]     = useState('all')
const [fKategori, setFKategori] = useState('all')
const [fLokasi, setFLokasi]   = useState('all')
const [fPage, setFPage]       = useState(1)
const [selected, setSelected] = useState(null)
const PER_PAGE = 20

const pdBulanList   = useMemo(() => [...new Set(pd.map(d => d.bulan))].filter(Boolean).sort(), [pd])
const pdLokasiList  = useMemo(() => [...new Set(pd.map(d => d.lokasi))].filter(Boolean).sort(), [pd])

const filteredPd = useMemo(() => recentLaporan.filter(d =>
  (fBulan    === 'all' || d.bulan    === fBulan)    &&
  (fKategori === 'all' || d.kategori === fKategori) &&
  (fLokasi   === 'all' || d.lokasi   === fLokasi)
), [recentLaporan, fBulan, fKategori, fLokasi])

const totalPages = Math.ceil(filteredPd.length / PER_PAGE)
const pageData   = filteredPd.slice((fPage-1)*PER_PAGE, fPage*PER_PAGE)

  // Kalender & Scoring
const submissionDates = useMemo(() => {
  const map = {}
  pd.forEach(d => {
    const raw = d.tglRaw || 0
    if (!raw) return
    const date = new Date(raw)
    const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
    map[key] = (map[key] || 0) + 1
  })
  return map
}, [pd])

const submissionScore = useMemo(() => {
  const bulanList = [...new Set(pd.map(d => d.bulan))].filter(Boolean)
  if (!bulanList.length) return null

  const scores = bulanList.map(bulan => {
    const entries = pd.filter(d => d.bulan === bulan)
    if (!entries.length) return null

    const dates = entries.map(d => {
      const raw = d.tglRaw || 0
      if (!raw) return null
      return new Date(raw).getDate()
    }).filter(Boolean)

    if (!dates.length) return null

    const maxDate = Math.max(...dates)
    const avgDate = Math.round(dates.reduce((a,b) => a+b, 0) / dates.length)
    const spread = new Set(dates).size
    const total = entries.length

    // Score: spread merata = bagus, numpuk akhir bulan = buruk
    const spreadScore = Math.min(spread / total * 100, 100)
    const lateScore = maxDate >= 28 ? Math.max(0, 100 - (dates.filter(d => d >= 25).length / total * 100)) : 100
    const score = Math.round((spreadScore * 0.6) + (lateScore * 0.4))

    return { bulan, score, avgDate, spread, total, maxDate }
  }).filter(Boolean)

  return scores
}, [pd])

  return (
    <div className={s.page}>
      <nav className={s.nav}>
        <div className={s.navInner}>
            <button className={s.backBtn} onClick={onBack}>← Semua AA</button>
            <div className={s.navBrand}>
            <div className={s.navLogo}>
                <svg viewBox="0 0 36 36" width="16" height="16" fill="none">
                <path d="M4 28 L12 8 L18 20 L24 8 L32 28" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
            <div>
                <div className={s.navTitle}>Station Data Bank</div>
                <div className={s.navSub}>MRT Jakarta</div>
            </div>
            </div>
        </div>
        </nav>

      <div className={s.hero}>
        <div className={s.heroInner}>
          <p className={s.eyebrow}>Individual Report · {topSt?.[0] || '—'}</p>
          <div className={s.profile}>
            <div className={s.avatar}>{initials(nama)}</div>
            <div>
              <h1 className={s.name}>{nama}</h1>
              <p className={s.meta}>Area Authority · {topSt?.[0] || '—'} · Region 1</p>
              {lastUpload && <p className={s.meta} style={{opacity:0.6, marginTop:2}}>Data terakhir diupdate: {lastUpload}</p>}
            </div>
          </div>
          <div className={s.heroStats}>
            <div className={s.hstat}><div className={s.hstatVal}>{total}</div><div className={s.hstatLabel}>Total Laporan</div></div>
            <div className={s.hstat}><div className={s.hstatVal} style={{color:'#4472C4'}}>{byKat.Safety||0}</div><div className={s.hstatLabel}>Safety</div></div>
            <div className={s.hstat}><div className={s.hstatVal} style={{color:'#FFC000'}}>{byKat.Service||0}</div><div className={s.hstatLabel}>Service</div></div>
            <div className={s.hstat}><div className={s.hstatVal} style={{color:'#FF0000'}}>{byKat.Security||0}</div><div className={s.hstatLabel}>Security</div></div>
            <div className={s.hstat}><div className={s.hstatVal}>#{rank}</div><div className={s.hstatLabel}>Ranking Tim</div></div>
            <div className={s.hstat}><div className={s.hstatVal}>{konsistensi}%</div><div className={s.hstatLabel}>Konsistensi</div></div>
          </div>
        </div>
      </div>

      <div className={s.body}>

        {/* Posisi di Tim */}
        <div className={s.card} style={{marginBottom:12}}>
          <div className={s.cardTitle}>Posisi di Tim</div>
          <div className={s.teamCompare}>
            <div className={s.tcItem}>
              <span className={s.tcLabel}>Total laporan</span>
              <div className={s.tcBar}>
                <div className={s.tcFill} style={{width:`${Math.min(total/Math.max(avgTotal*2,total)*100,100)}%`, background:'#0057A8'}}/>
                <div className={s.tcAvgLine} style={{left:`${Math.min(avgTotal/Math.max(avgTotal*2,total)*100,100)}%`}}/>
              </div>
              <span className={s.tcVal}>{total} <span style={{color:'#9CA3AF',fontSize:11}}>/ avg {avgTotal}</span></span>
            </div>
            <p className={s.tcNote}>
              {total > avgTotal
                ? `${nama.split(' ')[0]} ${Math.round((total/avgTotal-1)*100)}% di atas rata-rata tim`
                : total < avgTotal
                ? `${nama.split(' ')[0]} ${Math.round((1-total/avgTotal)*100)}% di bawah rata-rata tim`
                : `${nama.split(' ')[0]} tepat di rata-rata tim`}
            </p>
          </div>
        </div>

        {/* Target & Konsistensi */}
        <div className={s.row2}>
          <div className={s.card}>
            <div className={s.cardTitle}>Target Bulan Ini ({targetBulanIni?.bulan})</div>
            <div style={{display:'flex',alignItems:'center',gap:16,marginTop:8}}>
              <div style={{fontSize:32,fontWeight:700,color: targetBulanIni?.pct>=100?'#059669':targetBulanIni?.pct>=70?'#D97706':'#CC0000'}}>
                {targetBulanIni?.pct || 0}%
              </div>
              <div style={{flex:1}}>
                <div style={{height:8,background:'#F3F4F6',borderRadius:4,overflow:'hidden',marginBottom:6}}>
                  <div style={{height:'100%',width:`${targetBulanIni?.pct||0}%`,background: targetBulanIni?.pct>=100?'#059669':targetBulanIni?.pct>=70?'#D97706':'#CC0000',borderRadius:4}}/>
                </div>
                <div style={{fontSize:12,color:'#9CA3AF'}}>{targetBulanIni?.total || 0} dari target {targetBulanIni?.target || 20} laporan</div>
              </div>
            </div>
          </div>

          <div className={s.card}>
            <div className={s.cardTitle}>Konsistensi</div>
            <div style={{display:'flex',alignItems:'center',gap:16,marginTop:8}}>
              <div style={{fontSize:32,fontWeight:700,color: konsistensiScore>=80?'#059669':konsistensiScore>=50?'#D97706':'#CC0000'}}>
                {konsistensiScore}%
              </div>
              <div style={{flex:1}}>
                <div style={{height:8,background:'#F3F4F6',borderRadius:4,overflow:'hidden',marginBottom:6}}>
                  <div style={{height:'100%',width:`${konsistensiScore}%`,background: konsistensiScore>=80?'#059669':konsistensiScore>=50?'#D97706':'#CC0000',borderRadius:4}}/>
                </div>
                <div style={{fontSize:12,color:'#9CA3AF'}}>Aktif {bulanAA.length} dari {expectedBulan} bulan sejak mulai lapor</div>
              </div>
            </div>
          </div>
        </div>

        <div className={s.card} style={{marginBottom:12}}>
          <div className={s.scoreExplain} style={{marginTop:0,paddingTop:0,borderTop:'none'}}>
            <strong>Target bulan ini:</strong> realisasi laporan dibanding target bulanan yang ditetapkan. <br/> <strong>Konsistensi:</strong> persentase bulan dengan laporan sejak pertama kali aktif — bukan dari awal data keseluruhan, supaya AA yang baru join tidak dirugikan.
          </div>
        </div>

        <div className={s.row2}>
          {/* Trend Bulanan */}
          <div className={s.card}>
            <div className={s.cardTitle}>Trend per Bulan</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData} margin={{top:4,right:8,bottom:0,left:-20}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false}/>
                <XAxis dataKey="name" tick={{fontSize:11,fill:'#9CA3AF'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11,fill:'#9CA3AF'}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip/>
                <Line type="monotone" dataKey="total" stroke="#0057A8" strokeWidth={2.5} dot={{r:4,fill:'#0057A8',strokeWidth:0}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Distribusi Kategori */}
          <div className={s.card}>
            <div className={s.cardTitle}>Distribusi Kategori</div>
            <div className={s.legend}>
              {['Safety','Service','Security'].map(k => (
                <span key={k} className={s.legItem}>
                  <span className={s.legDot} style={{background:k==='Safety'?'#4472C4':k==='Service'?'#FFC000':'#FF0000'}}/>
                  {k} · {Math.round((byKat[k]||0)/total*100)}%
                </span>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie data={['Safety','Service','Security'].map(k=>({name:k,value:byKat[k]||0}))}
                  cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {['Safety','Service','Security'].map(k => (
                    <Cell key={k} fill={k==='Safety'?'#4472C4':k==='Service'?'#FFC000':'#FF0000'}/>
                  ))}
                </Pie>
                <Tooltip/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Kalender Submission */}
{Object.keys(submissionDates).length > 0 && (() => {
  const allDates = Object.keys(submissionDates).sort()
  const firstDate = new Date(allDates[0])
  const lastDate = new Date(allDates[allDates.length - 1])
  const bulanRange = []
  const cur = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1)
  while (cur <= lastDate) {
    bulanRange.push(new Date(cur))
    cur.setMonth(cur.getMonth() + 1)
  }

  return (
    <div className={s.card} style={{marginBottom:12}}>
      <div className={s.cardTitle}>Kalender Submission</div>
      <div className={s.calendarWrap}>
        {bulanRange.map(bulanDate => {
          const year = bulanDate.getFullYear()
          const month = bulanDate.getMonth()
          const bulanNama = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][month]
          const daysInMonth = new Date(year, month+1, 0).getDate()
          const firstDay = new Date(year, month, 1).getDay()
          const days = []
          for (let i = 0; i < firstDay; i++) days.push(null)
          for (let i = 1; i <= daysInMonth; i++) days.push(i)

          return (
            <div key={`${year}-${month}`} className={s.calMonth}>
              <div className={s.calMonthName}>{bulanNama} {year}</div>
              <div className={s.calDayHeaders}>
                {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d => (
                  <div key={d} className={s.calDayHeader}>{d}</div>
                ))}
              </div>
              <div className={s.calGrid}>
                {days.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} className={s.calEmpty}/>
                  const key = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
                  const count = submissionDates[key] || 0
                  const bg = count === 0 ? '#F3F4F6' : count === 1 ? '#BFDBFE' : count === 2 ? '#60A5FA' : '#1D4ED8'
                  const isLate = day >= 25
                  return (
                    <div key={key} className={s.calDay}
                      style={{background: bg, border: isLate && count > 0 ? '1.5px solid #F59E0B' : 'none'}}
                      title={`${day} ${bulanNama}: ${count} laporan`}>
                      {count > 0 && <span className={s.calCount}>{count}</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <div className={s.calLegend}>
        <span className={s.calLegItem}><span className={s.calLegDot} style={{background:'#F3F4F6'}}/>Tidak ada</span>
        <span className={s.calLegItem}><span className={s.calLegDot} style={{background:'#BFDBFE'}}/>1 laporan</span>
        <span className={s.calLegItem}><span className={s.calLegDot} style={{background:'#60A5FA'}}/>2 laporan</span>
        <span className={s.calLegItem}><span className={s.calLegDot} style={{background:'#1D4ED8'}}/>3+</span>
        <span className={s.calLegItem}><span className={s.calLegDot} style={{background:'transparent',border:'1.5px solid #F59E0B'}}/>Akhir bulan</span>
      </div>
    </div>
  )
})()}

{/* Submission Score */}
{submissionScore && submissionScore.length > 0 && (
  <div className={s.card} style={{marginBottom:12}}>
    <div className={s.cardTitle}>Pola Submission</div>
    <div className={s.scoreGrid}>
      {submissionScore.map(sc => {
        const color = sc.score >= 80 ? '#059669' : sc.score >= 50 ? '#D97706' : '#CC0000'
        const label = sc.score >= 80 ? 'Merata' : sc.score >= 50 ? 'Cukup' : 'Numpuk'
        return (
          <div key={sc.bulan} className={s.scoreCard}>
            <div className={s.scoreBulan}>{sc.bulan}</div>
            <div className={s.scoreNum} style={{color}}>{sc.score}</div>
            <div className={s.scoreLabel} style={{color}}>{label}</div>
            <div className={s.scoreBar}>
              <div className={s.scoreBarFill} style={{width:`${sc.score}%`, background: color}}/>
            </div>
            <div className={s.scoreMeta}>{sc.spread} hari aktif dari {sc.total} laporan</div>
            {sc.maxDate >= 25 && sc.score < 80 && (
              <div className={s.scoreWarning}>⚠ Ada submission terlambat</div>
            )}
          </div>
        )
      })}
    </div>
      <div className={s.scoreExplain}>
  <strong>Rumus skor:</strong> Skor = (Skor Pemerataan × 60%) + (Skor Ketepatan Waktu × 40%)
  <br/>
  <strong>Skor Pemerataan</strong> = (jumlah hari unik lapor ÷ total laporan) × 100. Contoh: 13 laporan tapi cuma di 1 hari → (1÷13) × 100 = 8. Kalau 13 laporan tersebar di 13 hari berbeda → (13÷13) × 100 = 100.
  <br/>
  <strong>Skor Ketepatan Waktu</strong> = 100 − ((laporan di tanggal 25+ ÷ total laporan) × 100). Contoh: dari 10 laporan, 4 di antaranya di tanggal 25 ke atas → 100 − (4÷10×100) = 60.
  <br/>
  <br/>
  <strong>Skor 80+</strong> = merata <br/>
  <strong>50–79</strong> = cukup <br/>
  <strong>50</strong> = numpuk di akhir bulan <br/>
</div>
  </div>
)}

        <div className={s.row2}>
          {/* Sub Kategori */}
          <div className={s.card}>
            <div className={s.cardTitle}>Sub Kategori Terbanyak</div>
            <div style={{marginTop:8}}>
              {subKatData.map(([k,v],i) => (
                <div key={k} className={s.barRow}>
                  <span className={s.barLabel}>{k.length>20?k.slice(0,19)+'…':k}</span>
                  <div className={s.barTrack}><div className={s.barFill} style={{width:`${Math.round(v/subKatData[0][1]*100)}%`,background:'#0057A8',opacity:1-i*0.12}}/></div>
                  <span className={s.barVal}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shift & Lokasi */}
          <div className={s.card}>
            <div className={s.cardTitle}>Distribusi Shift</div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={shiftData.map(([k,v])=>({name:k,value:v}))} margin={{top:4,right:8,bottom:0,left:-20}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false}/>
                <XAxis dataKey="name" tick={{fontSize:11,fill:'#9CA3AF'}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:11,fill:'#9CA3AF'}} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip/>
                <Bar dataKey="value" fill="#0057A8" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
            <div className={s.cardTitle} style={{marginTop:14}}>Lokasi Terbanyak</div>
            {lokasiData.map(([k,v]) => (
              <div key={k} className={s.barRow} style={{marginBottom:5}}>
                <span className={s.barLabel}>{k.length>20?k.slice(0,19)+'…':k}</span>
                <div className={s.barTrack}><div className={s.barFill} style={{width:`${Math.round(v/lokasiData[0][1]*100)}%`,background:'#374151'}}/></div>
                <span className={s.barVal}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Kualitas Deskripsi */}
        <div className={s.card} style={{marginBottom:12}}>
          <div className={s.cardTitle}>Kualitas Deskripsi</div>
          <div className={s.qualityRow}>
            <div className={s.qualScore}>
              <div className={s.qualScoreNum} style={{color: qualityScore>=70?'#059669':qualityScore>=40?'#D97706':'#CC0000'}}>{qualityScore}%</div>
              <div className={s.qualScoreLabel}>Skor Kualitas</div>
            </div>
            <div className={s.qualStats}>
              <div className={s.qualStat}><span className={s.qualStatVal}>{avgLen}</span><span className={s.qualStatLabel}>rata-rata karakter</span></div>
              <div className={s.qualStat}><span className={s.qualStatVal} style={{color:'#059669'}}>{detailCount}</span><span className={s.qualStatLabel}>laporan detail (&gt;80 char)</span></div>
              <div className={s.qualStat}><span className={s.qualStatVal} style={{color:'#CC0000'}}>{singkatCount}</span><span className={s.qualStatLabel}>laporan singkat (&lt;30 char)</span></div>
            </div>
          </div>
        </div>

       <div className={s.card}>
  <div className={s.cardTitle}>Semua Laporan · {filteredPd.length} entri</div>

  <div className={s.tableFilters}>
    <select className={s.tFilter} value={fBulan} onChange={e=>{setFBulan(e.target.value);setFPage(1)}}>
      <option value="all">Semua Bulan</option>
      {pdBulanList.map(b => <option key={b} value={b}>{b}</option>)}
    </select>
    <select className={s.tFilter} value={fKategori} onChange={e=>{setFKategori(e.target.value);setFPage(1)}}>
      <option value="all">Semua Kategori</option>
      {['Safety','Service','Security'].map(k => <option key={k} value={k}>{k}</option>)}
    </select>
    <select className={s.tFilter} value={fLokasi} onChange={e=>{setFLokasi(e.target.value);setFPage(1)}}>
      <option value="all">Semua Lokasi</option>
      {pdLokasiList.map(l => <option key={l} value={l}>{l}</option>)}
    </select>
    {(fBulan!=='all'||fKategori!=='all'||fLokasi!=='all') && (
      <button className={s.tReset} onClick={()=>{setFBulan('all');setFKategori('all');setFLokasi('all');setFPage(1)}}>Reset</button>
    )}
  </div>

  <div style={{overflowX:'auto'}}>
    <table className={s.table}>
      <thead>
        <tr><th>Tgl</th><th>Kategori</th><th>Sub Kategori</th><th>Lokasi</th><th>Deskripsi</th></tr>
      </thead>
      <tbody>
        {pageData.length === 0
          ? <tr><td colSpan={5} className={s.empty}>Tidak ada data</td></tr>
          : pageData.map(d => (
           <tr key={d.id} onClick={() => setSelected(d)} style={{cursor:'pointer'}}>
              <td className={s.muted}>{d.tgl}</td>
              <td><span className={`${s.badge} ${BADGE[d.kategori]}`}>{d.kategori}</span></td>
              <td>{d.subkategori}</td>
              <td className={s.muted}>{d.lokasi}</td>
              <td className={s.trunc}>{d.deskripsi}</td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>

  {totalPages > 1 && (
    <div className={s.pagination}>
      <button className={s.pgBtn} onClick={()=>setFPage(p=>p-1)} disabled={fPage===1}>← Prev</button>
      <span className={s.pgInfo}>{(fPage-1)*PER_PAGE+1}–{Math.min(fPage*PER_PAGE,filteredPd.length)} dari {filteredPd.length}</span>
      <button className={s.pgBtn} onClick={()=>setFPage(p=>p+1)} disabled={fPage===totalPages}>Next →</button>
    </div>
  )}
</div>

      </div>
      <Modal entry={selected} onClose={() => setSelected(null)} />
    </div>
  )
}