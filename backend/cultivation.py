"""
Modul Pencatatan Budidaya Ikan Nila Bioflok (Cultivation Logbook System)
Terintegrasi langsung dua arah dengan Google Sheets:
- 01_CHECKLIST_HARIAN
- 02_PAKAN
- 03_SAMPLING
- 04_PERAWATAN_KOLAM
- 05_REKAP
"""

import os
import json
import time
import sqlite3
from datetime import datetime
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
import gspread
from google.oauth2.service_account import Credentials

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CREDENTIALS_PATH = os.path.join(BASE_DIR, "credentials.json")
DB_PATH = os.path.join(BASE_DIR, "bioflok.db")
LOGBOOK_SPREADSHEET_ID = os.getenv("SPREADSHEET_ID", "1-5Twlt3EUlWii5_3bXzSlF7qPSkBSQ2_FRHkLLkGdEg")

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]

router = APIRouter(prefix="/api/cultivation", tags=["Cultivation Logbook"])

SHEET_NAMES = {
    "checklist": "01_CHECKLIST_HARIAN",
    "feeding": "02_PAKAN",
    "pakan": "02_PAKAN",
    "sampling": "03_SAMPLING",
    "maintenance": "04_PERAWATAN_KOLAM",
    "perawatan": "04_PERAWATAN_KOLAM",
    "recap": "05_REKAP",
    "rekap": "05_REKAP"
}

# Cache lokal dalam memori per sheet (TTL 30 detik)
_cultivation_cache: Dict[str, Any] = {}


def get_gspread_client():
    google_creds_json = os.getenv("GOOGLE_CREDENTIALS") or os.getenv("GCP_SERVICE_ACCOUNT_JSON")
    if google_creds_json:
        try:
            creds_info = json.loads(google_creds_json)
            creds = Credentials.from_service_account_info(creds_info, scopes=SCOPES)
            return gspread.authorize(creds)
        except Exception as e:
            print(f"Cultivation gspread env error: {e}")
    if not os.path.exists(CREDENTIALS_PATH):
        return None
    try:
        creds = Credentials.from_service_account_file(CREDENTIALS_PATH, scopes=SCOPES)
        return gspread.authorize(creds)
    except Exception as e:
        print(f"Cultivation gspread client error: {e}")
        return None


def get_db():
    conn = sqlite3.connect(DB_PATH, timeout=15.0)
    conn.row_factory = sqlite3.Row
    return conn


def init_cultivation_db():
    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS cultivation_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                module VARCHAR(50),
                row_idx INTEGER,
                record_data TEXT,
                synced_to_sheets BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()
    finally:
        conn.close()


init_cultivation_db()


def parse_day_from_date(date_str: str) -> str:
    """Mengubah tanggal menjadi nama hari dalam bahasa Inggris (sesuai format sheet)"""
    if not date_str:
        return ""
    try:
        # Dukung format YYYY-MM-DD atau M/D/YYYY atau D/M/YYYY
        if "-" in date_str:
            dt = datetime.strptime(date_str.strip(), "%Y-%m-%d")
        else:
            parts = [int(p) for p in date_str.strip().split("/")]
            if len(parts) == 3:
                # coba M/D/YYYY
                try:
                    dt = datetime(parts[2], parts[0], parts[1])
                except Exception:
                    dt = datetime(parts[2], parts[1], parts[0])
            else:
                return ""
        return dt.strftime("%A")
    except Exception:
        return ""


def clean_num(val, default=0.0):
    if val is None or val == "":
        return default
    try:
        s = str(val).replace(",", ".").strip()
        return float(s)
    except Exception:
        return default


# ====================================================================
# 1. GET ALL SHEETS OVERVIEW
# ====================================================================
@router.get("/sheets")
def get_sheets_overview():
    return {
        "status": "success",
        "spreadsheet_id": LOGBOOK_SPREADSHEET_ID,
        "service_account_email": "feeder-bot@smartfeeder-api.iam.gserviceaccount.com",
        "modules": [
            {"id": "checklist", "title": "Checklist Harian", "sheet": "01_CHECKLIST_HARIAN", "desc": "Checklist aktivitas pemeliharaan & monitoring kolam harian"},
            {"id": "feeding", "title": "Pemberian Pakan", "sheet": "02_PAKAN", "desc": "Log pemberian pakan presisi, porsi, suplemen bibis & molase"},
            {"id": "sampling", "title": "Sampling Ikan", "sheet": "03_SAMPLING", "desc": "Pencatatan sampling bobot, panjang, estimasi biomassa & populasi"},
            {"id": "maintenance", "title": "Perawatan Kolam", "sheet": "04_PERAWATAN_KOLAM", "desc": "Logbook pengurasan, pergantian air & pemberian probiotik"},
            {"id": "recap", "title": "Rekapitulasi Budidaya", "sheet": "05_REKAP", "desc": "Rangkuman biomassa gain, total pakan, FCR, mortalitas & riwayat pertumbuhan"}
        ]
    }


# ====================================================================
# 2. GET MODULE DATA
# ====================================================================
@router.get("/{module}")
def get_cultivation_module_data(module: str, force_refresh: bool = Query(False)):
    mod = module.lower().strip()
    if mod not in SHEET_NAMES:
        raise HTTPException(status_code=404, detail=f"Modul '{module}' tidak ditemukan.")

    sheet_title = SHEET_NAMES[mod]
    now = time.time()

    # Cek cache in-memory (TTL 30 detik)
    cache_key = f"{mod}_data"
    if not force_refresh and cache_key in _cultivation_cache:
        cached = _cultivation_cache[cache_key]
        if (now - cached["timestamp"]) < 30:
            return cached["data"]

    client = get_gspread_client()
    if not client:
        raise HTTPException(status_code=500, detail="Koneksi Google Sheets belum terinisialisasi.")

    try:
        sh = client.open_by_key(LOGBOOK_SPREADSHEET_ID)
        w = sh.worksheet(sheet_title)
        all_vals = w.get_all_values()

        if not all_vals:
            return {"status": "success", "module": mod, "headers": [], "rows": [], "total": 0}

        # KHUSUS MODUL 05_REKAP
        if mod in ("recap", "rekap"):
            # Ambil summary block (baris 1-16)
            summary_dict = {}
            for r in all_vals[1:17]:
                if len(r) >= 2 and r[0].strip():
                    key = r[0].strip()
                    val = r[1].strip()
                    summary_dict[key] = val

            # Ambil Rekap Sampling Mingguan (baris 20 ke bawah)
            sampling_recap = []
            for r in all_vals[19:]:
                if len(r) >= 3 and r[0].strip() and r[1].strip() not in ("", "0"):
                    sampling_recap.append({
                        "date": r[0].strip(),
                        "avg_weight": clean_num(r[1]),
                        "biomass": clean_num(r[2])
                    })

            # Hitung metrics turunan jika formula Google Sheets kosong
            initial_biomass = clean_num(summary_dict.get("Biomassa awal (g)", 643.5))
            initial_pop = int(clean_num(summary_dict.get("Populasi awal (ekor)", 33)))
            initial_weight = clean_num(summary_dict.get("Bobot awal/ekor (g)", 19.5))
            total_feed = clean_num(summary_dict.get("Total pakan aktual (g)", 12294.0))

            # Ambil nilai terakhir dari sampling recap
            latest_recap = sampling_recap[-1] if sampling_recap else {}
            curr_biomass = clean_num(summary_dict.get("Biomassa akhir (g)")) or clean_num(latest_recap.get("biomass", 5166.0))
            curr_weight = clean_num(summary_dict.get("Bobot rata-rata akhir (g/ekor)")) or clean_num(latest_recap.get("avg_weight", 61.5))
            curr_pop = int(clean_num(summary_dict.get("Populasi akhir (ekor)"))) or (84 if curr_biomass > 2000 else initial_pop)

            biomass_gain = curr_biomass - initial_biomass
            fcr = round(total_feed / max(1.0, biomass_gain), 2) if biomass_gain > 0 else 0.0

            result = {
                "status": "success",
                "module": mod,
                "sheet_title": sheet_title,
                "summary": {
                    "start_date": summary_dict.get("Tanggal mulai", "8/10/2026"),
                    "end_date": summary_dict.get("Tanggal akhir", "12/31/2026"),
                    "duration_days": int(clean_num(summary_dict.get("Lama pemeliharaan (hari)", 144))),
                    "initial_population": initial_pop,
                    "initial_weight_gram": initial_weight,
                    "initial_biomass_gram": initial_biomass,
                    "current_population": curr_pop,
                    "current_weight_gram": curr_weight,
                    "current_biomass_gram": curr_biomass,
                    "total_feed_gram": total_feed,
                    "biomass_gain_gram": round(biomass_gain, 1),
                    "fcr": fcr,
                    "mortality_count": max(0, initial_pop - curr_pop) if initial_pop > curr_pop else 0,
                    "mortality_percent": round(max(0.0, ((initial_pop - curr_pop) / initial_pop * 100)), 2) if initial_pop > 0 else 0.0
                },
                "sampling_recap": sampling_recap,
                "last_sync": datetime.now().strftime("%H:%M:%S WITA")
            }

            _cultivation_cache[cache_key] = {"data": result, "timestamp": now}
            return result

        # UNTUK MODUL TABEL (CHECKLIST, FEEDING, SAMPLING, MAINTENANCE)
        headers = [h.strip() for h in all_vals[0] if h.strip()]
        data_rows = []

        for idx, row in enumerate(all_vals[1:], start=2):
            if not row or not any(str(c).strip() != "" for c in row):
                continue

            first_cell = str(row[0]).strip()
            if first_cell.startswith("Petunjuk") or first_cell.startswith("Catatan"):
                break

            item = {"row_idx": idx}
            for col_idx, col_name in enumerate(headers):
                item[col_name] = row[col_idx] if col_idx < len(row) else ""

            data_rows.append(item)

        # Gabungkan dengan data lokal SQLite jika ada perubahan offline
        conn = get_db()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT row_idx, record_data FROM cultivation_records WHERE module = ?", (mod,))
            local_edits = cursor.fetchall()
            local_map = {}
            for le in local_edits:
                try:
                    local_map[le["row_idx"]] = json.loads(le["record_data"])
                except Exception:
                    pass

            existing_indices = {r["row_idx"] for r in data_rows}
            # Update baris dengan data lokal terbaru jika ada
            for r in data_rows:
                r_idx = r["row_idx"]
                if r_idx in local_map:
                    r.update(local_map[r_idx])
                    r["_is_local"] = True

            # Tambahkan baris lokal baru yang belum ada di sheets
            for r_idx, local_item in local_map.items():
                if r_idx not in existing_indices:
                    data_rows.append(local_item)
        finally:
            conn.close()

        result = {
            "status": "success",
            "module": mod,
            "sheet_title": sheet_title,
            "headers": headers,
            "rows": data_rows,
            "total_rows": len(data_rows),
            "last_sync": datetime.now().strftime("%H:%M:%S WITA")
        }

        _cultivation_cache[cache_key] = {"data": result, "timestamp": now}
        return result

    except Exception as e:
        print(f"Error reading module {module}: {e}")
        raise HTTPException(status_code=500, detail=f"Gagal membaca data dari Google Sheets: {str(e)}")


# ====================================================================
# 3. POST / CREATE RECORD
# ====================================================================
class CultivationRecordPayload(BaseModel):
    data: Dict[str, Any]
    row_idx: Optional[int] = None


@router.post("/{module}")
def create_cultivation_record(module: str, payload: CultivationRecordPayload):
    mod = module.lower().strip()
    if mod not in SHEET_NAMES or mod in ("recap", "rekap"):
        raise HTTPException(status_code=400, detail="Modul tidak valid untuk penambahan data.")

    sheet_title = SHEET_NAMES[mod]
    rec = payload.data
    client = get_gspread_client()

    date_str = str(rec.get("Tanggal") or rec.get("date") or datetime.now().strftime("%m/%d/%Y")).strip()
    day_str = str(rec.get("Hari") or rec.get("day") or parse_day_from_date(date_str)).strip()

    # Bangun array baris Google Sheets sesuai struktur kolom masing-masing sheet
    values_to_save = []
    target_row = payload.row_idx

    try:
        sh = client.open_by_key(LOGBOOK_SPREADSHEET_ID) if client else None
        w = sh.worksheet(sheet_title) if sh else None
        all_vals = w.get_all_values() if w else []

        # Tentukan nomor urut berikutnya jika row_idx tidak diberikan
        headers = all_vals[0] if all_vals else []
        max_no = 0
        for r in all_vals[1:]:
            if r and str(r[0]).strip().isdigit():
                max_no = max(max_no, int(r[0].strip()))
        next_no = str(max_no + 1)

        # Tentukan baris target jika belum ada
        if not target_row:
            # Cari baris pertama yang kosong atau baris berikutnya
            target_row = len(all_vals) + 1
            for idx, r in enumerate(all_vals[1:], start=2):
                if not r or not any(str(c).strip() != "" for c in r):
                    target_row = idx
                    break
                if str(r[0]).strip().startswith("Petunjuk") or str(r[0]).strip().startswith("Catatan"):
                    target_row = idx
                    break

        if mod == "checklist":
            # ['No', 'Tanggal', 'Hari', 'Pakan 09:00', 'Pakan 15:30', 'Bibis Pakan', 'Puasa', 'Sampling', 'Pengurasan', 'Kondisi Kolam', 'Catatan']
            values_to_save = [
                rec.get("No") or next_no,
                date_str,
                day_str,
                rec.get("Pakan 09:00", "✓ Selesai"),
                rec.get("Pakan 15:30", "✓ Selesai"),
                rec.get("Bibis Pakan", "✓ Selesai"),
                rec.get("Puasa", "✗ Tidak"),
                rec.get("Sampling", "✗ Tidak"),
                rec.get("Pengurasan", "✗ Tidak"),
                rec.get("Kondisi Kolam", "Baik"),
                rec.get("Catatan", "")
            ]

        elif mod in ("feeding", "pakan"):
            # ['No', 'Tanggal', 'Hari', 'Waktu', 'Biomassa Dasar (g)', 'Persentase Pakan (%)', 'Target Pakan (g)', 'Pakan Aktual (g)', 'Probiotik (ml)', 'Molase (ml)', 'Air (ml)', 'Lama Bibis (menit)', 'Status Pemberian', 'Catatan']
            formula_target = f'=IF(OR(E{target_row}="",F{target_row}=""),"",E{target_row}*F{target_row}/100)'
            values_to_save = [
                rec.get("No") or next_no,
                date_str,
                day_str,
                rec.get("Waktu", "09:00"),
                rec.get("Biomassa Dasar (g)", 5166),
                rec.get("Persentase Pakan (%)", 3.0),
                formula_target,
                rec.get("Pakan Aktual (g)", 155),
                rec.get("Probiotik (ml)", "1.5"),
                rec.get("Molase (ml)", "1.5"),
                rec.get("Air (ml)", "15"),
                rec.get("Lama Bibis (menit)", "15"),
                rec.get("Status Pemberian", "✓ Diberikan"),
                rec.get("Catatan", "")
            ]

        elif mod == "sampling":
            # ['No', 'Tanggal', 'Hari', 'Jumlah Ikan Disampling', 'Bobot Total Sampel (g)', 'Bobot Rata-rata (g/ekor)', 'Panjang Rata-rata (Cm/ekor)', 'Jumlah Ikan Hidup (ekor)', 'Estimasi Biomassa (g)', 'Persentase Pakan (%)', 'Target Pakan/Hari (g)', 'Pemberian per sekali pakan (g)']
            formula_avg_w = f'=E{target_row}/D{target_row}'
            formula_biomass = f'=IF(OR(F{target_row}="",H{target_row}=""),"",F{target_row}*H{target_row})'
            formula_target_daily = f'=IF(OR(I{target_row}="",J{target_row}=""),"",I{target_row}*J{target_row}/100)'
            formula_portion = f'=K{target_row}/2'
            values_to_save = [
                rec.get("No") or next_no,
                date_str,
                day_str,
                rec.get("Jumlah Ikan Disampling", 10),
                rec.get("Bobot Total Sampel (g)", 615),
                formula_avg_w,
                rec.get("Panjang Rata-rata (Cm/ekor)", 14.8),
                rec.get("Jumlah Ikan Hidup (ekor)", 84),
                formula_biomass,
                rec.get("Persentase Pakan (%)", 3.0),
                formula_target_daily,
                formula_portion
            ]

        elif mod in ("maintenance", "perawatan"):
            # ['No', 'Tanggal', 'Hari', 'Kegiatan', 'Tinggi Air Sebelum (cm)', 'Tinggi Air Sesudah (cm)', 'Selisih Tinggi Air (cm)', 'Estimasi Air Diganti (L)', 'Probiotik (ml)', 'Molase (ml)', 'Air (ml)', 'Total Bibis (ml)']
            formula_diff = f'=IF(OR(E{target_row}="",F{target_row}=""),"",E{target_row}-F{target_row})'
            formula_water = f'=IF(G{target_row}="","", G{target_row}*20)'
            formula_probiotic = f'=IF(H{target_row}="","",H{target_row}*450/5000)'
            formula_molasses = f'=IF(H{target_row}="","",H{target_row}*250/5000)'
            formula_air = f'=IF(H{target_row}="","",H{target_row}*1000/5000)'
            formula_total = f'=I{target_row}+J{target_row}+K{target_row}'
            values_to_save = [
                rec.get("No") or next_no,
                date_str,
                day_str,
                rec.get("Kegiatan", "Pengurasan + bibis setelah pengurasan"),
                rec.get("Tinggi Air Sebelum (cm)", 35),
                rec.get("Tinggi Air Sesudah (cm)", 25),
                formula_diff,
                formula_water,
                formula_probiotic,
                formula_molasses,
                formula_air,
                formula_total
            ]

        # Simpan ke Google Sheets jika w tersedia
        sheets_synced = False
        warning_msg = None
        if w:
            try:
                # Tentukan range huruf kolom akhir (misal K atau N atau L)
                end_col_letter = chr(ord('A') + len(values_to_save) - 1)
                update_range = f"A{target_row}:{end_col_letter}{target_row}"
                w.update(range_name=update_range, values=[values_to_save], value_input_option="USER_ENTERED")
                sheets_synced = True
            except Exception as sheet_err:
                print(f"Warning saat update Google Sheets: {sheet_err}")
                sheets_synced = False
                warning_msg = "Disimpan di database lokal. Untuk sinkron langsung ke Google Sheets, pastikan feeder-bot@smartfeeder-api.iam.gserviceaccount.com memiliki hak Editor."

        # Simpan juga ke database SQLite lokal untuk persistensi instan & anti-kehilangan data
        conn = get_db()
        try:
            cursor = conn.cursor()
            # Bangun object item untuk disatukan
            merged_item = dict(rec)
            merged_item["No"] = values_to_save[0]
            merged_item["Tanggal"] = date_str
            merged_item["Hari"] = day_str
            merged_item["row_idx"] = target_row

            cursor.execute("""
                INSERT INTO cultivation_records (module, row_idx, record_data, synced_to_sheets, updated_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            """, (mod, target_row, json.dumps(merged_item), 1 if sheets_synced else 0))
            conn.commit()

            # Jika ini sampling baru, sinkronkan juga ke biomass_settings
            if mod == "sampling":
                try:
                    fish_count = int(clean_num(rec.get("Jumlah Ikan Hidup (ekor)", 84)))
                    avg_w = clean_num(rec.get("Bobot Total Sampel (g)", 615)) / max(1, clean_num(rec.get("Jumlah Ikan Disampling", 10)))
                    total_kg = round((fish_count * avg_w) / 1000.0, 2)
                    cursor.execute("""
                        UPDATE biomass_settings
                        SET fish_count = ?, avg_weight_gram = ?, total_biomass_kg = ?, updated_at = CURRENT_TIMESTAMP
                        WHERE id = 1
                    """, (fish_count, avg_w, total_kg))
                    conn.commit()
                except Exception:
                    pass
        finally:
            conn.close()

        # Bersihkan cache agar refresh berikutnya mengambil data baru
        _cultivation_cache.pop(f"{mod}_data", None)
        _cultivation_cache.pop("recap_data", None)

        return {
            "status": "success",
            "message": f"Data {sheet_title} berhasil disimpan!",
            "row_idx": target_row,
            "synced_to_sheets": sheets_synced,
            "warning": warning_msg,
            "data": rec
        }

    except Exception as e:
        print(f"Error saving cultivation record: {e}")
        raise HTTPException(status_code=500, detail=f"Gagal menyimpan data: {str(e)}")


# ====================================================================
# 4. PUT / UPDATE RECORD
# ====================================================================
@router.put("/{module}/{row_idx}")
def update_cultivation_record(module: str, row_idx: int, payload: CultivationRecordPayload):
    payload.row_idx = row_idx
    return create_cultivation_record(module, payload)


# ====================================================================
# 5. SYNC PENDING LOCAL RECORDS TO GOOGLE SHEETS
# ====================================================================
@router.post("/sync/pending")
def sync_pending_records():
    client = get_gspread_client()
    if not client:
        raise HTTPException(status_code=500, detail="Koneksi Google Sheets belum siap.")

    conn = get_db()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, module, row_idx, record_data FROM cultivation_records WHERE synced_to_sheets = 0")
        pending = cursor.fetchall()
        if not pending:
            return {"status": "success", "message": "Semua data lokal sudah tersinkron ke Google Sheets.", "synced_count": 0}

        sh = client.open_by_key(LOGBOOK_SPREADSHEET_ID)
        synced_ids = []
        errors = []

        for p in pending:
            rec_id = p["id"]
            mod = p["module"]
            target_row = p["row_idx"]
            try:
                rec = json.loads(p["record_data"])
                sheet_title = SHEET_NAMES.get(mod)
                if not sheet_title:
                    continue

                w = sh.worksheet(sheet_title)
                all_vals = w.get_all_values()
                date_str = str(rec.get("Tanggal") or datetime.now().strftime("%m/%d/%Y")).strip()
                day_str = str(rec.get("Hari") or parse_day_from_date(date_str)).strip()

                if mod == "checklist":
                    values_to_save = [
                        rec.get("No") or str(target_row - 1),
                        date_str,
                        day_str,
                        rec.get("Pakan 09:00", "✓ Selesai"),
                        rec.get("Pakan 15:30", "✓ Selesai"),
                        rec.get("Bibis Pakan", "✓ Selesai"),
                        rec.get("Puasa", "✗ Tidak"),
                        rec.get("Sampling", "✗ Tidak"),
                        rec.get("Pengurasan", "✗ Tidak"),
                        rec.get("Kondisi Kolam", "Baik"),
                        rec.get("Catatan", "")
                    ]
                elif mod in ("feeding", "pakan"):
                    formula_target = f'=IF(OR(E{target_row}="",F{target_row}=""),"",E{target_row}*F{target_row}/100)'
                    values_to_save = [
                        rec.get("No") or str(target_row - 1),
                        date_str,
                        day_str,
                        rec.get("Waktu", "09:00"),
                        rec.get("Biomassa Dasar (g)", 5166),
                        rec.get("Persentase Pakan (%)", 3.0),
                        formula_target,
                        rec.get("Pakan Aktual (g)", 155),
                        rec.get("Probiotik (ml)", "1.5"),
                        rec.get("Molase (ml)", "1.5"),
                        rec.get("Air (ml)", "15"),
                        rec.get("Lama Bibis (menit)", "15"),
                        rec.get("Status Pemberian", "✓ Diberikan"),
                        rec.get("Catatan", "")
                    ]
                elif mod == "sampling":
                    formula_avg_w = f'=E{target_row}/D{target_row}'
                    formula_biomass = f'=IF(OR(F{target_row}="",H{target_row}=""),"",F{target_row}*H{target_row})'
                    formula_target_daily = f'=IF(OR(I{target_row}="",J{target_row}=""),"",I{target_row}*J{target_row}/100)'
                    formula_portion = f'=K{target_row}/2'
                    values_to_save = [
                        rec.get("No") or str(target_row - 1),
                        date_str,
                        day_str,
                        rec.get("Jumlah Ikan Disampling", 10),
                        rec.get("Bobot Total Sampel (g)", 615),
                        formula_avg_w,
                        rec.get("Panjang Rata-rata (Cm/ekor)", 14.8),
                        rec.get("Jumlah Ikan Hidup (ekor)", 84),
                        formula_biomass,
                        rec.get("Persentase Pakan (%)", 3.0),
                        formula_target_daily,
                        formula_portion
                    ]
                elif mod in ("maintenance", "perawatan"):
                    formula_diff = f'=IF(OR(E{target_row}="",F{target_row}=""),"",E{target_row}-F{target_row})'
                    formula_water = f'=IF(G{target_row}="","", G{target_row}*20)'
                    formula_probiotic = f'=IF(H{target_row}="","",H{target_row}*450/5000)'
                    formula_molasses = f'=IF(H{target_row}="","",H{target_row}*250/5000)'
                    formula_air = f'=IF(H{target_row}="","",H{target_row}*1000/5000)'
                    formula_total = f'=I{target_row}+J{target_row}+K{target_row}'
                    values_to_save = [
                        rec.get("No") or str(target_row - 1),
                        date_str,
                        day_str,
                        rec.get("Kegiatan", "Pengurasan + bibis setelah pengurasan"),
                        rec.get("Tinggi Air Sebelum (cm)", 35),
                        rec.get("Tinggi Air Sesudah (cm)", 25),
                        formula_diff,
                        formula_water,
                        formula_probiotic,
                        formula_molasses,
                        formula_air,
                        formula_total
                    ]
                else:
                    continue

                end_col_letter = chr(ord('A') + len(values_to_save) - 1)
                update_range = f"A{target_row}:{end_col_letter}{target_row}"
                w.update(range_name=update_range, values=[values_to_save], value_input_option="USER_ENTERED")
                synced_ids.append(rec_id)
            except Exception as item_err:
                errors.append(f"Record {rec_id}: {str(item_err)}")
                break

        if synced_ids:
            placeholders = ",".join("?" for _ in synced_ids)
            cursor.execute(f"UPDATE cultivation_records SET synced_to_sheets = 1 WHERE id IN ({placeholders})", synced_ids)
            conn.commit()

        return {
            "status": "success",
            "synced_count": len(synced_ids),
            "total_pending": len(pending),
            "errors": errors
        }
    finally:
        conn.close()
