import { RefreshCw } from 'lucide-react';
import { useSensor } from '../context/SensorContext';
import AlertBanner from '../components/AlertBanner';
import StatusOverview from '../components/StatusOverview';
import KpiCards from '../components/KpiCards';
import CultivationQuickSummary from '../components/CultivationQuickSummary';
import GoogleSheetsLog from '../components/GoogleSheetsLog';

const Dashboard = () => {
    const { fetchSensorData, isRefreshing } = useSensor();

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Hero Banner Card - Vibe Elegan, Kalem & Senada dengan Tampilan Login */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs transition-all animate-card-slideup" style={{ animationDelay: '20ms' }}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5 mb-2.5">
                            <span className="text-[10px] sm:text-xs font-extrabold tracking-widest text-sky-700 dark:text-sky-400 uppercase bg-sky-50 dark:bg-sky-950/70 border border-sky-200/60 dark:border-sky-800 px-3 py-1 rounded-full inline-block">
                                IOT MONITORING
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                            Ringkasan Sistem &amp; Operasional Kolam
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-2xl font-normal leading-relaxed">
                            Gateway IoT, kualitas telemetri sensor, dan manajemen pakan presisi bioflok dalam satu pandangan operasional terpadu.
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
                            title="Segarkan data terbaru"
                        >
                            <RefreshCw size={14} className={`${isRefreshing ? 'animate-spin' : ''}`} />
                            <span>{isRefreshing ? 'Menyinkronkan...' : 'Segarkan Data'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Banner Peringatan Kritis */}
            <div className="animate-card-slideup" style={{ animationDelay: '80ms' }}>
                <AlertBanner />
            </div>

            {/* Ringkasan Status Kolam Bioflok C */}
            <div className="animate-card-slideup" style={{ animationDelay: '140ms' }}>
                <StatusOverview />
            </div>

            {/* Metrik Sensor Realtime (DO, pH, Suhu, Amonia) */}
            <div className="animate-card-slideup" style={{ animationDelay: '200ms' }}>
                <KpiCards />
            </div>

            {/* Menu Pencatatan & Logbook Budidaya (5 Sheet Google Sheets) */}
            <div className="animate-card-slideup" style={{ animationDelay: '260ms' }}>
                <CultivationQuickSummary />
            </div>

            {/* Pratinjau Telemetri Sensor Terkini Google Sheets */}
            <div className="animate-card-slideup" style={{ animationDelay: '320ms' }}>
                <GoogleSheetsLog />
            </div>
        </div>
    );
};

export default Dashboard;
