import { Waves, Bot, Scale, Ruler, Fish, Calendar, Sparkles } from 'lucide-react';
import { useSensor } from '../context/SensorContext';
import { StatusOverviewSkeleton } from './SkeletonLoader';

const StatusOverview = () => {
    const { sensorData, biomassData, loading } = useSensor();

    if (loading && !sensorData) {
        return <StatusOverviewSkeleton />;
    }

    const overview = sensorData?.status_overview || {};
    const biomass = biomassData || sensorData?.status_overview || {
        fish_count: 84,
        avg_weight_gram: 61.5,
        avg_length_cm: 14.8,
        total_sample_weight_gram: 615.0,
        total_biomass_kg: 5.17,
        total_biomass_gram: 5166.0,
        daily_feed_rate_percent: 3.0,
        target_daily_feed_gram: 154.98,
        feed_per_portion_gram: 77.49,
        sampling_date: "11/12/2026",
        cycle_day: 95
    };

    const isAlert = overview.condition === 'Bahaya/Mematikan' ||
        overview.condition === 'WASPADA' ||
        overview.condition === 'Sangat Rendah';

    const poolName = overview.pool_name || "Kolam Bioflok C";
    const fishType = overview.fish_type || "Nila";
    const fishCount = biomass.fish_count || overview.fish_count || 84;
    const cycleDay = overview.cycle_day || biomass.cycle_day || 95;
    const samplingDate = biomass.sampling_date || overview.sampling_date || "11/12/2026";

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs transition-all animate-fade-in-data">
            {/* Top Bar Header: Unit Status & Telegram Control Status */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800 gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800/60 flex items-center justify-center text-sky-700 dark:text-sky-300 shadow-2xs shrink-0">
                        <Waves size={22} className="stroke-[2.2]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {poolName}
                            </h2>
                            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-colors ${isAlert
                                ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/80'
                                : 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/80'
                                }`}>
                                {overview.condition || 'Optimal'}
                            </span>
                            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-2 py-0.5 rounded-md border border-slate-200/70 dark:border-slate-700 tabular-nums">
                                <Calendar size={10} /> Live Sync
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                            Varietas: <span className="font-semibold text-slate-800 dark:text-slate-200">{fishType}</span> • Populasi: <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">{fishCount} Ekor</span> • Siklus Flok: <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">Hari Ke-{cycleDay}</span>
                        </p>
                    </div>
                </div>

                {/* Status Kontrol Telegram Bot */}
                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/80 shadow-2xs self-start lg:self-auto hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 group">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0 border border-sky-100/80 dark:border-sky-800/60 opacity-90 group-hover:opacity-100 transition-opacity duration-200">
                        <Bot size={17} />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Telegram Bot Kontrol</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                            Status: <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Online</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Grid 4 Kartu Parameter Budidaya & Biomassa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
                {/* 1. Total Estimasi Biomassa */}
                <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-500 transition-all shadow-2xs group cursor-default">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                        <Scale size={13} className="text-sky-600 dark:text-sky-400 opacity-90 group-hover:scale-105 transition-transform" />
                        <span>Estimasi Biomassa</span>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">
                        {biomass.total_biomass_kg || (biomass.total_biomass_gram ? (biomass.total_biomass_gram / 1000).toFixed(2) : 5.17)} <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-0.5">kg</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-normal">
                        Sampling: <span className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{samplingDate}</span> • Laju: <span className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{biomass.daily_feed_rate_percent || 3}%</span>
                    </p>
                </div>

                {/* 2. Bobot Rata-rata Per Ekor */}
                <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-500 transition-all shadow-2xs group cursor-default">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                        <Fish size={13} className="text-teal-600 dark:text-teal-400 opacity-90 group-hover:scale-105 transition-transform" />
                        <span>Bobot Rata-rata</span>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">
                        {biomass.avg_weight_gram || 61.5} <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-0.5">g/ekor</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-normal">
                        Sampel: <span className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{biomass.total_sample_weight_gram || 615}g</span> ({biomass.sample_count || 10} Ekor)
                    </p>
                </div>

                {/* 3. Panjang Rata-rata */}
                <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-500 transition-all shadow-2xs group cursor-default">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                        <Ruler size={13} className="text-sky-700 dark:text-sky-400 opacity-90 group-hover:scale-105 transition-transform" />
                        <span>Panjang Rata-rata</span>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">
                        {biomass.avg_length_cm || 14.8} <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-0.5">cm</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-normal">
                        Perkembangan Ukuran Nila
                    </p>
                </div>

                {/* 4. Target Dosis Pakan Harian */}
                <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-500 transition-all shadow-2xs group cursor-default">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                        <Sparkles size={13} className="text-sky-600 dark:text-sky-400 opacity-90 group-hover:scale-105 transition-transform" />
                        <span>Target Pakan Harian</span>
                    </div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">
                        {biomass.target_daily_feed_gram || 155.0} <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-0.5">g/hari</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-normal">
                        Pemberian: <span className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">2x @ {biomass.feed_per_portion_gram || 77.5}g</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StatusOverview;
