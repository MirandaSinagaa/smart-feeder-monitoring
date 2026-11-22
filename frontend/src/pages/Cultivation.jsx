import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    CheckSquare, 
    Utensils, 
    Scale, 
    Wrench, 
    FileText, 
    RefreshCw, 
    Plus, 
    Edit2, 
    ExternalLink, 
    Search, 
    CheckCircle2, 
    X, 
    ChevronDown
} from 'lucide-react';
import api from '../api';
import { useSensor } from '../context/SensorContext';
import Pagination from '../components/Pagination';

const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1-5Twlt3EUlWii5_3bXzSlF7qPSkBSQ2_FRHkLLkGdEg/edit?gid=1129568060#gid=1129568060";

const Cultivation = () => {
    const { tab } = useParams();
    const navigate = useNavigate();
    const { showToast } = useSensor() || {};

    // 5 Tab Utama
    const activeTab = useMemo(() => {
        const valid = ['checklist', 'feeding', 'sampling', 'maintenance', 'recap'];
        return valid.includes(tab) ? tab : 'checklist';
    }, [tab]);

    const setActiveTab = (newTab) => {
        navigate(`/cultivation/${newTab}`);
    };

    // Dropdown Navigation State & Click-outside handler
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // State Data per Tab
    const [checklistData, setChecklistData] = useState({ rows: [], headers: [] });
    const [feedingData, setFeedingData] = useState({ rows: [], headers: [] });
    const [samplingData, setSamplingData] = useState({ rows: [], headers: [] });
    const [maintenanceData, setMaintenanceData] = useState({ rows: [], headers: [] });
    const [recapData, setRecapData] = useState({ summary: {}, sampling_recap: [] });

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [lastSyncTime, setLastSyncTime] = useState('');

    // Modal Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingRowIdx, setEditingRowIdx] = useState(null);
    const [formData, setFormData] = useState({});

    // Kunci scroll body ketika modal terbuka agar selalu berada di tengah viewport
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isModalOpen]);

    // Fetch Data Modul Aktif saat Tab Berubah
    useEffect(() => {
        let isMounted = true;
        const loadModuleData = async () => {
            try {
                const res = await api.get(`/api/cultivation/${activeTab}`);
                if (isMounted && res.data && res.data.status === 'success') {
                    if (activeTab === 'checklist') setChecklistData(res.data);
                    else if (activeTab === 'feeding') setFeedingData(res.data);
                    else if (activeTab === 'sampling') setSamplingData(res.data);
                    else if (activeTab === 'maintenance') setMaintenanceData(res.data);
                    else if (activeTab === 'recap') setRecapData(res.data);

                    if (res.data.last_sync) setLastSyncTime(res.data.last_sync);
                }
            } catch (err) {
                console.error('Gagal memuat data budidaya:', err);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                    setIsRefreshing(false);
                }
            }
        };

        loadModuleData();
        return () => {
            isMounted = false;
        };
    }, [activeTab]);

    // Manual Refresh Data Modul Aktif
    const fetchModuleData = async (forceRefresh = false) => {
        try {
            if (forceRefresh) {
                setIsRefreshing(true);
                // Coba sinkronkan record lokal yang tertunda ke Google Sheets jika ada
                try {
                    const syncRes = await api.post('/api/cultivation/sync/pending');
                    if (syncRes.data && syncRes.data.synced_count > 0 && showToast) {
                        showToast(`${syncRes.data.synced_count} catatan berhasil disinkronkan ke Google Sheets!`, 'success');
                    }
                } catch (e) {
                    console.debug('Pending sync check:', e);
                }
            } else {
                setIsLoading(true);
            }

            const res = await api.get(`/api/cultivation/${activeTab}${forceRefresh ? '?force_refresh=true' : ''}`);
            if (res.data && res.data.status === 'success') {
                if (activeTab === 'checklist') setChecklistData(res.data);
                else if (activeTab === 'feeding') setFeedingData(res.data);
                else if (activeTab === 'sampling') setSamplingData(res.data);
                else if (activeTab === 'maintenance') setMaintenanceData(res.data);
                else if (activeTab === 'recap') setRecapData(res.data);

                if (res.data.last_sync) setLastSyncTime(res.data.last_sync);
            }
        } catch (err) {
            console.error('Gagal memuat data budidaya:', err);
            if (showToast) showToast('Gagal memuat data dari Google Sheets', 'error');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    // Buka Modal Tambah Data Baru
    const handleOpenAddModal = () => {
        setEditingRowIdx(null);
        const todayStr = new Date().toLocaleDateString('en-US'); // format M/D/YYYY sesuai sheet

        if (activeTab === 'checklist') {
            setFormData({
                Tanggal: todayStr,
                "Pakan 09:00": "✓ Selesai",
                "Pakan 15:30": "✓ Selesai",
                "Bibis Pakan": "✓ Selesai",
                "Puasa": "✗ Tidak",
                "Sampling": "✗ Tidak",
                "Pengurasan": "✗ Tidak",
                "Kondisi Kolam": "Baik",
                "Catatan": ""
            });
        } else if (activeTab === 'feeding') {
            setFormData({
                Tanggal: todayStr,
                Waktu: "09:00",
                "Biomassa Dasar (g)": 5166,
                "Persentase Pakan (%)": 3.0,
                "Pakan Aktual (g)": 155,
                "Probiotik (ml)": "1.5",
                "Molase (ml)": "1.5",
                "Air (ml)": "15",
                "Lama Bibis (menit)": "15",
                "Status Pemberian": "✓ Diberikan",
                Catatan: ""
            });
        } else if (activeTab === 'sampling') {
            setFormData({
                Tanggal: todayStr,
                "Jumlah Ikan Disampling": 10,
                "Bobot Total Sampel (g)": 615,
                "Panjang Rata-rata (Cm/ekor)": 14.8,
                "Jumlah Ikan Hidup (ekor)": 84,
                "Persentase Pakan (%)": 3.0
            });
        } else if (activeTab === 'maintenance') {
            setFormData({
                Tanggal: todayStr,
                Kegiatan: "Pengurasan + bibis setelah pengurasan",
                "Tinggi Air Sebelum (cm)": 35,
                "Tinggi Air Sesudah (cm)": 25
            });
        }

        setIsModalOpen(true);
    };

    // Buka Modal Edit Baris yang Ada
    const handleOpenEditModal = (row) => {
        setEditingRowIdx(row.row_idx);
        setFormData({ ...row });
        setIsModalOpen(true);
    };

    // Simpan Form (POST / PUT ke FastAPI & Google Sheets)
    const handleSaveForm = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const url = editingRowIdx 
                ? `/api/cultivation/${activeTab}/${editingRowIdx}` 
                : `/api/cultivation/${activeTab}`;
            const method = editingRowIdx ? 'put' : 'post';

            const res = await api[method](url, {
                data: formData,
                row_idx: editingRowIdx
            });

            if (res.data && res.data.status === 'success') {
                if (showToast) {
                    if (res.data.synced_to_sheets) {
                        showToast(res.data.message || 'Data berhasil disimpan dan disinkronkan ke Google Sheets!', 'success');
                    } else {
                        showToast(res.data.warning || 'Data disimpan di database lokal. Agar otomatis tersinkron ke Google Sheets, pastikan feeder-bot@smartfeeder-api.iam.gserviceaccount.com memiliki izin Editor.', 'warning');
                    }
                }
                setIsModalOpen(false);
                fetchModuleData(true);
            }
        } catch (err) {
            console.error('Gagal menyimpan catatan:', err);
            if (showToast) {
                showToast(err.response?.data?.detail || 'Gagal menyimpan data ke Google Sheets', 'error');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // 5 Tab Header Navigation
    const tabs = [
        { id: 'checklist', label: 'Checklist Harian', icon: CheckSquare, desc: '01_CHECKLIST_HARIAN' },
        { id: 'feeding', label: 'Pemberian Pakan', icon: Utensils, desc: '02_PAKAN' },
        { id: 'sampling', label: 'Sampling Ikan', icon: Scale, desc: '03_SAMPLING' },
        { id: 'maintenance', label: 'Perawatan Kolam', icon: Wrench, desc: '04_PERAWATAN_KOLAM' },
        { id: 'recap', label: 'Rekapitulasi Budidaya', icon: FileText, desc: '05_REKAP' },
    ];

    return (
        <div className="space-y-4 max-w-7xl mx-auto select-none">
            {/* Hero Banner Card - Vibe Elegan, Kalem & Senada dengan Tampilan Login */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs transition-all animate-card-slideup">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5 mb-2.5">
                            <span className="text-[10px] sm:text-xs font-extrabold tracking-widest text-sky-700 dark:text-sky-400 uppercase bg-sky-50 dark:bg-sky-950/70 border border-sky-200/60 dark:border-sky-800 px-3 py-1 rounded-full inline-block">
                                PENCATATAN DATA BUDIDAYA
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                Living Lab Bioflok C
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                            Pusat Pencatatan Data Budidaya Kolam Bioflok
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl font-normal leading-relaxed">
                            Pengelolaan dan pencatatan operasional budidaya ikan nila terintegrasi otomatis dua arah dengan Google Sheets.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        {/* Tombol Segarkan Data */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                fetchModuleData(true);
                            }}
                            disabled={isRefreshing}
                            className="px-4 py-2.5 bg-sky-900 hover:bg-sky-950 dark:bg-sky-600 dark:hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
                            title="Tarik pembaruan dari Google Sheets"
                        >
                            <RefreshCw size={13} className={`${isRefreshing ? 'animate-spin' : ''}`} />
                            <span>{isRefreshing ? 'Menyinkronkan...' : 'Segarkan Data'}</span>
                        </button>

                        {/* Tombol Buka di Google Sheets */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(SPREADSHEET_URL, '_blank');
                            }}
                            className="px-4 py-2.5 bg-[#007ba7] hover:bg-[#006990] text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-[0.99]"
                            title="Buka Spreadsheet di Tab Baru"
                        >
                            <span>Google Sheets</span>
                            <ExternalLink size={13} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Header Kontrol Modul Pencatatan (Tepat di atas Checklist Harian) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Dropdown Selector Modul (Sesuai Desain Referensi Langsung di Atas Checklist) */}
                <div className="relative inline-block" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen(prev => !prev)}
                        className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    >
                        {(() => {
                            const cur = tabs.find(t => t.id === activeTab) || tabs[0];
                            const Icon = cur.icon;
                            return (
                                <>
                                    <div className="p-1 rounded-lg bg-sky-100/70 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 shrink-0">
                                        <Icon size={16} />
                                    </div>
                                    <span className="text-sm font-bold text-slate-800 dark:text-white">
                                        {cur.label}
                                    </span>
                                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold shrink-0">
                                        {cur.desc}
                                    </span>
                                    <ChevronDown size={15} className={`text-slate-400 ml-1 transition-transform duration-200 shrink-0 ${isDropdownOpen ? 'rotate-180 text-sky-600' : ''}`} />
                                </>
                            );
                        })()}
                    </button>

                    {/* Dropdown Popover List */}
                    {isDropdownOpen && (
                        <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                            {tabs.map((t) => {
                                const Icon = t.icon;
                                const isActive = activeTab === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => {
                                            setActiveTab(t.id);
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs text-left transition-colors cursor-pointer ${
                                            isActive
                                                ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-bold'
                                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 truncate">
                                            <div className={`p-1.5 rounded-lg ${isActive ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                                <Icon size={14} />
                                            </div>
                                            <span className="font-bold">{t.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[10px] font-mono text-slate-400">{t.desc}</span>
                                            {isActive && <CheckCircle2 size={14} className="text-sky-600 dark:text-sky-400" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Tombol Tambah Data Baru & Status Sinkron */}
                <div className="flex items-center gap-3 self-start sm:self-auto">
                    {lastSyncTime && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium hidden md:inline-block">
                            Sinkron terakhir: {lastSyncTime}
                        </span>
                    )}
                    {activeTab !== 'recap' && (
                        <button
                            onClick={handleOpenAddModal}
                            className="px-4 py-2.5 bg-[#0284C7] hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                        >
                            <Plus size={15} />
                            <span>Tambah Data Baru</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Konten Tab Aktif */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs mb-8">

                {/* TAB 1: CHECKLIST HARIAN */}
                {activeTab === 'checklist' && (
                    <ChecklistView 
                        data={checklistData} 
                        isLoading={isLoading} 
                        onEdit={handleOpenEditModal} 
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                    />
                )}

                {/* TAB 2: PEMBERIAN PAKAN */}
                {activeTab === 'feeding' && (
                    <FeedingView 
                        data={feedingData} 
                        isLoading={isLoading} 
                        onEdit={handleOpenEditModal}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                    />
                )}

                {/* TAB 3: SAMPLING IKAN */}
                {activeTab === 'sampling' && (
                    <SamplingView 
                        data={samplingData} 
                        isLoading={isLoading} 
                        onEdit={handleOpenEditModal}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                    />
                )}

                {/* TAB 4: PERAWATAN KOLAM */}
                {activeTab === 'maintenance' && (
                    <MaintenanceView 
                        data={maintenanceData} 
                        isLoading={isLoading} 
                        onEdit={handleOpenEditModal}
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                    />
                )}

                {/* TAB 5: REKAPITULASI BUDIDAYA */}
                {activeTab === 'recap' && (
                    <RecapView 
                        data={recapData} 
                        isLoading={isLoading} 
                    />
                )}
            </div>

            {/* Modal Tambah / Edit Data (Rendered via Portal langsung ke document.body) */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
                        {/* Modal Header */}
                        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
                            <div>
                                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                    {editingRowIdx ? `Edit Catatan Baris #${editingRowIdx}` : `Tambah ${tabs.find(t => t.id === activeTab)?.label}`}
                                </h4>
                                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                                    Data otomatis disinkronkan ke sheet {tabs.find(t => t.id === activeTab)?.desc}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body Form */}
                        <form onSubmit={handleSaveForm} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
                            {/* Input Tanggal */}
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tanggal (M/D/YYYY)</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium outline-none focus:border-sky-600"
                                    value={formData.Tanggal || formData.date || ''}
                                    onChange={(e) => setFormData({ ...formData, Tanggal: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Form Dinamis Berdasarkan Tab */}
                            {activeTab === 'checklist' && (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pakan 09:00</label>
                                            <select
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                                                value={formData["Pakan 09:00"] || "✓ Selesai"}
                                                onChange={(e) => setFormData({ ...formData, "Pakan 09:00": e.target.value })}
                                            >
                                                <option value="✓ Selesai">✓ Selesai</option>
                                                <option value="✗ Tidak">✗ Tidak</option>
                                                <option value="-">-</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pakan 15:30</label>
                                            <select
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                                                value={formData["Pakan 15:30"] || "✓ Selesai"}
                                                onChange={(e) => setFormData({ ...formData, "Pakan 15:30": e.target.value })}
                                            >
                                                <option value="✓ Selesai">✓ Selesai</option>
                                                <option value="✗ Tidak">✗ Tidak</option>
                                                <option value="-">-</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bibis Pakan</label>
                                            <select
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                                                value={formData["Bibis Pakan"] || "✓ Selesai"}
                                                onChange={(e) => setFormData({ ...formData, "Bibis Pakan": e.target.value })}
                                            >
                                                <option value="✓ Selesai">✓ Selesai</option>
                                                <option value="✗ Tidak">✗ Tidak</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Puasa Ikan</label>
                                            <select
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                                                value={formData["Puasa"] || "✗ Tidak"}
                                                onChange={(e) => setFormData({ ...formData, "Puasa": e.target.value })}
                                            >
                                                <option value="✗ Tidak">✗ Tidak</option>
                                                <option value="✓ Ya">✓ Ya</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sampling Ikan</label>
                                            <select
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                                                value={formData["Sampling"] || "✗ Tidak"}
                                                onChange={(e) => setFormData({ ...formData, "Sampling": e.target.value })}
                                            >
                                                <option value="✗ Tidak">✗ Tidak</option>
                                                <option value="✓ Selesai">✓ Selesai</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pengurasan Air</label>
                                            <select
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                                                value={formData["Pengurasan"] || "✗ Tidak"}
                                                onChange={(e) => setFormData({ ...formData, "Pengurasan": e.target.value })}
                                            >
                                                <option value="✗ Tidak">✗ Tidak</option>
                                                <option value="✓ Selesai">✓ Selesai</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Kondisi Kolam</label>
                                        <select
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                                            value={formData["Kondisi Kolam"] || "Baik"}
                                            onChange={(e) => setFormData({ ...formData, "Kondisi Kolam": e.target.value })}
                                        >
                                            <option value="Baik">Baik</option>
                                            <option value="Optimal">Optimal</option>
                                            <option value="Perlu perhatian">Perlu perhatian</option>
                                            <option value="Kritis">Kritis</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                                            placeholder="Contoh: Nafsu makan ikan sangat baik"
                                            value={formData.Catatan || ''}
                                            onChange={(e) => setFormData({ ...formData, Catatan: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'feeding' && (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Waktu Pakan</label>
                                            <select
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                                                value={formData.Waktu || "09:00"}
                                                onChange={(e) => setFormData({ ...formData, Waktu: e.target.value })}
                                            >
                                                <option value="09:00">09:00 (Pagi)</option>
                                                <option value="15:30">15:30 (Sore)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Pakan Aktual (gram)</label>
                                            <input
                                                type="number"
                                                step="any"
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                                                value={formData["Pakan Aktual (g)"] || ''}
                                                onChange={(e) => setFormData({ ...formData, "Pakan Aktual (g)": e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Biomassa Dasar (g)</label>
                                            <input
                                                type="number"
                                                step="any"
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                                                value={formData["Biomassa Dasar (g)"] || 5166}
                                                onChange={(e) => setFormData({ ...formData, "Biomassa Dasar (g)": e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Persentase Pakan (%)</label>
                                            <input
                                                type="number"
                                                step="any"
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                                                value={formData["Persentase Pakan (%)"] || 3.0}
                                                onChange={(e) => setFormData({ ...formData, "Persentase Pakan (%)": e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-2.5 rounded-xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800/60 text-[11px] text-sky-800 dark:text-sky-300">
                                        Target pakan harian otomatis dihitung dari rumus: <strong>Biomassa × Persentase Pakan = {((Number(formData["Biomassa Dasar (g)"] || 5166) * Number(formData["Persentase Pakan (%)"] || 3.0)) / 100).toFixed(2)} gram/hari</strong>.
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Probiotik (ml)</label>
                                            <input
                                                type="text"
                                                className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                                                value={formData["Probiotik (ml)"] || "1.5"}
                                                onChange={(e) => setFormData({ ...formData, "Probiotik (ml)": e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Molase (ml)</label>
                                            <input
                                                type="text"
                                                className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                                                value={formData["Molase (ml)"] || "1.5"}
                                                onChange={(e) => setFormData({ ...formData, "Molase (ml)": e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Air Bibis (ml)</label>
                                            <input
                                                type="text"
                                                className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                                                value={formData["Air (ml)"] || "15"}
                                                onChange={(e) => setFormData({ ...formData, "Air (ml)": e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Status Pemberian</label>
                                        <select
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                                            value={formData["Status Pemberian"] || "✓ Diberikan"}
                                            onChange={(e) => setFormData({ ...formData, "Status Pemberian": e.target.value })}
                                        >
                                            <option value="✓ Diberikan">✓ Diberikan</option>
                                            <option value="✗ Tidak">✗ Tidak</option>
                                            <option value="Ditunda">Ditunda</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                                            placeholder="Catatan tambahan pemberian pakan"
                                            value={formData.Catatan || ''}
                                            onChange={(e) => setFormData({ ...formData, Catatan: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'sampling' && (
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jumlah Ikan Disampling (ekor)</label>
                                            <input
                                                type="number"
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                                                value={formData["Jumlah Ikan Disampling"] || 10}
                                                onChange={(e) => setFormData({ ...formData, "Jumlah Ikan Disampling": e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Bobot Total Sampel (gram)</label>
                                            <input
                                                type="number"
                                                step="any"
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                                                value={formData["Bobot Total Sampel (g)"] || ''}
                                                onChange={(e) => setFormData({ ...formData, "Bobot Total Sampel (g)": e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Panjang Rata-rata (cm)</label>
                                            <input
                                                type="number"
                                                step="any"
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                                                value={formData["Panjang Rata-rata (Cm/ekor)"] || ''}
                                                onChange={(e) => setFormData({ ...formData, "Panjang Rata-rata (Cm/ekor)": e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Jumlah Ikan Hidup di Kolam (ekor)</label>
                                            <input
                                                type="number"
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                                                value={formData["Jumlah Ikan Hidup (ekor)"] || 84}
                                                onChange={(e) => setFormData({ ...formData, "Jumlah Ikan Hidup (ekor)": e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {formData["Bobot Total Sampel (g)"] && formData["Jumlah Ikan Disampling"] && (
                                        <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800 text-[11px] space-y-1">
                                            <div className="flex justify-between">
                                                <span>Bobot Rata-rata Ikan:</span>
                                                <strong className="text-sky-900 dark:text-sky-300 font-mono">
                                                    {(Number(formData["Bobot Total Sampel (g)"]) / Number(formData["Jumlah Ikan Disampling"])).toFixed(2)} g/ekor
                                                </strong>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Estimasi Total Biomassa Kolam:</span>
                                                <strong className="text-emerald-700 dark:text-emerald-400 font-mono">
                                                    {((Number(formData["Bobot Total Sampel (g)"]) / Number(formData["Jumlah Ikan Disampling"])) * Number(formData["Jumlah Ikan Hidup (ekor)"] || 84)).toFixed(1)} gram
                                                </strong>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'maintenance' && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Aktivitas Kegiatan</label>
                                        <select
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                                            value={formData.Kegiatan || "Pengurasan + bibis setelah pengurasan"}
                                            onChange={(e) => setFormData({ ...formData, Kegiatan: e.target.value })}
                                        >
                                            <option value="Pengurasan + bibis setelah pengurasan">Pengurasan + bibis setelah pengurasan</option>
                                            <option value="Penambahan air kolam">Penambahan air kolam</option>
                                            <option value="Pemberian probiotik & molase">Pemberian probiotik & molase</option>
                                            <option value="Pembersihan aerator & filter bioflok">Pembersihan aerator & filter bioflok</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tinggi Air Sebelum (cm)</label>
                                            <input
                                                type="number"
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                                                value={formData["Tinggi Air Sebelum (cm)"] || 35}
                                                onChange={(e) => setFormData({ ...formData, "Tinggi Air Sebelum (cm)": e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tinggi Air Sesudah (cm)</label>
                                            <input
                                                type="number"
                                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                                                value={formData["Tinggi Air Sesudah (cm)"] || 25}
                                                onChange={(e) => setFormData({ ...formData, "Tinggi Air Sesudah (cm)": e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {formData["Tinggi Air Sebelum (cm)"] && formData["Tinggi Air Sesudah (cm)"] && (
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                                            <div className="flex justify-between">
                                                <span>Selisih Penurunan Air:</span>
                                                <strong className="font-mono">{Number(formData["Tinggi Air Sebelum (cm)"]) - Number(formData["Tinggi Air Sesudah (cm)"])} cm</strong>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Estimasi Volume Diganti:</span>
                                                <strong className="text-sky-700 dark:text-sky-300 font-mono">{(Number(formData["Tinggi Air Sebelum (cm)"]) - Number(formData["Tinggi Air Sesudah (cm)"])) * 20} Liter</strong>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tombol Simpan & Batal */}
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                    Batal
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 bg-sky-900 hover:bg-sky-950 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <RefreshCw size={13} className="animate-spin" />
                                            <span>Menyimpan ke Google Sheets...</span>
                                        </>
                                    ) : (
                                        <span>Simpan ke Google Sheets</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

// ====================================================================
// SUB-KOMPONEN TABEL 1: CHECKLIST HARIAN
// ====================================================================
const ChecklistView = ({ data, isLoading, onEdit, searchQuery, setSearchQuery }) => {
    const rows = useMemo(() => data?.rows || [], [data?.rows]);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredRows = useMemo(() => {
        if (!searchQuery) return rows;
        return rows.filter(r => 
            String(r.Tanggal || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(r.Hari || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(r['Kondisi Kolam'] || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(r.Catatan || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [rows, searchQuery]);

    const displayRows = useMemo(() => [...filteredRows].reverse(), [filteredRows]);
    const totalPages = Math.max(1, Math.ceil(displayRows.length / 10));
    const activePage = Math.min(currentPage, totalPages);

    const paginatedRows = useMemo(() => {
        const start = (activePage - 1) * 10;
        return displayRows.slice(start, start + 10);
    }, [displayRows, activePage]);

    if (isLoading) {
        return <div className="p-8 text-center text-xs text-slate-400 animate-pulse">Memuat lembar checklist harian...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="relative w-64 max-w-full">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari tanggal, hari, kondisi..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none"
                    />
                </div>
                <span className="text-xs text-slate-400 font-medium">Total {rows.length} catatan checklist</span>
            </div>

            <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs divide-y divide-slate-200/80 dark:divide-slate-800">
                    <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                            <th className="px-3 py-2.5">No</th>
                            <th className="px-3 py-2.5">Tanggal</th>
                            <th className="px-3 py-2.5">Hari</th>
                            <th className="px-3 py-2.5">Pakan 09:00</th>
                            <th className="px-3 py-2.5">Pakan 15:30</th>
                            <th className="px-3 py-2.5">Bibis</th>
                            <th className="px-3 py-2.5">Puasa</th>
                            <th className="px-3 py-2.5">Sampling</th>
                            <th className="px-3 py-2.5">Kondisi</th>
                            <th className="px-3 py-2.5">Catatan</th>
                            <th className="px-3 py-2.5 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                        {paginatedRows.length === 0 ? (
                            <tr>
                                <td colSpan="11" className="text-center py-8 text-slate-400 font-medium">
                                    Tidak ada catatan checklist yang cocok dengan pencarian.
                                </td>
                            </tr>
                        ) : (
                            paginatedRows.map((r, i) => (
                                <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="px-3 py-2 font-mono text-slate-400">{r.No}</td>
                                    <td className="px-3 py-2 font-bold text-slate-800 dark:text-slate-100">{r.Tanggal}</td>
                                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{r.Hari}</td>
                                    <td className="px-3 py-2">
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${r['Pakan 09:00']?.includes('✓') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                                            {r['Pakan 09:00'] || '-'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2">
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${r['Pakan 15:30']?.includes('✓') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                                            {r['Pakan 15:30'] || '-'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{r['Bibis Pakan'] || '-'}</td>
                                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{r['Puasa'] || '-'}</td>
                                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{r['Sampling'] || '-'}</td>
                                    <td className="px-3 py-2">
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${r['Kondisi Kolam'] === 'Baik' ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40' : 'text-amber-700 bg-amber-50 dark:bg-amber-950/40'}`}>
                                            {r['Kondisi Kolam'] || 'Normal'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-slate-500 truncate max-w-[140px]">{r.Catatan || '-'}</td>
                                    <td className="px-3 py-2 text-right">
                                        <button
                                            onClick={() => onEdit(r)}
                                            className="p-1.5 text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                            title="Edit baris ini"
                                        >
                                            <Edit2 size={13} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination 
                currentPage={activePage}
                totalItems={displayRows.length}
                pageSize={10}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};

// ====================================================================
// SUB-KOMPONEN TABEL 2: PEMBERIAN PAKAN
// ====================================================================
const FeedingView = ({ data, isLoading, onEdit, searchQuery, setSearchQuery }) => {
    const rows = useMemo(() => data?.rows || [], [data?.rows]);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredRows = useMemo(() => {
        if (!searchQuery) return rows;
        return rows.filter(r => 
            String(r.Tanggal || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(r.Waktu || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(r.Catatan || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [rows, searchQuery]);

    const displayRows = useMemo(() => [...filteredRows].reverse(), [filteredRows]);
    const totalPages = Math.max(1, Math.ceil(displayRows.length / 10));
    const activePage = Math.min(currentPage, totalPages);

    const paginatedRows = useMemo(() => {
        const start = (activePage - 1) * 10;
        return displayRows.slice(start, start + 10);
    }, [displayRows, activePage]);

    if (isLoading) {
        return <div className="p-8 text-center text-xs text-slate-400 animate-pulse">Memuat lembar log pakan...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="relative w-64 max-w-full">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari tanggal, waktu, pakan..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium outline-none"
                    />
                </div>
                <span className="text-xs text-slate-400 font-medium">Total {rows.length} catatan pakan</span>
            </div>

            <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs divide-y divide-slate-200/80 dark:divide-slate-800">
                    <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                            <th className="px-3 py-2.5">No</th>
                            <th className="px-3 py-2.5">Tanggal</th>
                            <th className="px-3 py-2.5">Waktu</th>
                            <th className="px-3 py-2.5">Biomassa Dasar (g)</th>
                            <th className="px-3 py-2.5">Target Pakan (g)</th>
                            <th className="px-3 py-2.5">Pakan Aktual (g)</th>
                            <th className="px-3 py-2.5">Probiotik/Molase</th>
                            <th className="px-3 py-2.5">Status</th>
                            <th className="px-3 py-2.5">Catatan</th>
                            <th className="px-3 py-2.5 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                        {paginatedRows.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="text-center py-8 text-slate-400 font-medium">
                                    Tidak ada catatan pemberian pakan yang cocok dengan pencarian.
                                </td>
                            </tr>
                        ) : (
                            paginatedRows.map((r, i) => (
                                <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="px-3 py-2 font-mono text-slate-400">{r.No}</td>
                                    <td className="px-3 py-2 font-bold text-slate-800 dark:text-slate-100">{r.Tanggal}</td>
                                    <td className="px-3 py-2 font-mono text-sky-700 dark:text-sky-400">{r.Waktu}</td>
                                    <td className="px-3 py-2 font-mono">{r['Biomassa Dasar (g)']} g</td>
                                    <td className="px-3 py-2 font-mono text-slate-500">{r['Target Pakan (g)']} g</td>
                                    <td className="px-3 py-2 font-mono font-bold text-slate-900 dark:text-white">{r['Pakan Aktual (g)']} g</td>
                                    <td className="px-3 py-2 text-slate-500 font-mono text-[11px]">{r['Probiotik (ml)'] || '-'} / {r['Molase (ml)'] || '-'} ml</td>
                                    <td className="px-3 py-2">
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${r['Status Pemberian']?.includes('✓') ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-slate-100 text-slate-500'}`}>
                                            {r['Status Pemberian'] || '✓ Diberikan'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-slate-500 truncate max-w-[120px]">{r.Catatan || '-'}</td>
                                    <td className="px-3 py-2 text-right">
                                        <button
                                            onClick={() => onEdit(r)}
                                            className="p-1.5 text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                            title="Edit pakan ini"
                                        >
                                            <Edit2 size={13} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination 
                currentPage={activePage}
                totalItems={displayRows.length}
                pageSize={10}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};

// ====================================================================
// SUB-KOMPONEN TABEL 3: SAMPLING IKAN
// ====================================================================
const SamplingView = ({ data, isLoading, onEdit }) => {
    const rows = useMemo(() => data?.rows || [], [data?.rows]);
    const [currentPage, setCurrentPage] = useState(1);

    const displayRows = useMemo(() => [...rows].reverse(), [rows]);
    const totalPages = Math.max(1, Math.ceil(displayRows.length / 10));
    const activePage = Math.min(currentPage, totalPages);

    const paginatedRows = useMemo(() => {
        const start = (activePage - 1) * 10;
        return displayRows.slice(start, start + 10);
    }, [displayRows, activePage]);

    if (isLoading) {
        return <div className="p-8 text-center text-xs text-slate-400 animate-pulse">Memuat lembar sampling ikan...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Total {rows.length} Siklus Sampling Mingguan Terjadwal
                </span>
            </div>

            <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs divide-y divide-slate-200/80 dark:divide-slate-800">
                    <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                            <th className="px-3 py-2.5">No</th>
                            <th className="px-3 py-2.5">Tanggal</th>
                            <th className="px-3 py-2.5">Sampel (ekor)</th>
                            <th className="px-3 py-2.5">Bobot Total (g)</th>
                            <th className="px-3 py-2.5">Rata-rata (g/ekor)</th>
                            <th className="px-3 py-2.5">Panjang (cm)</th>
                            <th className="px-3 py-2.5">Ikan Hidup (ekor)</th>
                            <th className="px-3 py-2.5">Estimasi Biomassa (g)</th>
                            <th className="px-3 py-2.5">Target/Hari (g)</th>
                            <th className="px-3 py-2.5 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                        {paginatedRows.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="text-center py-8 text-slate-400 font-medium">
                                    Tidak ada catatan sampling yang tersedia.
                                </td>
                            </tr>
                        ) : (
                            paginatedRows.map((r, i) => (
                                <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="px-3 py-2 font-mono text-slate-400">#{r.No}</td>
                                    <td className="px-3 py-2 font-bold text-slate-800 dark:text-slate-100">{r.Tanggal}</td>
                                    <td className="px-3 py-2 font-mono">{r['Jumlah Ikan Disampling']}</td>
                                    <td className="px-3 py-2 font-mono">{r['Bobot Total Sampel (g)'] ? `${r['Bobot Total Sampel (g)']} g` : '-'}</td>
                                    <td className="px-3 py-2 font-mono font-bold text-sky-700 dark:text-sky-400">{r['Bobot Rata-rata (g/ekor)']} g</td>
                                    <td className="px-3 py-2 font-mono">{r['Panjang Rata-rata (Cm/ekor)'] ? `${r['Panjang Rata-rata (Cm/ekor)']} cm` : '-'}</td>
                                    <td className="px-3 py-2 font-mono">{r['Jumlah Ikan Hidup (ekor)']}</td>
                                    <td className="px-3 py-2 font-mono font-bold text-emerald-700 dark:text-emerald-400">{r['Estimasi Biomassa (g)']} g</td>
                                    <td className="px-3 py-2 font-mono">{r['Target Pakan/Hari (g)']} g</td>
                                    <td className="px-3 py-2 text-right">
                                        <button
                                            onClick={() => onEdit(r)}
                                            className="p-1.5 text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                            title="Edit sampling ini"
                                        >
                                            <Edit2 size={13} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination 
                currentPage={activePage}
                totalItems={displayRows.length}
                pageSize={10}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};

// ====================================================================
// SUB-KOMPONEN TABEL 4: PERAWATAN KOLAM
// ====================================================================
const MaintenanceView = ({ data, isLoading, onEdit }) => {
    const rows = useMemo(() => data?.rows || [], [data?.rows]);
    const [currentPage, setCurrentPage] = useState(1);

    const displayRows = useMemo(() => [...rows].reverse(), [rows]);
    const totalPages = Math.max(1, Math.ceil(displayRows.length / 10));
    const activePage = Math.min(currentPage, totalPages);

    const paginatedRows = useMemo(() => {
        const start = (activePage - 1) * 10;
        return displayRows.slice(start, start + 10);
    }, [displayRows, activePage]);

    if (isLoading) {
        return <div className="p-8 text-center text-xs text-slate-400 animate-pulse">Memuat lembar perawatan kolam...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs divide-y divide-slate-200/80 dark:divide-slate-800">
                    <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                            <th className="px-3 py-2.5">No</th>
                            <th className="px-3 py-2.5">Tanggal</th>
                            <th className="px-3 py-2.5">Kegiatan</th>
                            <th className="px-3 py-2.5">Sebelum (cm)</th>
                            <th className="px-3 py-2.5">Sesudah (cm)</th>
                            <th className="px-3 py-2.5">Air Diganti (L)</th>
                            <th className="px-3 py-2.5">Probiotik (ml)</th>
                            <th className="px-3 py-2.5">Molase (ml)</th>
                            <th className="px-3 py-2.5">Total Bibis (ml)</th>
                            <th className="px-3 py-2.5 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                        {paginatedRows.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="text-center py-8 text-slate-400 font-medium">
                                    Tidak ada catatan perawatan kolam yang tersedia.
                                </td>
                            </tr>
                        ) : (
                            paginatedRows.map((r, i) => (
                                <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                    <td className="px-3 py-2 font-mono text-slate-400">#{r.No}</td>
                                    <td className="px-3 py-2 font-bold text-slate-800 dark:text-slate-100">{r.Tanggal || '-'}</td>
                                    <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{r.Kegiatan}</td>
                                    <td className="px-3 py-2 font-mono">{r['Tinggi Air Sebelum (cm)']} cm</td>
                                    <td className="px-3 py-2 font-mono">{r['Tinggi Air Sesudah (cm)']} cm</td>
                                    <td className="px-3 py-2 font-mono font-bold text-sky-700 dark:text-sky-400">{r['Estimasi Air Diganti (L)']} L</td>
                                    <td className="px-3 py-2 font-mono">{r['Probiotik (ml)']} ml</td>
                                    <td className="px-3 py-2 font-mono">{r['Molase (ml)']} ml</td>
                                    <td className="px-3 py-2 font-mono text-emerald-700 dark:text-emerald-400 font-bold">{r['Total Bibis (ml)']} ml</td>
                                    <td className="px-3 py-2 text-right">
                                        <button
                                            onClick={() => onEdit(r)}
                                            className="p-1.5 text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                                            title="Edit catatan ini"
                                        >
                                            <Edit2 size={13} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination 
                currentPage={activePage}
                totalItems={displayRows.length}
                pageSize={10}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};

// ====================================================================
// SUB-KOMPONEN TABEL 5: REKAPITULASI BUDIDAYA (05_REKAP)
// ====================================================================
const RecapView = ({ data, isLoading }) => {
    const summary = data?.summary || {};
    const samplingRecap = useMemo(() => data?.sampling_recap || [], [data?.sampling_recap]);
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(samplingRecap.length / 10));
    const activePage = Math.min(currentPage, totalPages);

    const paginatedRecap = useMemo(() => {
        const start = (activePage - 1) * 10;
        return samplingRecap.slice(start, start + 10);
    }, [samplingRecap, activePage]);

    if (isLoading) {
        return <div className="p-8 text-center text-xs text-slate-400 animate-pulse">Memuat ringkasan rekapitulasi budidaya...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Grid Kartu Rangkuman Metrik Utama (05_REKAP) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Lama Pemeliharaan */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lama Pemeliharaan</span>
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
                        {summary.duration_days || 144} <span className="text-xs font-semibold text-slate-500">hari</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Mulai: {summary.start_date}</span>
                </div>

                {/* Populasi Ikan */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Populasi Ikan</span>
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
                        {summary.current_population || 84} <span className="text-xs font-semibold text-slate-500">ekor</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Awal: {summary.initial_population || 33} ekor</span>
                </div>

                {/* Bobot Rata-rata Akhir */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bobot Rata-rata Ikan</span>
                    <div className="text-xl sm:text-2xl font-extrabold text-sky-700 dark:text-sky-400 mt-1 font-mono">
                        {summary.current_weight_gram || 61.5} <span className="text-xs font-semibold text-slate-500">g/ekor</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 mt-1 font-semibold block">Gain: +{(summary.current_weight_gram - summary.initial_weight_gram).toFixed(1)} g</span>
                </div>

                {/* Estimasi Biomassa Total */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Biomassa Total Kolam</span>
                    <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
                        {(summary.current_biomass_gram / 1000).toFixed(2)} <span className="text-xs font-semibold text-slate-500">kg</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block font-mono">({summary.current_biomass_gram} gram)</span>
                </div>

                {/* Total Pakan Aktual */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Pakan Diberikan</span>
                    <div className="text-xl sm:text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 font-mono">
                        {(summary.total_feed_gram / 1000).toFixed(2)} <span className="text-xs font-semibold text-slate-500">kg</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block font-mono">{summary.total_feed_gram} gram</span>
                </div>

                {/* Biomass Gain */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Biomass Gain</span>
                    <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
                        {(summary.biomass_gain_gram / 1000).toFixed(2)} <span className="text-xs font-semibold text-slate-500">kg</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 mt-1 font-semibold block">Pertumbuhan Total</span>
                </div>

                {/* FCR (Feed Conversion Ratio) */}
                <div className="p-4 rounded-xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800">
                    <span className="text-[10px] font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider block">FCR (Rasio Pakan)</span>
                    <div className="text-xl sm:text-2xl font-extrabold text-sky-900 dark:text-sky-300 mt-1 font-mono">
                        {summary.fcr || 2.72}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Total Pakan / Biomass Gain</span>
                </div>

                {/* Mortalitas */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mortalitas</span>
                    <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
                        {summary.mortality_percent || 0.00}%
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">{summary.mortality_count || 0} ekor tercatat mati</span>
                </div>
            </div>

            {/* Rekap Sampling Mingguan (Tabel Riwayat) */}
            <div className="space-y-3 pt-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Rekap Sampling Pertumbuhan Mingguan (Formula Otomatis Spreadsheet)
                </h4>
                <div className="overflow-x-auto border border-slate-200/80 dark:border-slate-800 rounded-xl">
                    <table className="w-full text-left text-xs divide-y divide-slate-200/80 dark:divide-slate-800">
                        <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="px-3.5 py-2.5">Minggu ke-</th>
                                <th className="px-3.5 py-2.5">Tanggal Sampling</th>
                                <th className="px-3.5 py-2.5">Bobot Rata-rata (g/ekor)</th>
                                <th className="px-3.5 py-2.5">Estimasi Biomassa (g)</th>
                                <th className="px-3.5 py-2.5">Gain dari Awal (g)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                            {paginatedRecap.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-slate-400 font-medium">
                                        Tidak ada catatan rekapitulasi sampling mingguan.
                                    </td>
                                </tr>
                            ) : (
                                paginatedRecap.map((r, i) => (
                                    <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                        <td className="px-3.5 py-2 font-mono text-slate-400">Minggu #{(currentPage - 1) * 10 + i + 1}</td>
                                        <td className="px-3.5 py-2 font-bold text-slate-800 dark:text-slate-100">{r.date}</td>
                                        <td className="px-3.5 py-2 font-mono text-sky-700 dark:text-sky-400 font-bold">{r.avg_weight} g</td>
                                        <td className="px-3.5 py-2 font-mono text-emerald-700 dark:text-emerald-400 font-bold">{r.biomass} g</td>
                                        <td className="px-3.5 py-2 font-mono text-slate-500 font-medium">
                                            +{(r.biomass - (summary.initial_biomass_gram || 643.5)).toFixed(1)} g
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination 
                    currentPage={activePage}
                    totalItems={samplingRecap.length}
                    pageSize={10}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
};

export default Cultivation;
