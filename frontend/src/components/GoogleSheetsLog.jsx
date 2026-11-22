import { useState } from 'react';
import { Download, ExternalLink, ChevronDown, ChevronUp, ArrowRight, Table } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSensor } from '../context/SensorContext';
import { TableRowSkeleton } from './SkeletonLoader';

const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1hrqOnqM0PQONt02FyOPd74pusY-AvX_NsOvLNye2qcw/edit#gid=0";

const GoogleSheetsLog = () => {
    const navigate = useNavigate();
    const { sensorData, loading, exportCSV } = useSensor();
    const [isLogOpen, setIsLogOpen] = useState(true);

    const logs = sensorData?.logs || [];
    // Tampilkan 5 baris data paling mutakhir di dashboard preview
    const previewLogs = logs.slice(0, 5);

    const getStatusBadge = (interpretasi) => {
        const val = String(interpretasi || '').toLowerCase();
        if (val.includes('bahaya') || val.includes('kritis')) {
            return (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/70">
                    {interpretasi}
                </span>
            );
        }
        if (val.includes('waspada') || val.includes('rendah') || val.includes('fluktuatif')) {
            return (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/70">
                    {interpretasi}
                </span>
            );
        }
        return (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                {interpretasi || 'Optimal'}
            </span>
        );
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] overflow-hidden transition-all">
            <div 
                className="p-5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition-colors"
                onClick={() => setIsLogOpen(!isLogOpen)}
            >
                <div className="flex items-center gap-3.5">
                    <div className="bg-sky-950 dark:bg-sky-700 text-white p-2.5 rounded-xl shadow-xs">
                        <Table size={18} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
                            Data Log Mentah Sensor IoT (Sinkronisasi Google Sheets)
                            <span className="bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                LIVE SYNC
                            </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                            Data telemetri realtime langsung dari lembar kerja spreadsheet kolam bioflok.
                        </p>
                    </div>
                </div>
                <button className="text-xs font-semibold text-sky-800 dark:text-sky-300 flex items-center gap-1.5 cursor-pointer">
                    {isLogOpen ? 'Tutup Detail' : 'Buka Detail'}
                    {isLogOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>

            {isLogOpen && (
                <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                        <p className="text-xs text-slate-500 font-normal">
                            Menampilkan <span className="font-bold text-slate-800">{previewLogs.length}</span> baris telemetri terakhir dari total <span className="font-bold text-slate-800">{logs.length}</span> baris.
                        </p>
                        <div className="flex gap-2.5">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(SPREADSHEET_URL, '_blank');
                                }}
                                className="text-slate-700 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-sky-900 dark:hover:text-sky-300 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.99] flex items-center gap-1.5 shadow-2xs cursor-pointer"
                            >
                                <ExternalLink size={14} className="text-sky-700 dark:text-sky-400" /> Buka Google Sheets
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    exportCSV();
                                }}
                                className="bg-sky-900 hover:bg-sky-950 dark:bg-sky-600 dark:hover:bg-sky-700 text-white px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-[0.99] flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                                <Download size={14} /> Download CSV
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-200/70 dark:border-slate-800 rounded-xl">
                        <table className="w-full text-xs text-left">
                            <thead className="text-[11px] text-slate-500 uppercase bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200/70 dark:border-slate-800">
                                <tr>
                                    <th className="px-3.5 py-3 font-semibold">Waktu</th>
                                    <th className="px-3.5 py-3 font-semibold">DO (mg/L)</th>
                                    <th className="px-3.5 py-3 font-semibold">pH</th>
                                    <th className="px-3.5 py-3 font-semibold">Suhu (°C)</th>
                                    <th className="px-3.5 py-3 font-semibold">V-DO (mV)</th>
                                    <th className="px-3.5 py-3 font-semibold">V-pH (V)</th>
                                    <th className="px-3.5 py-3 font-semibold">Pakan Pagi (g)</th>
                                    <th className="px-3.5 py-3 font-semibold">Pakan Sore (g)</th>
                                    <th className="px-3.5 py-3 font-semibold">Sisa (g)</th>
                                    <th className="px-3.5 py-3 font-semibold">% NH3</th>
                                    <th className="px-3.5 py-3 font-semibold">Interpretasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {loading ? (
                                    <TableRowSkeleton rows={5} />
                                ) : previewLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="11" className="text-center py-6 text-slate-400 font-medium">
                                            Tidak ada data sensor ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    previewLogs.map((row, index) => (
                                        <tr key={index} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="px-3.5 py-3 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">{row['Waktu'] || '-'}</td>
                                            <td className="px-3.5 py-3 font-bold text-slate-900 dark:text-white tabular-nums">{row['DO (mg/L)'] || '-'}</td>
                                            <td className="px-3.5 py-3 text-slate-700 dark:text-slate-300 tabular-nums">{row['pH'] || '-'}</td>
                                            <td className="px-3.5 py-3 text-slate-700 dark:text-slate-300 tabular-nums">{row['Suhu (°C)'] || '-'}</td>
                                            <td className="px-3.5 py-3 text-slate-500 dark:text-slate-400 tabular-nums">{row['Voltage DO (mV)'] || '-'}</td>
                                            <td className="px-3.5 py-3 text-slate-500 dark:text-slate-400 tabular-nums">{row['Voltage pH (V)'] || '-'}</td>
                                            <td className="px-3.5 py-3 text-slate-600 dark:text-slate-300 tabular-nums">{row['Log Pakan Pagi'] || 0}</td>
                                            <td className="px-3.5 py-3 text-slate-600 dark:text-slate-300 tabular-nums">{row['Log Pakan Sore'] || 0}</td>
                                            <td className="px-3.5 py-3 font-semibold text-rose-600 tabular-nums">{row['Sisa Pakan Unconsumed'] || 0}</td>
                                            <td className="px-3.5 py-3 text-slate-600 dark:text-slate-300 tabular-nums">{row['% NH3 (Beracun)'] || '-'}</td>
                                            <td className="px-3.5 py-3">
                                                {getStatusBadge(row['Interpretasi'])}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button 
                            onClick={() => navigate('/logs')}
                            className="text-xs font-semibold text-sky-800 hover:text-sky-950 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <span>Lihat Semua Arsip Log Telemetri</span>
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoogleSheetsLog;
