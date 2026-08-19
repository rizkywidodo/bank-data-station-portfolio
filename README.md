# Bank Data Station Dashboard
### PT MRT Jakarta · Internal Analytics Tool · Region 1

A real-time web dashboard built to digitalize and visualize daily station reports from Area Authority (AA) staff across MRT Jakarta's Region 1 stations — replacing manual Excel-based analysis.

> ⚠️ **Note:** This is a sanitized portfolio version. Production deployment uses real operational data from PT MRT Jakarta (password protected).

---

## Overview

Area Authority staff submit daily Safety, Service, and Security reports via Microsoft Forms. This dashboard provides Station Managers with real-time analytics, individual performance tracking, and submission pattern detection.

**Built during internship at PT MRT Jakarta — Station Digitalization Program, 2026**

---

## Features

- **Interactive Dashboard** — filters by month, station, shift, category, sub-category, and facility type
- **Individual Report Page** — GitHub-style submission calendar, submission pattern scoring, target tracking
- **AA Ranking Page** — composite scoring system per station and per individual
- **Dynamic Target Setting** — SM can set monthly targets per station/AA directly in the web
- **Upload System** — admin uploads xlsx → stored in Supabase → all users get updated data instantly
- **Modal Detail** — click any report row to see full description + photo/video attachment preview
- **Submission Pattern Detection** — detects AA staff who bulk-submit reports at end of month

## Tech Stack

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white&style=flat-square)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white&style=flat-square)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white&style=flat-square)
![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=flat-square)

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Charts | Recharts |
| Database | Supabase (PostgreSQL) |
| File Parsing | XLSX.js + PapaParse |
| Hosting | Vercel (auto-deploy from GitHub) |
| Data Source | Microsoft Forms → Excel Online (SharePoint) |

## Scoring System

AA performance is ranked using a **composite score**:

**Per-month filter:**
```
Score = (Target % × 60%) + (Submission Pattern × 40%)
```

**All months:**
```
Score = (Target avg × 40%) + (Consistency × 30%) + (Pattern avg × 30%)
```

> Consistency is calculated from the month each AA *first* became active — not from the start of all data — to avoid penalizing newer staff.

**Submission Pattern Score:**
```
Score = (Spread Score × 60%) + (Timeliness Score × 40%)
```
- **Spread Score** = (unique days with reports ÷ total reports) × 100
- **Timeliness Score** = 100 − (reports on day 25+ ÷ total × 100)

## Data Flow

```
Microsoft Forms → Excel Online (SharePoint)
       ↓
Admin downloads xlsx → uploads via dashboard
       ↓
XLSX.js parses → rows stored in Supabase
       ↓
All users fetch latest data automatically
```

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_PASSWORD=your_password
```

---

*© 2026 · Muhammad Rizky Widodo · Built @ PT MRT Jakarta Internship*
