import { useLocation, useNavigate } from 'react-router-dom';
import { useSensor } from '../context/useSensor';
import NotificationBell from './NotificationBell';

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { sensorData } = useSensor();

    const lastSync = sensorData?.last_sync_wita || '10:45 WITA';

    // Breadcrumb dinamis mengikuti menu yang sedang aktif
    const getBreadcrumbInfo = (pathname) => {
        if (pathname === '/dashboard' || pathname === '/') {
            return { parent: 'Smart Feeder', current: 'Dashboard', sub: null };
        }
        if (pathname.startsWith('/monitoring') || pathname.startsWith('/water-quality') || pathname.startsWith('/analytics')) {
            return { parent: 'Smart Feeder', current: 'Monitoring', sub: null };
        }
        if (pathname.startsWith('/cultivation') || pathname.startsWith('/pencatatan-data') || pathname.startsWith('/spreadsheet')) {
            let sub = null;
            if (pathname.includes('/checklist')) sub = 'Checklist Harian';
            else if (pathname.includes('/feeding')) sub = 'Pemberian Pakan';
            else if (pathname.includes('/sampling')) sub = 'Sampling Ikan';
            else if (pathname.includes('/maintenance')) sub = 'Perawatan Kolam';
            else if (pathname.includes('/recap')) sub = 'Rekapitulasi';

            return { parent: 'Smart Feeder', current: 'Pencatatan Data', sub };
        }
        if (pathname.startsWith('/logs') || pathname.startsWith('/riwayat')) {
            return { parent: 'Smart Feeder', current: 'Riwayat', sub: null };
        }
        if (pathname.startsWith('/settings') || pathname.startsWith('/pengaturan')) {
            return { parent: 'Smart Feeder', current: 'Pengaturan', sub: null };
        }
        if (pathname.startsWith('/profile')) {
            return { parent: 'Smart Feeder', current: 'Profil', sub: null };
        }
        if (pathname.startsWith('/schedules')) {
            return { parent: 'Smart Feeder', current: 'Jadwal Pakan', sub: null };
        }
        return { parent: 'Smart Feeder', current: 'Dashboard', sub: null };
    };

    const breadcrumb = getBreadcrumbInfo(location.pathname);

    return (
        <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sm:gap-4 shrink-0 sticky top-0 z-40 transition-colors select-none">
            
            {/* Bagian Kiri: Breadcrumb Dinamis Sesuai Identitas Sistem */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-w-0">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-slate-500 hover:text-sky-700 dark:text-slate-400 dark:hover:text-sky-300 font-medium transition-colors cursor-pointer shrink-0 truncate flex items-center gap-1.5"
                        title="Kembali ke Dashboard Smart Feeder"
                    >
                        <span>{breadcrumb.parent}</span>
                    </button>

                    <span className="text-slate-300 dark:text-slate-600 shrink-0">/</span>

                    <span className={`tracking-tight truncate ${breadcrumb.sub ? 'text-slate-500 dark:text-slate-400 font-medium' : 'text-slate-900 dark:text-white font-bold'}`}>
                        {breadcrumb.current}
                    </span>

                    {breadcrumb.sub && (
                        <>
                            <span className="text-slate-300 dark:text-slate-600 shrink-0">/</span>
                            <span className="text-slate-900 dark:text-white font-bold tracking-tight truncate">
                                {breadcrumb.sub}
                            </span>
                        </>
                    )}
                </nav>

                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden md:block"></div>

                {/* Telemetri Live Badge */}
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700 shadow-2xs">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Telemetri Live
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate" title={lastSync}>
                        {lastSync}
                    </span>
                </div>
            </div>
            
            {/* Bagian Kanan: HANYA Tombol Notifikasi */}
            <div className="flex items-center shrink-0 ml-auto">
                <NotificationBell />
            </div>
        </header>
    );
};

export default Header;
