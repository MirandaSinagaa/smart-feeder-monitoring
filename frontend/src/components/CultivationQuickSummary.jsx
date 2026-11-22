import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    CheckSquare, 
    Utensils, 
    Scale, 
    Wrench, 
    FileText, 
    ArrowRight, 
    ChevronRight, 
    Sparkles
} from 'lucide-react';
import api from '../api';

const CultivationQuickSummary = () => {
    const navigate = useNavigate();
    const [recapData, setRecapData] = useState(null);

    useEffect(() => {
        const fetchQuickSummaries = async () => {
            try {
                const resRecap = await api.get('/api/cultivation/recap');
                if (resRecap.data?.summary) setRecapData(resRecap.data.summary);
            } catch (err) {
                console.warn('Cultivation quick summary fetch warning:', err);
            }
        };

        fetchQuickSummaries();
    }, []);

    const summary = recapData || {
        duration_days: 144,
        current_weight_gram: 61.5,
        current_biomass_gram: 5166,
        total_feed_gram: 12294,
        fcr: 2.72
    };

    const modules = [
        {
            id: 'checklist',
            title: 'Checklist Harian',
            subtitle: '01_CHECKLIST_HARIAN',
            icon: CheckSquare,
            stat: 'Hari Ke-100 Selesai',
            desc: 'Pakan 09:00, 15:30 & Bibis tuntas dicatat',
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800'
        },
        {
            id: 'feeding',
            title: 'Pemberian Pakan',
            subtitle: '02_PAKAN',
            icon: Utensils,
            stat: `${((summary.total_feed_gram || 12294) / 1000).toFixed(2)} kg Terdistribusi`,
            desc: 'Target harian 154.98g (Pagi 09:00 & Sore 15:30)',
            color: 'text-sky-600 dark:text-sky-400',
            bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200/80 dark:border-sky-800'
        },
        {
            id: 'sampling',
            title: 'Sampling Ikan',
            subtitle: '03_SAMPLING',
            icon: Scale,
            stat: `${summary.current_weight_gram || 61.5} g / ekor`,
            desc: `Biomassa ${(summary.current_biomass_gram / 1000).toFixed(2)} kg • Nila Hitam 84 ekor`,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200/80 dark:border-purple-800'
        },
        {
            id: 'maintenance',
            title: 'Perawatan Kolam',
            subtitle: '04_PERAWATAN_KOLAM',
            icon: Wrench,
            stat: '13 Sesi Perawatan',
            desc: 'Pengurasan air, probiotik & molase terjadwal',
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800'
        },
        {
            id: 'recap',
            title: 'Rekapitulasi Budidaya',
            subtitle: '05_REKAP',
            icon: FileText,
            stat: `FCR ${summary.fcr || 2.72}`,
            desc: 'Gain: +4.52 kg • Mortalitas 0.00%',
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200/80 dark:border-indigo-800'
        }
    ];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs select-none">
            {/* Header Bagian */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="p-1 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                            <Sparkles size={14} />
                        </span>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                            Pencatatan &amp; Logbook Budidaya Kolam
                        </h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                        5 modul formulir dan pencatatan operasional kolam bioflok tersinkronisasi langsung dengan Google Sheets.
                    </p>
                </div>

                <button
                    onClick={() => navigate('/cultivation')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300 group cursor-pointer"
                >
                    <span>Buka Menu Pencatatan Data</span>
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>

            {/* 5 Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
                {modules.map((m) => {
                    const Icon = m.icon;
                    return (
                        <div
                            key={m.id}
                            onClick={() => navigate(`/cultivation/${m.id}`)}
                            className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-600 bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition-all cursor-pointer flex flex-col justify-between group shadow-2xs hover:shadow-xs"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${m.bg}`}>
                                        <Icon size={16} className={m.color} />
                                    </div>
                                    <span className="text-[10px] font-semibold text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                        {m.subtitle.split('_')[0]}
                                    </span>
                                </div>

                                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors">
                                    {m.title}
                                </h4>

                                <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100 tabular-nums mb-1">
                                    {m.stat}
                                </div>

                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                                    {m.desc}
                                </p>
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-sky-700 dark:text-sky-400">
                                <span>Input &amp; Lihat</span>
                                <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CultivationQuickSummary;
