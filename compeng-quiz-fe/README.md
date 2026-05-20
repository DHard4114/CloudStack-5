# QuizLive CompEng — Frontend

> **Editorial Tech Brutalism** — Real-time quiz platform untuk pendidikan Computer Engineering. 
> Frontend Vite + React + TailwindCSS yang terhubung ke backend Node.js + Express + Socket.IO yang berjalan di dalam **isolated network CloudStack** melalui Virtual Router NAT.

```
┌────────────────────────┐      ┌──────────────────────┐      ┌────────────────────────┐
│  Windows LAN Host      │      │  CloudStack Virtual  │      │  Isolated Guest Net    │
│  (this frontend)       │ HTTP │  Router (Source NAT) │ DNAT │  VM quizlive-db-vm     │
│  localhost:5173        │ ───▶ │  192.168.101.232:3000│ ───▶ │  10.1.1.230:3000       │
└────────────────────────┘      └──────────────────────┘      └────────────────────────┘
```

---

## ✨ Fitur

- **Editorial Tech Brutalism** design system — warm monochrome + amber accent, Fraunces display serif + Geist sans + JetBrains Mono.
- **JWT Auth** dengan persistensi `localStorage` (auto-logout pada 401).
- **Role-based routing** — `teacher` / `admin` mendapat dasbor; `student` masuk via PIN.
- **Real-time live session** dengan Socket.IO (lobby → soal → reveal → leaderboard → podium).
- **Editor pertanyaan** Kahoot-style dengan 4 ikon shape berwarna.
- **Host control panel** dark-theme untuk guru — display PIN besar, daftar pemain real-time, kontrol Start/Next/End.
- **Halaman PIN entry** dengan input OTP 6-digit dan paste-support.
- **404 page**, **toast notifications**, **framer-motion** transitions.

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Konfigurasi environment

Salin `.env.example` menjadi `.env` dan sesuaikan jika perlu:

```bash
cp .env.example .env
```

Isi default:

```env
VITE_API_URL=http://192.168.101.232:3000
VITE_SOCKET_URL=http://192.168.101.232:3000
```

> Jika backend Anda berjalan di IP atau port lain, ubah kedua variable di atas.

### 3. Jalankan development server

```bash
npm run dev
```

Frontend tersedia di **http://localhost:5173**.

### 4. Build production

```bash
npm run build
npm run preview
```

---

## 🗂 Struktur Direktori

```
quizlive-frontend/
├── .env                         # konfigurasi runtime (tidak di-commit)
├── .env.example                 # template environment
├── index.html                   # entry HTML + Google Fonts
├── package.json
├── postcss.config.js
├── tailwind.config.js           # design tokens (ink/flame colors, typography)
├── vite.config.js               # alias @ → src/, host 0.0.0.0:5173
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx                 # React root
    ├── App.jsx                  # Router + AuthProvider + Toaster
    ├── index.css                # Tailwind layer + design tokens
    ├── api/
    │   ├── axios.js             # Axios instance + JWT interceptor + service modules
    │   └── socket.js            # Socket.IO singleton manager
    ├── contexts/
    │   └── AuthContext.jsx      # JWT auth state + login/register/logout
    ├── hooks/
    │   └── useCountdown.js      # timer hook untuk question phase
    ├── utils/
    │   ├── cn.js                # className merger
    │   └── format.js            # tanggal, durasi, PIN formatter
    ├── components/
    │   ├── Navbar.jsx           # editorial sticky header
    │   ├── Footer.jsx           # footer + infrastructure status
    │   ├── ProtectedRoute.jsx   # auth + role guard
    │   ├── StatusPill.jsx       # status indicator (live/waiting/...)
    │   ├── EmptyState.jsx       # empty state primitive
    │   └── Modal.jsx            # framer-motion modal
    └── pages/
        ├── Landing.jsx          # marketing hero + arsitektur diagram
        ├── Login.jsx            # split-screen login
        ├── Register.jsx         # 2-step register (role → credentials)
        ├── JoinPin.jsx          # 6-digit PIN entry untuk siswa
        ├── Dashboard.jsx        # teacher dashboard + quiz library
        ├── QuizEditor.jsx       # composer pertanyaan
        ├── HostRoom.jsx         # live session control (teacher view)
        ├── QuizRoom.jsx         # live quiz arena (student view)
        └── NotFound.jsx         # 404
```

---

## 🛣 Rute Aplikasi

| Path                     | Akses                | Komponen      |
|--------------------------|----------------------|---------------|
| `/`                      | Publik               | Landing       |
| `/login`                 | Publik               | Login         |
| `/register`              | Publik               | Register      |
| `/join`                  | Publik               | JoinPin       |
| `/play/:uuid`            | Publik               | QuizRoom      |
| `/dashboard`             | teacher / admin      | Dashboard     |
| `/quizzes/:uuid/edit`    | teacher / admin      | QuizEditor    |
| `/host/:uuid`            | teacher / admin      | HostRoom      |
| `*`                      | —                    | NotFound      |

---

## 🔌 Integrasi Backend

Frontend ini berasumsi backend mengexpose endpoint berikut (sudah teruji pada deployment CloudStack):

### REST

| Method | Endpoint                                  | Keterangan                       |
|--------|-------------------------------------------|----------------------------------|
| POST   | `/api/auth/register`                      | `{ username, email, password, role }` |
| POST   | `/api/auth/login`                         | `{ email, password }` → JWT      |
| GET    | `/api/quizzes`                            | Daftar kuis (butuh token)        |
| POST   | `/api/quizzes`                            | Buat kuis baru                   |
| GET    | `/api/quizzes/:uuid`                      | Detail kuis + pertanyaan         |
| POST   | `/api/quizzes/:uuid/questions`            | Tambah pertanyaan                |
| POST   | `/api/sessions`                           | Buka sesi → dapat PIN            |
| POST   | `/api/sessions/join`                      | Join sesi dengan `{ pin, nickname }` |
| POST   | `/api/sessions/:uuid/answer`              | Submit jawaban                   |
| POST   | `/api/sessions/:uuid/start`               | Mulai sesi                       |
| POST   | `/api/sessions/:uuid/next`                | Pertanyaan berikutnya            |
| POST   | `/api/sessions/:uuid/end`                 | Akhiri sesi                      |

JWT dikirim via header `Authorization: Bearer <token>` (otomatis oleh axios interceptor).

### Socket.IO

Koneksi pada URL yang sama dengan REST (`VITE_SOCKET_URL`).

**Player events** (`src/pages/QuizRoom.jsx`):
- emit: `session:join`
- listen: `session:players_update`, `session:question`, `session:reveal`, `session:leaderboard`, `session:end`

**Host events** (`src/pages/HostRoom.jsx`):
- emit: `host:join`, `host:start_session`, `host:next_question`, `host:end_session`
- listen: `host:session_info`, `host:question_started`, `host:answer_submitted`, `host:leaderboard_update`, `host:session_ended`

> Jika event name di backend berbeda, sesuaikan dua file tersebut.

---

## 🎨 Design System

### Palette

```
Ink (warm monochrome)          Flame (amber accent)
ink-50   #FAFAF7                flame-400  #FFA533
ink-100  #F2F1EC                flame-500  #F58A00   ← primary
ink-200  #E5E3DC                flame-600  #D97506
...
ink-900  #0E0E0C
ink-950  #080806
```

### Typography

- **Display serif**: Fraunces (judul besar, tracking editorial)
- **Sans**: Geist (body)
- **Mono**: JetBrains Mono (status, label teknis, kode)

### Komponen Utility

Lihat `src/index.css`:
- `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-brutal`
- `.input-field`, `.input-label`
- `.card`, `.card-hover`
- `.eyebrow`, `.badge-accent`, `.badge-live`
- `.container-editorial`, `.divider-editorial`
- `.bg-grid-paper` (background grid halus)

---

## 🛠 Troubleshooting

### ❌ CORS error di browser console

Pastikan backend mengaktifkan CORS untuk origin `http://localhost:5173`. Di Express:

```js
app.use(cors({
  origin: ['http://localhost:5173', 'http://192.168.101.100:5173'],
  credentials: true,
}))
```

### ❌ `ERR_CONNECTION_REFUSED` ke `192.168.101.232:3000`

Verifikasi dari Windows host:

```cmd
curl http://192.168.101.232:3000/health
```

Jika gagal:
1. Pastikan VM `quizlive-db-vm` (10.1.1.230) menyala dan PM2 `quizlive-api` berjalan (`pm2 list`).
2. Verifikasi port forwarding di CloudStack dashboard: `192.168.101.232:3000 → 10.1.1.230:3000` TCP.
3. Periksa firewall ACL di network `QuizLive-Isolated-OK`.
4. Reboot Virtual Router jika perlu (dari CloudStack: Infrastructure → Virtual Routers).

### ❌ Socket.IO tidak connect

Buka DevTools → Network → WS. Pastikan handshake `polling` lalu `websocket` ke `/socket.io/` berhasil. Jika hanya polling yang jalan, kemungkinan ada proxy/firewall yang strip WebSocket upgrade.

### ❌ Login berhasil tapi tidak redirect

Periksa shape response backend. AuthContext fleksibel terhadap `{data: {token, user}}` atau `{token, user}`, tapi `user.role` harus ada (`teacher` / `admin` / `student`, case-insensitive).

### ❌ Halaman blank setelah build

Vite menggunakan history API; pastikan production server me-rewrite semua route ke `index.html`. Untuk preview lokal cukup `npm run preview`.

---

## 📦 Scripts

```bash
npm run dev       # development server (Vite, port 5173, host 0.0.0.0)
npm run build     # build production ke dist/
npm run preview   # preview hasil build di port 4173
npm run lint      # opsional: jika ESLint sudah di-setup
```

---

## 🧬 Tech Stack

- **Vite 5** — bundler & dev server
- **React 18** — UI library (concurrent root)
- **React Router 6** — routing
- **TailwindCSS 3** — utility-first styling
- **Axios** — HTTP client dengan interceptor
- **Socket.IO Client 4** — real-time bidirectional
- **Framer Motion 11** — animations
- **Lucide React** — icon system
- **react-hot-toast** — notifications
- **Zustand** — (tersedia jika diperlukan untuk state lain)

---

## 📝 Lisensi & Catatan

Proyek tugas akademik — **QuizLive CompEng** — Computer Engineering / Cloud Computing.

Backend, infrastruktur CloudStack, port forwarding, dan deployment PM2 dibangun secara terpisah. Frontend ini adalah klien tunggal untuk seluruh API tersebut.

---

**Build status**: ✅ Ready · **Design system**: Editorial Tech Brutalism · **Version**: 1.0.0
