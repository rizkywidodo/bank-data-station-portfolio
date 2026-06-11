import { useState, useMemo, useEffect } from 'react'
import { countBy, initials } from '../hooks/useFilters'
import { createClient } from '@supabase/supabase-js'
import s from './ReportListPage.module.css'

const supabase = createClient(
  'https://jcxjufbzblfqobpjobzw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjeGp1ZmJ6YmxmcW9icGpvYnp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MDE5MTQsImV4cCI6MjA5MjI3NzkxNH0.iC5msp9WUC96XX6hegEjxzUZmNQKYyv7KMXcuSYi_WY'
)

const BULAN_ORDER = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const DEFAULT_TARGET_STASIUN = 78
const DEFAULT_TARGET_AA = 20

export default function ReportListPage({ data, onSelect, onBack }) {
  const [tab, setTab]                     = useState('stasiun')
  const [targets, setTargets]             = useState({})
  const [editing, setEditing]             = useState(null)
  const [editVal, setEditVal]             = useState('')
  const [filterStasiun, setFilterStasiun] = useState(null)
  const [bulan, setBulan]                 = useState(() => {
    const available = BULAN_ORDER.filter(b => data.some(d => d.bulan === b))
    return available[available.length - 1] || 'all'
  })

  const allBulan = useMemo(() =>
    BULAN_ORDER.filter(b => data.some(d => d.bulan === b)), [data])

  const filteredData = useMemo(() =>
    bulan === 'all' ? data : data.filter(d => d.bulan === bulan), [data, bulan])

  const allNames = useMemo(() => [...new Set(data.map(d => d.nama))].sort(), [data])

  useEffect(() => {
    supabase.from('targets').select('*').then(({ data: rows }) => {
      if (!rows) return
      const map = {}
      rows.forEach(r => { map[`${r.type}__${r.name}`] = r.target_per_bulan })
      setTargets(map)
    })
  }, [])

  const getTarget = (type, name) => targets[`${type}__${name}`] || (type === 'stasiun' ? DEFAULT_TARGET_STASIUN : DEFAULT_TARGET_AA)

  async function saveTarget(type, name, val) {
    const v = parseInt(val)
    if (!v || v < 1) return
    await supabase.from('targets').upsert({ type, name, target_per_bulan: v }, { onConflict: 'type,name' })
    setTargets(prev => ({ ...prev, [`${type}__${name}`]: v }))
    setEditing(null)
  }

  const progressColor = (pct) => pct >= 100 ? '#059669' : pct >= 70 ? '#D97706' : '#CC0000'

  const stasiunList = useMemo(() => {
    const stations = [...new Set(data.map(d => d.stasiun))].filter(Boolean).sort()
    return stations.map(st => {
      const sd = filteredData.filter(d => d.stasiun === st)
      const allSd = data.filter(d => d.stasiun === st)
      const byKat = countBy(sd, 'kategori')
      const aaCount = new Set(allSd.map(d => d.nama)).size
      const total = sd.length
      const target = getTarget('stasiun', st)
      const pct = Math.min(Math.round(total / (target || 1) * 100), 100)
      return { st, total, byKat, aaCount, target, pct }
    }).sort((a, b) => b.total - a.total)
  }, [filteredData, data, targets])

  const aaList = useMemo(() => allNames
    .filter(nama => !filterStasiun || data.filter(d => d.nama === nama).some(d => d.stasiun === filterStasiun))
    .map(nama => {
      const pd = filteredData.filter(d => d.nama === nama)
      const allPd = data.filter(d => d.nama === nama)
      const byKat = countBy(pd, 'kategori')
      const topSt = Object.entries(countBy(allPd, 'stasiun')).sort((a,b) => b[1]-a[1])[0]
      const bulanAktif = new Set(allPd.map(d => d.bulan)).size || 1
      const total = pd.length
      const target = getTarget('aa', nama)
      const pct = Math.min(Math.round(total / (target || 1) * 100), 100)
      const avgPerBulan = Math.round(allPd.length / bulanAktif)
      return { nama, total, byKat, topSt: topSt?.[0]||'—', target, pct, avgPerBulan, bulanAktif }
    }).sort((a, b) => b.total - a.total),
  [filteredData, data, allNames, targets, filterStasiun])

  return (
    <div className={s.page}>
      <nav className={s.nav}>
        <div className={s.navInner}>
          <button className={s.backBtn} onClick={onBack}>← Dashboard</button>
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
          <p className={s.eyebrow}>Analisa Per Individu</p>
          <h1 className={s.title}>Laporan AA.</h1>
          <p className={s.sub}>{allNames.length} Area Authority · {filteredData.length} laporan {bulan !== 'all' ? bulan : 'semua bulan'}</p>
        </div>
      </div>

      <div className={s.body}>
        <div className={s.toolbar}>
          <div className={s.tabRow}>
            <button className={`${s.tab} ${tab==='stasiun'?s.tabActive:''}`} onClick={() => setTab('stasiun')}>Per Stasiun</button>
            <button className={`${s.tab} ${tab==='aa'?s.tabActive:''}`} onClick={() => setTab('aa')}>Semua AA</button>
          </div>
          <select className={s.bulanSelect} value={bulan} onChange={e => setBulan(e.target.value)}>
            <option value="all">Semua Bulan</option>
            {allBulan.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        {tab === 'stasiun' && (
          <div className={s.stasiunGrid}>
            {stasiunList.map((s2, i) => (
              <div key={s2.st} className={s.stasiunCard}>
                <div className={s.stasiunHeader}>
                  <div>
                    <div className={s.stasiunRank}>#{i+1}</div>
                    <div className={s.stasiunName}>{s2.st}</div>
                    <div className={s.stasiunMeta}>{s2.aaCount} AA · Region 1</div>
                  </div>
                  <div>
                    <div className={s.stasiunTotal} style={{color: bulan !== 'all' ? progressColor(s2.pct) : 'var(--text)'}}>{s2.total}</div>
                    {bulan !== 'all' && (
                      <div className={s.targetLabel}>
                        {editing === `st__${s2.st}` ? (
                          <span className={s.editWrap}>
                            <input className={s.editInput} value={editVal} onChange={e=>setEditVal(e.target.value)}
                              onKeyDown={e=>e.key==='Enter'&&saveTarget('stasiun',s2.st,editVal)}
                              autoFocus style={{width:50}} />
                            <button className={s.editSave} onClick={()=>saveTarget('stasiun',s2.st,editVal)}>✓</button>
                            <button className={s.editCancel} onClick={()=>setEditing(null)}>✕</button>
                          </span>
                        ) : (
                          <span onClick={()=>{setEditing(`st__${s2.st}`);setEditVal(String(s2.target))}} className={s.targetClick}>
                            target: {s2.target} ✎
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {bulan !== 'all' && (
                  <div className={s.progressWrap}>
                    <div className={s.progressTrack}>
                      <div className={s.progressFill} style={{width:`${s2.pct}%`, background: progressColor(s2.pct)}}/>
                    </div>
                    <span className={s.progressPct} style={{color: progressColor(s2.pct)}}>{s2.pct}%</span>
                  </div>
                )}

                <div className={s.stasiunBars}>
                  {['Safety','Service','Security'].map(k => (
                    <div key={k} className={s.miniBar}>
                      <div className={s.miniTrack}>
                        <div className={s.miniFill} style={{
                          width:`${Math.round((s2.byKat[k]||0)/(s2.total||1)*100)}%`,
                          background:k==='Safety'?'#4472C4':k==='Service'?'#FFC000':'#FF0000'
                        }}/>
                      </div>
                      <span className={s.miniLabel}>{k} {Math.round((s2.byKat[k]||0)/(s2.total||1)*100)}%</span>
                    </div>
                  ))}
                </div>

                <div className={s.stasiunFooter}>
                  <button className={s.viewBtn} onClick={() => { setFilterStasiun(s2.st); setTab('aa') }}>
                    Lihat AA →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'aa' && (
          <div>
            {filterStasiun && (
              <div className={s.breadcrumb}>
                <button onClick={() => { setFilterStasiun(null); setTab('stasiun') }} className={s.breadcrumbBack}>← {filterStasiun}</button>
                <span className={s.breadcrumbSub}>· {aaList.length} AA</span>
              </div>
            )}
            <div className={s.grid}>
              {aaList.map((aa, i) => (
                <div key={aa.nama} className={s.card} onClick={() => onSelect(aa.nama)}>
                  <div className={s.cardTop}>
                    <div className={s.rank}>#{i+1}</div>
                    <div className={s.avatar}>{initials(aa.nama)}</div>
                    <div className={s.info}>
                      <div className={s.name}>{aa.nama}</div>
                      <div className={s.meta}>{aa.topSt}</div>
                    </div>
                    <div>
                      <div className={s.total} style={{color: bulan !== 'all' ? progressColor(aa.pct) : 'var(--text)'}}>{aa.total}</div>
                      {bulan !== 'all' && (
                        <div className={s.targetLabel}>
                          {editing === `aa__${aa.nama}` ? (
                            <span className={s.editWrap}>
                              <input className={s.editInput} value={editVal} onChange={e=>setEditVal(e.target.value)}
                                onKeyDown={e=>e.key==='Enter'&&saveTarget('aa',aa.nama,editVal)}
                                autoFocus style={{width:40}} />
                              <button className={s.editSave} onClick={()=>saveTarget('aa',aa.nama,editVal)}>✓</button>
                              <button className={s.editCancel} onClick={()=>setEditing(null)}>✕</button>
                            </span>
                          ) : (
                            <span onClick={e=>{e.stopPropagation();setEditing(`aa__${aa.nama}`);setEditVal(String(aa.target))}} className={s.targetClick}>
                              target: {aa.target} ✎
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {bulan !== 'all' && (
                    <div className={s.progressWrap}>
                      <div className={s.progressTrack}>
                        <div className={s.progressFill} style={{width:`${aa.pct}%`, background: progressColor(aa.pct)}}/>
                      </div>
                      <span className={s.progressPct} style={{color: progressColor(aa.pct)}}>{aa.pct}%</span>
                    </div>
                  )}

                  <div className={s.bars}>
                    {['Safety','Service','Security'].map(k => (
                      <div key={k} className={s.miniBar}>
                        <div className={s.miniTrack}>
                          <div className={s.miniFill} style={{
                            width:`${Math.round((aa.byKat[k]||0)/(aa.total||1)*100)}%`,
                            background:k==='Safety'?'#4472C4':k==='Service'?'#FFC000':'#FF0000'
                          }}/>
                        </div>
                        <span className={s.miniLabel}>{k} {Math.round((aa.byKat[k]||0)/(aa.total||1)*100)}%</span>
                      </div>
                    ))}
                  </div>

                  <div className={s.cardBottom}>
                    <div className={s.stat}><span className={s.statVal}>{aa.avgPerBulan}</span><span className={s.statLabel}>avg/bulan</span></div>
                    <div className={s.stat}><span className={s.statVal}>{aa.bulanAktif}</span><span className={s.statLabel}>bulan aktif</span></div>
                    <div className={s.viewBtn} style={{pointerEvents:'none'}}>Lihat detail →</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}