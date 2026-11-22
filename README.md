# Smart Feeder Monitoring & Bioflok IoT Management System

Sistem pemantauan kualitas air, manajemen pakan presisi (*smart feeder*), dan logbook budidaya bioflok berbasis IoT (ESP32) terintegrasi dengan Google Sheets, FastAPI, dan React + Tailwind CSS.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.10+, FastAPI, Uvicorn, SQLite3, Google Sheets API (`gspread`), Logika Fuzzy Mamdani.
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Google Fonts (*Plus Jakarta Sans*).
- **Hardware / IoT**: ESP32, Sensor pH, Suhu (DS18B20), DO (Dissolved Oxygen), Amonia (NH3), Relay / Servo Feeder.

---

## 🚀 Fitur Utama

1. **Dashboard Monitoring Real-time**: Visualisasi indikator kualitas air (pH, Suhu, DO, Amonia, TDS, Kekeruhan) dengan status kondisi otomatis.
2. **Manajemen Pakan Presisi**: Pengaturan jadwal otomatis, rekomendasi pakan harian berbasis logika fuzzy mamdani.
3. **Logbook Budidaya & Siklus Kolam**: Manajemen siklus budidaya ikan bioflok Kolam C, pencatatan sampling biomassa, dan kalkulasi FCR (Feed Conversion Ratio).
4. **Notifikasi Peringatan Dini**: Alert otomatis saat parameter kualitas air melampaui batas kritis.
5. **Sinkronisasi Google Sheets**: Sinkronisasi dua arah data sensor IoT dan logbook pemberian pakan ke Google Spreadsheet secara realtime.
6. **Autentikasi Pengelola**: Login aman dengan Session Storage dan fitur Pemulihan Kata Sandi (*Forgot Password via SMTP Email*).

---

## 📁 Struktur Direktori

```text
Smart_Feeder_Monitoring/
├── backend/
│   ├── cultivation.py         # Modul siklus budidaya & sampling
│   ├── main.py                # FastAPI core, routes, auth, fuzzy mamdani & API sensor
│   ├── requirements.txt       # Dependensi Python
│   └── .env.example           # Contoh konfigurasi variabel lingkungan
├── frontend/
│   ├── src/
│   │   ├── components/        # Komponen UI (Navbar, Sidebar, Charts, KPI)
│   │   ├── context/           # Context sensor & tema (dark/light mode)
│   │   ├── pages/             # Halaman: Dashboard, WaterQuality, Cultivation, dll.
│   │   └── api.js             # Konfigurasi Axios endpoint
│   ├── package.json
│   └── vite.config.js
├── .gitignore                 # Proteksi secret files (credentials, db, env)
└── README.md
```

---

## ⚙️ Panduan Instalasi Lokal

### 1. Clone Repository
```bash
git clone https://github.com/MirandaSinagaa/smart-feeder-monitoring.git
cd smart-feeder-monitoring
```

### 2. Konfigurasi Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Untuk Linux/WSL
# venv\Scripts\activate   # Untuk Windows PowerShell

pip install -r requirements.txt
cp .env.example .env
# Masukkan konfigurasi SMTP dan tempatkan credentials.json Google Service Account di folder backend/

python3 main.py
```
Backend akan aktif di `http://127.0.0.1:8000`. Dokumentasi Swagger API di `http://127.0.0.1:8000/docs`.

### 3. Konfigurasi Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Akses dashboard di browser melalui `http://localhost:5173`.
