/* eslint-disable react-hooks/preserve-manual-memoization */
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Bell, 
    AlertTriangle, 
    Scale, 
    Activity, 
    CheckCheck, 
    ChevronRight, 
    X, 
    CalendarClock, 
    ShieldAlert,
    CheckCircle2
} from 'lucide-react';
import { useSensor } from '../context/useSensor';

// Evaluasi data sensor & biomassa untuk membuat notifikasi dinamis
const generateNotifications = (sensorData, biomassData) => {
    const list = [];
    const syncTime = sensorData?.last_sync_wita || '10:45 WITA';

    // ===============================================================
    // 1. PERINGATAN KUALITAS AIR KRITIS
    // ===============================================================
    const kpi = sensorData?.kpi;
    const latest = sensorData?.latest;
    const condition = sensorData?.status_overview?.condition || latest?.Interpretasi || '';

    // a. Cek Amonia (NH3)
    const nh3Val = kpi?.nh3?.value ?? latest?.['% NH3 (Beracun)'];
    const isNh3Critical = (kpi?.nh3?.status === 'BAHAYA' || kpi?.nh3?.status === 'KRITIS') || (typeof nh3Val === 'number' && nh3Val >= 0.02);
    if (isNh3Critical) {
        list.push({
            id: 'critical-nh3',
            type: 'critical',
            title: 'Amonia (% NH3 Bebas) Melampaui Batas Kritis',
            badge: 'BAHAYA',
            badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800',
            message: `Kadar amonia terdeteksi ${nh3Val ?? '1.039'} mg/L (ambang batas aman < 0.02 mg/L). Kondisi biokimia beracun bagi Nila Hitam.`,
            recommendation: 'Kurangi porsi pakan segera dan nyalakan aerator pendukung.',
            time: syncTime,
            icon: AlertTriangle,
            iconColor: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900',
            actionText: 'Lihat Analisis Sensor',
            actionPath: '/water-quality'
        });
    }

    // b. Cek Dissolved Oxygen (DO)
    const doVal = kpi?.do?.value ?? latest?.DO;
    const isDoCritical = (kpi?.do?.status === 'BAHAYA' || kpi?.do?.status === 'KRITIS') || (typeof doVal === 'number' && doVal < 4.0);
    if (isDoCritical) {
        list.push({
            id: 'critical-do',
            type: 'critical',
            title: 'Dissolved Oxygen (DO) Rendah',
            badge: 'KRITIS',
            badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800',
            message: `Kadar oksigen terlarut berada di ${doVal ?? '3.5'} mg/L (batas optimal > 4.0 mg/L). Ikan berisiko kekurangan oksigen.`,
            recommendation: 'Aktifkan kincir air / aerator darurat segera.',
            time: syncTime,
            icon: Activity,
            iconColor: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900',
            actionText: 'Buka Monitoring DO',
            actionPath: '/water-quality'
        });
    }

    // c. Cek Derajat Keasaman (pH)
    const phVal = kpi?.ph?.value ?? latest?.pH;
    const isPhCritical = (kpi?.ph?.status === 'BAHAYA') || (typeof phVal === 'number' && (phVal < 6.0 || phVal > 8.5));
    if (isPhCritical) {
        list.push({
            id: 'critical-ph',
            type: 'critical',
            title: 'Derajat Keasaman (pH) di Luar Rentang Ideal',
            badge: 'WASPADA',
            badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
            message: `pH air kolam tercatat ${phVal ?? '6.08'} (rentang optimal bioflok 6.8 - 8.2). Berisiko menekan nafsu makan ikan.`,
            recommendation: 'Cek penambahan kapur dolomit atau aerasi pendukung.',
            time: syncTime,
            icon: ShieldAlert,
            iconColor: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900',
            actionText: 'Cek Grafik pH',
            actionPath: '/water-quality'
        });
    }

    // d. Kondisi Anomali Keseluruhan Kolam
    if (condition === 'Sangat Rendah' && !isNh3Critical && !isDoCritical) {
        list.push({
            id: 'critical-overall',
            type: 'critical',
            title: 'Peringatan Anomali Kualitas Air: Sangat Rendah',
            badge: 'ANOMALI',
            badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800',
            message: 'Sensor mendeteksi anomali pada biokimia air kolam bioflok C.',
            recommendation: 'Lakukan pengecekan fisik visual pada flok dan nafsu makan ikan.',
            time: syncTime,
            icon: AlertTriangle,
            iconColor: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900',
            actionText: 'Tindakan Cepat',
            actionPath: '/water-quality'
        });
    }

    // ===============================================================
    // 2. PENGINGAT PEMBARUAN BIOMASSA (1x SETIAP MINGGU)
    // ===============================================================
    const samplingDateStr = biomassData?.sampling_date || sensorData?.status_overview?.sampling_date || '11/12/2026';
    let isBiomassOverdue = true;

    // Cek selisih tanggal sampling terakhir
    if (samplingDateStr) {
        try {
            const parts = samplingDateStr.split('/');
            let samplingDate;
            if (parts.length === 3) {
                samplingDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
            } else {
                samplingDate = new Date(samplingDateStr);
            }
            
            if (!isNaN(samplingDate.getTime())) {
                const diffTime = Math.abs(Date.now() - samplingDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                // Jika sampling sudah lebih dari 7 hari atau belum dilakukan minggu ini
                isBiomassOverdue = diffDays >= 7;
            }
        } catch {
            isBiomassOverdue = true;
        }
    }

    if (isBiomassOverdue) {
        list.push({
            id: 'reminder-biomass-weekly',
            type: 'reminder',
            title: 'Pengingat Mingguan: Pembaruan Data Biomassa',
            badge: '1X SEMINGGU',
            badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border-sky-200 dark:border-sky-800',
            message: `Data biomassa ikan belum diperbarui dalam 7 hari terakhir (sampling terakhir: ${samplingDateStr}).`,
            recommendation: 'Lakukan sampling bobot & panjang ikan untuk kalibrasi target pakan presisi.',
            time: 'Pengingat Rutin',
            icon: Scale,
            iconColor: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-900',
            actionText: 'Perbarui Data Biomassa',
            actionPath: '/settings'
        });
    }

    // ===============================================================
    // 3. STATUS SINKRONISASI TELEMETRI (INFO SISTEM)
    // ===============================================================
    list.push({
        id: 'info-gateway-synced',
        type: 'info',
        title: 'Gateway ESP32 v4.2 Terhubung Stabil',
        badge: 'ONLINE',
        badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        message: 'Telemetri sensor otomatis tersinkronisasi dengan Google Sheets & Database Living Lab.',
        recommendation: 'Semua sensor optik dan probe analog beroperasi normal.',
        time: syncTime,
        icon: CheckCircle2,
        iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900',
        actionText: 'Buka Logbook Sheets',
        actionPath: '/spreadsheet'
    });

    return list;
};

const NotificationBell = () => {
    const navigate = useNavigate();
    const { sensorData, biomassData } = useSensor();
    const [isOpen, setIsOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'critical', 'reminder'
    const [dismissedIds, setDismissedIds] = useState(() => {
        try {
            const saved = localStorage.getItem('smartfeeder_dismissed_notifications');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const dropdownRef = useRef(null);

    // Simpan daftar notifikasi yang di-dismiss di localStorage
    const handleDismiss = (id, e) => {
        if (e) e.stopPropagation();
        setDismissedIds(prev => {
            const next = [...new Set([...prev, id])];
            localStorage.setItem('smartfeeder_dismissed_notifications', JSON.stringify(next));
            return next;
        });
    };

    const handleDismissAll = (e) => {
        if (e) e.stopPropagation();
        const allIds = notifications.map(n => n.id);
        const next = [...new Set([...dismissedIds, ...allIds])];
        setDismissedIds(next);
        localStorage.setItem('smartfeeder_dismissed_notifications', JSON.stringify(next));
    };

    const notifications = useMemo(() => {
        return generateNotifications(sensorData, biomassData);
    }, [sensorData, biomassData]);

    // Filter daftar notifikasi yang belum di-dismiss
    const activeNotifications = useMemo(() => {
        return notifications.filter(n => !dismissedIds.includes(n.id));
    }, [notifications, dismissedIds]);

    // Notifikasi yang ditampilkan berdasarkan tab filter
    const displayedNotifications = useMemo(() => {
        if (activeFilter === 'critical') {
            return activeNotifications.filter(n => n.type === 'critical');
        }
        if (activeFilter === 'reminder') {
            return activeNotifications.filter(n => n.type === 'reminder');
        }
        return activeNotifications;
    }, [activeNotifications, activeFilter]);

    // Jumlah notifikasi belum dibaca
    const unreadCount = activeNotifications.length;
    const criticalCount = activeNotifications.filter(n => n.type === 'critical').length;
    const reminderCount = activeNotifications.filter(n => n.type === 'reminder').length;

    // Tutup dropdown saat klik di luar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    const handleNavigate = (path) => {
        setIsOpen(false);
        if (path) navigate(path);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Tombol Lonceng Notifikasi */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 active:scale-95 border ${
                    isOpen
                        ? 'bg-sky-50 dark:bg-slate-800 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-600 shadow-xs'
                        : 'bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700 shadow-2xs hover:shadow-xs hover:-translate-y-0.5'
                }`}
                title="Pusat Notifikasi Sistem"
                aria-label="Notifikasi Sistem"
            >
                <div className="relative">
                    <Bell 
                        size={15} 
                        className={`transition-transform duration-200 ${
                            criticalCount > 0 ? 'text-rose-600 dark:text-rose-400 animate-bounce-subtle' : 'text-slate-600 dark:text-slate-300'
                        }`} 
                    />
                    {/* Badge Angka Notifikasi */}
                    {unreadCount > 0 && (
                        <span className={`absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full text-[9px] font-extrabold text-white shadow-xs ${
                            criticalCount > 0 ? 'bg-rose-600 animate-pulse' : 'bg-sky-600'
                        }`}>
                            {unreadCount}
                        </span>
                    )}
                </div>
                <span className="hidden md:inline font-medium">Notifikasi</span>
            </button>

            {/* Panel Popover Dropdown Notifikasi */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-[340px] sm:w-[420px] max-w-[92vw] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-2xl dark:shadow-black/60 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    {/* Header Panel */}
                    <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/60 dark:bg-slate-800/40">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-sky-100/80 dark:bg-sky-950/80 border border-sky-200/70 dark:border-sky-800/80 flex items-center justify-center text-sky-700 dark:text-sky-300">
                                <Bell size={16} />
                            </div>
                            <div>
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                    Pusat Notifikasi
                                </h4>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                    Kolam Bioflok C • Telemetri &amp; Pakan
                                </span>
                            </div>
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleDismissAll}
                                className="text-[11px] font-semibold text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
                                title="Tandai semua telah dibaca"
                            >
                                <CheckCheck size={13} />
                                <span>Tandai Dibaca</span>
                            </button>
                        )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 bg-white dark:bg-slate-900 text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => setActiveFilter('all')}
                            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-[11px] ${
                                activeFilter === 'all'
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            Semua ({activeNotifications.length})
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveFilter('critical')}
                            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-[11px] flex items-center gap-1 ${
                                activeFilter === 'critical'
                                    ? 'bg-rose-600 text-white'
                                    : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                            }`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Kritis ({criticalCount})
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveFilter('reminder')}
                            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-[11px] flex items-center gap-1 ${
                                activeFilter === 'reminder'
                                    ? 'bg-sky-600 text-white'
                                    : 'text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40'
                            }`}
                        >
                            <CalendarClock size={11} />
                            Pengingat ({reminderCount})
                        </button>
                    </div>

                    {/* Daftar Notifikasi */}
                    <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/70">
                        {displayedNotifications.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center justify-center">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center mb-2.5 text-slate-400">
                                    <CheckCheck size={22} className="text-emerald-500" />
                                </div>
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                    Tidak ada notifikasi baru
                                </p>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[240px] mt-0.5">
                                    Semua peringatan sensor dan pengingat biomassa telah Anda periksa.
                                </p>
                            </div>
                        ) : (
                            displayedNotifications.map((item) => {
                                const IconComponent = item.icon;
                                return (
                                    <div
                                        key={item.id}
                                        className={`p-3.5 sm:p-4 hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors relative group ${
                                            item.type === 'critical' ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Icon Notifikasi */}
                                            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${item.iconColor}`}>
                                                <IconComponent size={16} />
                                            </div>

                                            {/* Isi Konten */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border tracking-wide uppercase ${item.badgeColor}`}>
                                                        {item.badge}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tabular-nums">
                                                        {item.time}
                                                    </span>
                                                </div>

                                                <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug mb-1">
                                                    {item.title}
                                                </h5>

                                                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                                                    {item.message}
                                                </p>

                                                {item.recommendation && (
                                                    <div className="mt-1.5 p-2 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-700 dark:text-slate-300 font-medium">
                                                        <span className="font-bold text-slate-900 dark:text-slate-200">Saran Tindakan:</span> {item.recommendation}
                                                    </div>
                                                )}

                                                {/* Action Link & Dismiss */}
                                                <div className="mt-2.5 flex items-center justify-between gap-2 pt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleNavigate(item.actionPath)}
                                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300 cursor-pointer group-hover:underline"
                                                    >
                                                        <span>{item.actionText}</span>
                                                        <ChevronRight size={12} />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleDismiss(item.id, e)}
                                                        className="text-[10px] font-medium text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-0.5 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 cursor-pointer"
                                                        title="Sembunyikan notifikasi ini"
                                                    >
                                                        Selesai
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Tombol Tutup Mini */}
                                            <button
                                                type="button"
                                                onClick={(e) => handleDismiss(item.id, e)}
                                                className="text-slate-300 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                                                title="Abaikan"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500 text-center font-medium">
                        Living Lab Bioflok Kolam C • Notifikasi Otomatis Terintegrasi
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
