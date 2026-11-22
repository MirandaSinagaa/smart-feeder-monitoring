import { useState, useMemo } from 'react';
import { Download, ExternalLink, Search, Filter, RefreshCw } from 'lucide-react';
import { useSensor } from '../context/SensorContext';
import Pagination from '../components/Pagination';

const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1hrqOnqM0PQONt02FyOPd74pusY-AvX_NsOvLNye2qcw/edit#gid=0";

const Logs = () => {
    const { sensorData, loading, isRefreshing, fetchSensorData, exportCSV } = useSensor();

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);

    const logs = useMemo(() => sensorData?.logs || [], [sensorData?.logs]);

    // Filter data berdasarkan kata kunci pencarian dan status
    const filteredLogs = useMemo(() => {
        return logs.filter(row => {
            const waktu = String(row['Waktu'] || '').toLowerCase();
            const interpretasi = String(row['Interpretasi'] || '').toLowerCase();
            const matchesSearch = waktu.includes(searchTerm.toLowerCase()) ||
                String(row['Id'] || '').includes(searchTerm);

            const matchesStatus = statusFilter === 'ALL' ||
                (statusFilter === 'DANGER' && interpretasi.includes('bahaya')) ||
                (statusFilter === 'SAFE' && !interpretasi.includes('bahaya'));

            return matchesSearch && matchesStatus;
        });
    }, [logs, searchTerm, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / 10));
    const activePage = Math.min(currentPage, totalPages);

    const paginatedLogs = useMemo(() => {
        const start = (activePage - 1) * 10;
        return filteredLogs.slice(start, start + 10);
    }, [filteredLogs, activePage]);

    // Statistik agregat
    const totalRecords = logs.length;
    const dangerCount = logs.filter(r => String(r['Interpretasi'] || '').toLowerCase().includes('bahaya')).length;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Hero Banner Card - Vibe Elegan, Kalem & Senada dengan Tampilan Login */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs transition-all animate-card-slideup">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5 mb-2.5">
                            <span className="text-[10px] sm:text-xs font-extrabold tracking-widest text-sky-700 dark:text-sky-400 uppercase bg-sky-50 dark:bg-sky-950/70 border border-sky-200/60 dark:border-sky-800 px-3 py-1 rounded-full inline-block">
                                RIWAYAT &amp; TELEMETRI SENSOR
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                Arsip Log Spreadsheet
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                            Riwayat Aktivitas &amp; Telemetri Kolam
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-2xl font-normal leading-relaxed">
                            Arsip lengkap data telemetri yang tersinkronisasi otomatis dari spreadsheet Google Sheets.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                fetchSensorData(true);
                            }}
                            disabled={isRefreshing}
                            className="px-4 py-2.5 bg-sky-900 hover:bg-sky-950 dark:bg-sky-600 dark:hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
                            title="Segarkan data log sensor dari Google Sheets"
                        >
                            <RefreshCw size={13} className={`${isRefreshing ? 'animate-spin' : ''}`} />
                            <span>{isRefreshing ? 'Menyegarkan...' : 'Segarkan Data'}</span>
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(SPREADSHEET_URL, '_blank');
                            }}
                            className="px-3.5 py-2.5 bg-[#007ba7] hover:bg-[#006990] text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-[0.99]"
                            title="Buka Spreadsheet di Tab Baru"
                        >
                            <span>Google Sheets</span>
                            <ExternalLink size={13} />
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                exportCSV();
                            }}
                            className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-semibold transition-all shadow-2xs flex items-center gap-2 cursor-pointer active:scale-[0.99]"
                            title="Unduh Data CSV Log"
                        >
                            <Download size={13} className="text-slate-500 dark:text-slate-400" />
                            <span>Ekspor CSV</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Metric Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-2xs">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Baris Terbaca</span>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1 font-metric">{totalRecords}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-2xs">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Anomali Terdeteksi</span>
                    <p className="text-2xl font-extrabold text-rose-600 mt-1 font-metric">{dangerCount} <span className="text-xs font-normal text-slate-400">Baris</span></p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-2xs">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Interval Pengambilan</span>
                    <p className="text-2xl font-extrabold text-slate-900 mt-1 font-metric">15 <span className="text-xs font-normal text-slate-400">Menit</span></p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200/70 shadow-2xs">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status Sinkronisasi</span>
                    <p className="text-2xl font-extrabold text-emerald-700 mt-1 font-metric">Realtime</p>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/70 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-2xs">
                <div className="relative w-full sm:w-80">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari berdasarkan tanggal / jam..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50/70 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-600 font-medium"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter size={15} className="text-slate-400 shrink-0" />
                    <span className="text-xs font-medium text-slate-500 whitespace-nowrap">Filter Status:</span>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="bg-slate-50/70 border border-slate-200/80 text-xs font-semibold text-slate-700 rounded-xl px-3 py-2 outline-none cursor-pointer"
                    >
                        <option value="ALL">Semua Data</option>
                        <option value="DANGER">Status Bahaya / Waspada</option>
                        <option value="SAFE">Status Aman / Optimal</option>
                    </select>
                </div>
            </div>

            {/* Tabel Log Lengkap */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="text-[11px] text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200/70">
                            <tr>
                                <th className="px-4 py-3.5 font-semibold">No</th>
                                <th className="px-4 py-3.5 font-semibold">Waktu (WITA)</th>
                                <th className="px-4 py-3.5 font-semibold">DO (mg/L)</th>
                                <th className="px-4 py-3.5 font-semibold">pH</th>
                                <th className="px-4 py-3.5 font-semibold">Suhu (°C)</th>
                                <th className="px-4 py-3.5 font-semibold">V-DO (mV)</th>
                                <th className="px-4 py-3.5 font-semibold">V-pH (V)</th>
                                <th className="px-4 py-3.5 font-semibold">Pakan Pagi (g)</th>
                                <th className="px-4 py-3.5 font-semibold">Pakan Sore (g)</th>
                                <th className="px-4 py-3.5 font-semibold">Sisa (g)</th>
                                <th className="px-4 py-3.5 font-semibold">% NH3</th>
                                <th className="px-4 py-3.5 font-semibold">Interpretasi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="12" className="text-center py-10 text-slate-400 font-medium">
                                        Memuat data log dari Google Sheets...
                                    </td>
                                </tr>
                            ) : paginatedLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="12" className="text-center py-10 text-slate-400 font-medium">
                                        Tidak ada catatan log yang cocok dengan kriteria filter.
                                    </td>
                                </tr>
                            ) : (
                                paginatedLogs.map((row, idx) => {
                                    const isDanger = String(row['Interpretasi'] || '').toLowerCase().includes('bahaya');
                                    const isWarn = String(row['Interpretasi'] || '').toLowerCase().includes('waspada');
                                    return (
                                        <tr key={idx} className="bg-white hover:bg-slate-50/60 transition-colors">
                                            <td className="px-4 py-3 text-slate-400 font-mono">{row['Id'] || (currentPage - 1) * 10 + idx + 1}</td>
                                            <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{row['Waktu'] || '-'}</td>
                                            <td className="px-4 py-3 font-mono font-bold text-slate-900">{row['DO']}</td>
                                            <td className="px-4 py-3 font-mono text-slate-700">{row['pH']}</td>
                                            <td className="px-4 py-3 font-mono text-slate-700">{row['Suhu']}</td>
                                            <td className="px-4 py-3 font-mono text-slate-500">{row['Voltage DO']}</td>
                                            <td className="px-4 py-3 font-mono text-slate-500">{row['Voltage pH']}</td>
                                            <td className="px-4 py-3 text-slate-600">{row['Log Pakan Pagi'] || '-'}</td>
                                            <td className="px-4 py-3 text-slate-600">{row['Log Pakan Sore'] || '-'}</td>
                                            <td className="px-4 py-3 font-medium text-rose-600">{row['Sisa Pakan'] || '-'}</td>
                                            <td className="px-4 py-3 font-mono text-slate-700">{row['% NH3 (Beracun)']}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full border ${isDanger
                                                    ? 'bg-rose-50 text-rose-700 border-rose-200/70'
                                                    : isWarn
                                                        ? 'bg-amber-50 text-amber-800 border-amber-200/70'
                                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200/70'
                                                    }`}>
                                                    {row['Interpretasi'] || 'Optimal'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-white border-t border-slate-100">
                    <Pagination
                        currentPage={activePage}
                        totalItems={filteredLogs.length}
                        pageSize={10}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </div>
    );
};

export default Logs;
