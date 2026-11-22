import { useState } from 'react';
import { AlertTriangle, Wind, CheckCircle2, Check, Sparkles } from 'lucide-react';
import { useSensor } from '../context/SensorContext';

const AlertBanner = () => {
    const { sensorData, showToast } = useSensor();
    const [actionDone, setActionDone] = useState(false);

    const latest = sensorData?.latest || {};
    const interpretasi = latest['Interpretasi'] || 'Optimal';

    // Pengecekan: Parameter Kualitas Air
    const isWaterCritical = interpretasi === 'Bahaya/Mematikan' || 
                            interpretasi.toLowerCase().includes('bahaya') || 
                            interpretasi.toLowerCase().includes('rendah') ||
                            (sensorData?.kpi?.do?.status === 'BAHAYA') ||
                            (sensorData?.kpi?.nh3?.status === 'BAHAYA');
    const nh3Val = latest['% NH3 (Beracun)'] ?? sensorData?.kpi?.nh3?.value ?? '0.00';

    const handleQuickAction = () => {
        setActionDone(true);
        showToast("Perintah darurat terkirim: Aerator sekunder diaktifkan pada daya 100%!");
        setTimeout(() => setActionDone(false), 8000);
    };

    // Jika kualitas air kritis
    if (isWaterCritical) {
        return (
            <div className="bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 p-4 sm:p-5 rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] relative overflow-hidden transition-all">
                <div className="flex items-start gap-3.5 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0 mt-0.5 border border-rose-200/70 dark:border-rose-800">
                        <AlertTriangle size={18} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-bold text-sm text-rose-950 dark:text-rose-200">
                                Peringatan Anomali Kualitas Air: {(interpretasi && interpretasi.toLowerCase() !== 'optimal') ? interpretasi.toUpperCase() : 'WASPADA ANOMALI'}
                            </h3>
                            <span className="bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                Anomali Biokimia
                            </span>
                        </div>
                        <p className="text-xs text-rose-900/80 dark:text-rose-300/80 leading-relaxed font-normal">
                            Sensor mendeteksi anomali pada biokimia air (Amonia: <span className="font-semibold text-rose-950 dark:text-rose-100 tabular-nums">{nh3Val} mg/L</span>). Rekomendasi: Kurangi dosis pakan dan aktifkan aerator pendukung.
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleQuickAction}
                    disabled={actionDone}
                    className={`px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all duration-200 ease-out flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 disabled:opacity-80 disabled:cursor-default disabled:transform-none ${actionDone
                            ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                            : 'bg-rose-600 hover:bg-rose-500 hover:shadow-md hover:shadow-rose-500/30 hover:-translate-y-0.5 active:scale-95 text-white'
                        }`}
                >
                    {actionDone ? (
                        <>
                            <Check size={14} /> Aerator Aktif 100%
                        </>
                    ) : (
                        <>
                            <Wind size={14} /> Tindakan Cepat: Aktifkan Aerator
                        </>
                    )}
                </button>
            </div>
        );
    }

    // Jika semua kondisi normal
    return (
        <div className="bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50 p-4 sm:p-4.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] relative overflow-hidden transition-all">
            <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-800">
                    <CheckCircle2 size={19} />
                </div>
                <div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        Status Ekosistem Bioflok Kolam C: Optimal &amp; Stabil
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-emerald-100/70 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800">
                            <Sparkles size={10} /> Normal
                        </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                        Parameter dissolved oxygen {'>'} 4.0 mg/L dan parameter biokimia air terpantau stabil sesuai logbook budidaya.
                    </p>
                </div>
            </div>
            <span className="bg-emerald-100/70 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800 shrink-0 self-start sm:self-auto">
                SISTEM NORMAL
            </span>
        </div>
    );
};

export default AlertBanner;
