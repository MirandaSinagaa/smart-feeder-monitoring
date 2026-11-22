import { useSensor } from '../context/SensorContext';
import { Droplet, Compass, Thermometer, AlertOctagon } from 'lucide-react';
import { KpiCardSkeleton } from './SkeletonLoader';

const KpiCards = () => {
    const { sensorData, loading } = useSensor();

    if (loading && !sensorData) {
        return <KpiCardSkeleton />;
    }

    const kpi = sensorData?.kpi || {
        do: { value: 4.75, unit: 'mg/L', delta: 0.01, status: 'AMAN', voltage: 570 },
        ph: { value: 7.26, unit: 'pH', delta: 0.01, status: 'OPTIMAL', voltage: 2.1109 },
        temp: { value: 27.81, unit: '°C', delta: 0.01, status: 'STABIL' },
        nh3: { value: 0.05, unit: 'mg/L', status: 'AMAN' }
    };

    const latest = sensorData?.latest || {};

    return (
        <div id="kpi-cards" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 animate-fade-in-data">
            
            {/* 1. DO Card (Dissolved Oxygen) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:border-sky-300 dark:hover:border-sky-600 transition-all flex flex-col justify-between group cursor-default">
                <div>
                    <div className="flex justify-between items-center mb-3.5">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/70 dark:border-slate-700 tabular-nums">
                            SNSR-DO-01
                        </span>
                        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border transition-colors ${
                            kpi.do.status === 'AMAN' 
                                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/80' 
                                : 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200/70 dark:border-rose-800/80'
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                                kpi.do.status === 'AMAN' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'
                            }`}></span>
                            {kpi.do.status}
                        </span>
                    </div>

                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-100 dark:border-sky-800/50 opacity-90 group-hover:opacity-100 group-hover:border-sky-300 dark:group-hover:border-sky-700 transition-all duration-200 shadow-2xs">
                            <Droplet size={16} />
                        </div>
                        <div>
                            <h3 className="text-slate-900 dark:text-slate-100 font-bold text-sm tracking-tight group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors">
                                Dissolved Oxygen (DO)
                            </h3>
                        </div>
                    </div>
                    
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-3 pl-10.5">Batas Aman: &gt; 4.0 mg/L</p>

                    <div className="pl-10.5 mb-1">
                        <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors">
                            {kpi.do.value}
                            <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-1.5">{kpi.do.unit}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] font-normal">
                        Voltase Probe: <span className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{latest['Voltage DO'] || kpi.do.voltage} mV</span>
                    </span>
                    <span className={`font-semibold text-[11px] px-2 py-0.5 rounded tabular-nums ${
                        kpi.do.delta >= 0 ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                    }`}>
                        {kpi.do.delta >= 0 ? `+${kpi.do.delta}` : kpi.do.delta}
                    </span>
                </div>
            </div>

            {/* 2. pH Card (Derajat Keasaman) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:border-sky-300 dark:hover:border-sky-600 transition-all flex flex-col justify-between group cursor-default">
                <div>
                    <div className="flex justify-between items-center mb-3.5">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/70 dark:border-slate-700 tabular-nums">
                            SNSR-PH-02
                        </span>
                        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border transition-colors ${
                            kpi.ph.status === 'OPTIMAL' 
                                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/80' 
                                : 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/80'
                        }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {kpi.ph.status}
                        </span>
                    </div>

                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-100 dark:border-teal-800/50 opacity-90 group-hover:opacity-100 group-hover:border-teal-300 dark:group-hover:border-teal-700 transition-all duration-200 shadow-2xs">
                            <Compass size={16} />
                        </div>
                        <div>
                            <h3 className="text-slate-900 dark:text-slate-100 font-bold text-sm tracking-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                Derajat Keasaman (pH)
                            </h3>
                        </div>
                    </div>
                    
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-3 pl-10.5">Rentang Ideal: 6.8 - 8.2 pH</p>

                    <div className="pl-10.5 mb-1">
                        <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {kpi.ph.value}
                            <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-1.5">{kpi.ph.unit}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] font-normal">
                        Voltase Probe: <span className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{latest['Voltage pH'] || kpi.ph.voltage} V</span>
                    </span>
                    <span className={`font-semibold text-[11px] px-2 py-0.5 rounded tabular-nums ${
                        kpi.ph.delta >= 0 ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                    }`}>
                        {kpi.ph.delta >= 0 ? `+${kpi.ph.delta}` : kpi.ph.delta}
                    </span>
                </div>
            </div>

            {/* 3. Temp Card (Suhu Air) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:border-sky-300 dark:hover:border-sky-600 transition-all flex flex-col justify-between group cursor-default">
                <div>
                    <div className="flex justify-between items-center mb-3.5">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/70 dark:border-slate-700 tabular-nums">
                            SNSR-TMP-03
                        </span>
                        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border-sky-200/70 dark:border-sky-800/80 transition-colors">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                            {kpi.temp.status}
                        </span>
                    </div>

                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-100 dark:border-sky-800/50 opacity-90 group-hover:opacity-100 group-hover:border-sky-300 dark:group-hover:border-sky-700 transition-all duration-200 shadow-2xs">
                            <Thermometer size={16} />
                        </div>
                        <div>
                            <h3 className="text-slate-900 dark:text-slate-100 font-bold text-sm tracking-tight group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors">
                                Suhu Air Kolam
                            </h3>
                        </div>
                    </div>
                    
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-3 pl-10.5">Rentang Fisiologis: 25 - 32 °C</p>

                    <div className="pl-10.5 mb-1">
                        <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors">
                            {kpi.temp.value}
                            <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-1.5">{kpi.temp.unit}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] font-normal">
                        Kondisi: <span className={`font-semibold ${kpi.temp.status === 'STABIL' ? 'text-sky-800 dark:text-sky-300' : 'text-amber-700 dark:text-amber-300'}`}>
                            {kpi.temp.status === 'STABIL' ? 'Metabolisme Normal' : 'Suhu Fluktuatif'}
                        </span>
                    </span>
                    <span className="font-semibold text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 tabular-nums">
                        {kpi.temp.delta >= 0 ? `+${kpi.temp.delta}` : kpi.temp.delta}
                    </span>
                </div>
            </div>

            {/* 4. NH3 / Amonia Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs hover:border-sky-300 dark:hover:border-sky-600 transition-all flex flex-col justify-between group cursor-default">
                <div>
                    <div className="flex justify-between items-center mb-3.5">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/70 dark:border-slate-700 tabular-nums">
                            SNSR-NH3-04
                        </span>
                        <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border transition-colors ${
                            kpi.nh3.status === 'AMAN' 
                                ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/80' 
                                : 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200/70 dark:border-rose-800/80'
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                                kpi.nh3.status === 'AMAN' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'
                            }`}></span>
                            {kpi.nh3.status}
                        </span>
                    </div>

                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-800/50 opacity-90 group-hover:opacity-100 group-hover:border-amber-300 dark:group-hover:border-amber-700 transition-all duration-200 shadow-2xs">
                            <AlertOctagon size={16} />
                        </div>
                        <div>
                            <h3 className="text-slate-900 dark:text-slate-100 font-bold text-sm tracking-tight group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                                Amonia (% NH3 Bebas)
                            </h3>
                        </div>
                    </div>
                    
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-3 pl-10.5">Ambang Kritis: 0.02 mg/L</p>

                    <div className="pl-10.5 mb-1">
                        <div className={`text-3xl font-extrabold tracking-tight tabular-nums transition-colors ${
                            kpi.nh3.status === 'BAHAYA' 
                                ? 'text-rose-600 dark:text-rose-400' 
                                : 'text-slate-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400'
                        }`}>
                            {kpi.nh3.value}
                            <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-1.5">{kpi.nh3.unit}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] font-normal">
                        Status: <span className={`font-semibold ${
                            kpi.nh3.status === 'AMAN' ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-400'
                        }`}>{latest['Interpretasi'] || (kpi.nh3.status === 'AMAN' ? 'Aman' : 'Waspada')}</span>
                    </span>
                    <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 tabular-nums">Pakan: {latest['Log Pakan Pagi'] || 0}g</span>
                </div>
            </div>

        </div>
    );
};

export default KpiCards;
