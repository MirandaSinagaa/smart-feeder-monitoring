import { useState, useMemo } from 'react';
import { Activity, Droplet, Compass, Thermometer, Layers } from 'lucide-react';
import { 
    LineChart, 
    Line, 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    ReferenceLine 
} from 'recharts';
import { useSensor } from '../context/SensorContext';
import { ChartSkeleton, SkeletonBox } from './SkeletonLoader';

// Tooltip khusus untuk grafik sensor individual dengan tabular-nums
const SingleSensorTooltip = ({ active, payload, label, unit, color }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.12] shadow-md dark:shadow-none dark:ring-1 dark:ring-white/[0.08] text-xs space-y-1 min-w-[140px]">
                <div className="font-semibold text-slate-500 dark:text-slate-400 text-[11px] border-b border-slate-100 dark:border-white/[0.06] pb-1 flex justify-between">
                    <span>Waktu:</span>
                    <span className="tabular-nums font-bold text-slate-800 dark:text-slate-200">{label} WITA</span>
                </div>
                <div className="flex items-center justify-between gap-2 pt-0.5">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
                        {payload[0].name}:
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                        {payload[0].value} {unit}
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

// Tooltip untuk grafik gabungan ketiga sensor
const CombinedTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl border border-slate-200/80 dark:border-white/[0.12] shadow-lg dark:shadow-none dark:ring-1 dark:ring-white/[0.08] text-xs space-y-2 min-w-[175px]">
                <div className="font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-white/[0.06] pb-1.5 flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Waktu:</span>
                    <span className="tabular-nums font-bold text-slate-900 dark:text-white">{label} WITA</span>
                </div>
                <div className="space-y-1.5">
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                                {entry.name}:
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                                {entry.value} {entry.dataKey === 'temp' ? '°C' : entry.dataKey === 'do' ? 'mg/L' : ''}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

const getStats = (data, key) => {
    if (!data || data.length === 0) return { min: '0.00', max: '0.00', avg: '0.00' };
    const values = data.map(d => Number(d[key])).filter(v => !isNaN(v) && v !== null);
    if (values.length === 0) return { min: '0.00', max: '0.00', avg: '0.00' };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return {
        min: min.toFixed(2),
        max: max.toFixed(2),
        avg: avg.toFixed(2)
    };
};

const WaterQualityChart = () => {
    const { sensorData, loading } = useSensor();
    const [filterRange, setFilterRange] = useState('all'); // 'all', '10', '5'

    const rawChartData = sensorData?.chart_data || [
        { time: '09:00', do: 4.56, ph: 7.20, temp: 27.62 },
        { time: '09:15', do: 4.57, ph: 7.22, temp: 27.63 },
        { time: '09:30', do: 4.58, ph: 7.24, temp: 27.64 },
        { time: '09:45', do: 4.60, ph: 7.25, temp: 27.70 },
        { time: '10:00', do: 4.75, ph: 7.26, temp: 27.81 },
    ];

    let displayedData = rawChartData;
    if (filterRange === '5') {
        displayedData = rawChartData.slice(-5);
    } else if (filterRange === '10') {
        displayedData = rawChartData.slice(-10);
    }

    const lastSyncTime = sensorData?.last_sync_wita || 'Hari Ini';

    const kpi = sensorData?.kpi || {
        do: { value: 4.75, unit: 'mg/L', status: 'AMAN' },
        ph: { value: 7.26, unit: 'pH', status: 'OPTIMAL' },
        temp: { value: 27.81, unit: '°C', status: 'STABIL' },
    };

    const statsDO = useMemo(() => getStats(displayedData, 'do'), [displayedData]);
    const statsPH = useMemo(() => getStats(displayedData, 'ph'), [displayedData]);
    const statsTemp = useMemo(() => getStats(displayedData, 'temp'), [displayedData]);

    if (loading && (!sensorData || rawChartData.length === 0)) {
        return <ChartSkeleton />;
    }

    return (
        <div id="water-chart" className="space-y-6 transition-all duration-200 ease-out animate-fade-in-data">
            
            {/* Top Control Header: Judul Kualitas Air & Filter Rentang Data */}
            <div className="bg-white dark:bg-slate-900/90 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-none hover:border-slate-300 dark:hover:border-white/[0.12] transition-all duration-200 ease-out flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-0.5 tracking-tight">
                        <Activity className="text-sky-600 dark:text-sky-400" size={19} /> Kualitas Air
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                        Telemetri Sensor ESP32 • Terakhir Diperbarui: <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">{lastSyncTime}</span>
                    </p>
                </div>

                {/* Segmented Filter Pills dengan Adaptive Tactile Button Animation */}
                <div className="flex bg-slate-100/80 dark:bg-white/[0.04] p-1 rounded-xl border border-slate-200/70 dark:border-white/[0.07] text-xs w-full sm:w-auto gap-1">
                    <button 
                        onClick={() => setFilterRange('all')}
                        className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs rounded-lg select-none cursor-pointer font-medium active:scale-[0.98] transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                            filterRange === 'all' 
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-sm shadow-black/10 dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-white/20' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                        }`}
                    >
                        Semua (<span className="tabular-nums">{rawChartData.length}</span>)
                    </button>
                    <button 
                        onClick={() => setFilterRange('10')}
                        className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs rounded-lg select-none cursor-pointer font-medium active:scale-[0.98] transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                            filterRange === '10' 
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-sm shadow-black/10 dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-white/20' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                        }`}
                    >
                        10 Terakhir
                    </button>
                    <button 
                        onClick={() => setFilterRange('5')}
                        className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs rounded-lg select-none cursor-pointer font-medium active:scale-[0.98] transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                            filterRange === '5' 
                                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold shadow-sm shadow-black/10 dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-white/20' 
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                        }`}
                    >
                        5 Terakhir
                    </button>
                </div>
            </div>

            {/* BAGIAN 1: GRAFIK PER SENSOR (DO, pH, dan Suhu) - Dual-Theme Stabil Hover */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                
                {/* 1. Grafik Sensor DO */}
                <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-white/[0.07] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-none hover:border-slate-300 dark:hover:border-white/[0.15] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] dark:hover:bg-slate-800/60 hover:-translate-y-[1px] transition-all duration-200 ease-out group cursor-default flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-100 dark:border-sky-800/60 opacity-85 group-hover:opacity-100 transition-opacity duration-200 shadow-2xs">
                                    <Droplet size={16} />
                                </div>
                                <div>
                                    <h4 className="text-slate-900 dark:text-slate-100 font-bold text-sm tracking-tight">
                                        Dissolved Oxygen (DO)
                                    </h4>
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Batas Aman: &gt; 4.0 mg/L</span>
                                </div>
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                                kpi.do.status === 'AMAN' 
                                    ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/80' 
                                    : 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200/70 dark:border-rose-800/80'
                            }`}>
                                {kpi.do.status}
                            </span>
                        </div>

                        <div className="mb-2">
                            <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">
                                {kpi.do.value}
                                <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-1.5 font-sans">{kpi.do.unit}</span>
                            </div>
                        </div>

                        <div className="h-[210px] w-full bg-slate-50/50 dark:bg-white/[0.02] p-2 rounded-xl border border-slate-100/80 dark:border-white/[0.06]">
                            {loading ? (
                                <SkeletonBox className="h-full w-full rounded-lg" />
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={displayedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gradientDO" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0284C7" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} dy={5} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} domain={[0, 'auto']} />
                                        <ReferenceLine y={4} stroke="#FB7185" strokeDasharray="3 3" strokeWidth={1.5} />
                                        <Tooltip content={<SingleSensorTooltip unit="mg/L" color="#0284C7" />} />
                                        <Area type="monotone" dataKey="do" name="DO" stroke="#0284C7" strokeWidth={2.2} fillOpacity={1} fill="url(#gradientDO)" dot={{ r: 2.5, strokeWidth: 1.5, fill: '#FFFFFF', stroke: '#0284C7' }} activeDot={{ r: 4.5, fill: '#0284C7' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Min: <strong className="text-slate-800 dark:text-slate-200 tabular-nums">{statsDO.min}</strong></span>
                        <span>Rata-rata: <strong className="text-slate-800 dark:text-slate-200 tabular-nums">{statsDO.avg}</strong></span>
                        <span>Maks: <strong className="text-slate-800 dark:text-slate-200 tabular-nums">{statsDO.max}</strong></span>
                    </div>
                </div>

                {/* 2. Grafik Sensor pH */}
                <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-white/[0.07] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-none hover:border-slate-300 dark:hover:border-white/[0.15] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] dark:hover:bg-slate-800/60 hover:-translate-y-[1px] transition-all duration-200 ease-out group cursor-default flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-100 dark:border-teal-800/60 opacity-85 group-hover:opacity-100 transition-opacity duration-200 shadow-2xs">
                                    <Compass size={16} />
                                </div>
                                <div>
                                    <h4 className="text-slate-900 dark:text-slate-100 font-bold text-sm tracking-tight">
                                        Derajat Keasaman (pH)
                                    </h4>
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Rentang Ideal: 6.8 - 8.2</span>
                                </div>
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                                kpi.ph.status === 'OPTIMAL' 
                                    ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/80' 
                                    : 'bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/80'
                            }`}>
                                {kpi.ph.status}
                            </span>
                        </div>

                        <div className="mb-2">
                            <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">
                                {kpi.ph.value}
                                <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-1.5 font-sans">{kpi.ph.unit}</span>
                            </div>
                        </div>

                        <div className="h-[210px] w-full bg-slate-50/50 dark:bg-white/[0.02] p-2 rounded-xl border border-slate-100/80 dark:border-white/[0.06]">
                            {loading ? (
                                <SkeletonBox className="h-full w-full rounded-lg" />
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={displayedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gradientPH" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0D9488" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} dy={5} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} domain={[4, 10]} />
                                        <ReferenceLine y={6.8} stroke="#14B8A6" strokeDasharray="3 3" strokeWidth={1} />
                                        <ReferenceLine y={8.2} stroke="#14B8A6" strokeDasharray="3 3" strokeWidth={1} />
                                        <Tooltip content={<SingleSensorTooltip unit="pH" color="#0D9488" />} />
                                        <Area type="monotone" dataKey="ph" name="pH" stroke="#0D9488" strokeWidth={2.2} fillOpacity={1} fill="url(#gradientPH)" dot={{ r: 2.5, strokeWidth: 1.5, fill: '#FFFFFF', stroke: '#0D9488' }} activeDot={{ r: 4.5, fill: '#0D9488' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Min: <strong className="text-slate-800 dark:text-slate-200 tabular-nums">{statsPH.min}</strong></span>
                        <span>Rata-rata: <strong className="text-slate-800 dark:text-slate-200 tabular-nums">{statsPH.avg}</strong></span>
                        <span>Maks: <strong className="text-slate-800 dark:text-slate-200 tabular-nums">{statsPH.max}</strong></span>
                    </div>
                </div>

                {/* 3. Grafik Sensor Suhu */}
                <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-white/[0.07] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-none hover:border-slate-300 dark:hover:border-white/[0.15] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] dark:hover:bg-slate-800/60 hover:-translate-y-[1px] transition-all duration-200 ease-out group cursor-default flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200/70 dark:border-white/[0.08] opacity-85 group-hover:opacity-100 transition-opacity duration-200 shadow-2xs">
                                    <Thermometer size={16} />
                                </div>
                                <div>
                                    <h4 className="text-slate-900 dark:text-slate-100 font-bold text-sm tracking-tight">
                                        Suhu Air Kolam
                                    </h4>
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Rentang Optimal: 26.0 - 30.0 °C</span>
                                </div>
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors ${
                                kpi.temp.status === 'STABIL' 
                                    ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 border-sky-200/70 dark:border-sky-800/80' 
                                    : 'bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border-blue-200/70 dark:border-blue-800/80'
                            }`}>
                                {kpi.temp.status}
                            </span>
                        </div>

                        <div className="mb-2">
                            <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">
                                {kpi.temp.value}
                                <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-1.5 font-sans">{kpi.temp.unit}</span>
                            </div>
                        </div>

                        <div className="h-[210px] w-full bg-slate-50/50 dark:bg-white/[0.02] p-2 rounded-xl border border-slate-100/80 dark:border-white/[0.06]">
                            {loading ? (
                                <SkeletonBox className="h-full w-full rounded-lg" />
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={displayedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="gradientTemp" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#475569" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#475569" stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} dy={5} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} domain={[20, 36]} unit="°C" />
                                        <ReferenceLine y={26} stroke="#94A3B8" strokeDasharray="3 3" strokeWidth={1} />
                                        <ReferenceLine y={30} stroke="#94A3B8" strokeDasharray="3 3" strokeWidth={1} />
                                        <Tooltip content={<SingleSensorTooltip unit="°C" color="#475569" />} />
                                        <Area type="monotone" dataKey="temp" name="Suhu" stroke="#475569" strokeWidth={2.2} fillOpacity={1} fill="url(#gradientTemp)" dot={{ r: 2.5, strokeWidth: 1.5, fill: '#FFFFFF', stroke: '#475569' }} activeDot={{ r: 4.5, fill: '#475569' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Min: <strong className="text-slate-800 dark:text-slate-200 tabular-nums">{statsTemp.min}°C</strong></span>
                        <span>Rata-rata: <strong className="text-slate-800 dark:text-slate-200 tabular-nums">{statsTemp.avg}°C</strong></span>
                        <span>Maks: <strong className="text-slate-800 dark:text-slate-200 tabular-nums">{statsTemp.max}°C</strong></span>
                    </div>
                </div>

            </div>

            {/* BAGIAN 2: GRAFIK GABUNGAN KETIGA SENSOR (DO, pH, dan Suhu) */}
            <div className="bg-white dark:bg-slate-900/90 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-none hover:border-slate-300 dark:hover:border-white/[0.12] transition-all duration-200 ease-out">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-0.5 tracking-tight">
                            <Layers className="text-sky-600 dark:text-sky-400" size={19} /> Grafik Gabungan Sensor Kualitas Air (DO, pH, Suhu)
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                            Visualisasi korelasi simultan ketiga parameter kualitas air kolam bioflok dalam satu kurva waktu.
                        </p>
                    </div>
                    
                    {/* Legend */}
                    <div className="flex gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0">
                        <div className="flex items-center gap-1.5"><Droplet size={13} className="text-[#0284C7]" /> DO</div>
                        <div className="flex items-center gap-1.5"><Compass size={13} className="text-[#0D9488]" /> pH</div>
                        <div className="flex items-center gap-1.5"><Thermometer size={13} className="text-[#475569]" /> Suhu</div>
                    </div>
                </div>
                
                <div className="h-[340px] w-full bg-slate-50/50 dark:bg-white/[0.02] p-3 sm:p-4 rounded-xl border border-slate-100/80 dark:border-white/[0.06]">
                    {loading ? (
                        <div className="h-full w-full flex flex-col justify-between p-2">
                            <SkeletonBox className="h-5 w-full rounded" />
                            <div className="flex items-end justify-between h-44 px-3 gap-2">
                                {[40, 75, 50, 90, 60, 95, 70, 85, 65, 80].map((h, i) => (
                                    <SkeletonBox key={i} className="flex-1 rounded-t opacity-75" style={{ height: `${h}%` }} />
                                ))}
                            </div>
                            <SkeletonBox className="h-4 w-1/3 mx-auto rounded" />
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={displayedData} margin={{ top: 15, right: 25, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                                <XAxis 
                                    dataKey="time" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} 
                                    dy={8} 
                                />
                                <YAxis 
                                    yAxisId="left" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} 
                                    dx={-5} 
                                    domain={[0, 16]} 
                                />
                                <YAxis 
                                    yAxisId="right" 
                                    orientation="right" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }} 
                                    dx={5} 
                                    domain={[20, 40]} 
                                    unit="°C" 
                                />
                                
                                <ReferenceLine 
                                    yAxisId="left" 
                                    y={4} 
                                    stroke="#FB7185" 
                                    strokeDasharray="3 3" 
                                    strokeWidth={1.5}
                                    label={{ position: 'insideTopLeft', value: 'Batas Minimal DO (4.0 mg/L)', fill: '#E11D48', fontSize: 10, fontWeight: 600 }} 
                                />
                                
                                <Tooltip content={<CombinedTooltip />} />
                                
                                <Line 
                                    yAxisId="left" 
                                    type="monotone" 
                                    dataKey="do" 
                                    name="DO" 
                                    stroke="#0284C7" 
                                    strokeWidth={2.5} 
                                    dot={{ r: 3.5, strokeWidth: 2, fill: '#FFFFFF', stroke: '#0284C7' }} 
                                    activeDot={{ r: 5.5, strokeWidth: 0, fill: '#0284C7' }} 
                                />
                                <Line 
                                    yAxisId="left" 
                                    type="monotone" 
                                    dataKey="ph" 
                                    name="pH" 
                                    stroke="#0D9488" 
                                    strokeWidth={2.5} 
                                    dot={{ r: 3.5, strokeWidth: 2, fill: '#FFFFFF', stroke: '#0D9488' }} 
                                    activeDot={{ r: 5.5, strokeWidth: 0, fill: '#0D9488' }} 
                                />
                                <Line 
                                    yAxisId="right" 
                                    type="monotone" 
                                    dataKey="temp" 
                                    name="Suhu" 
                                    stroke="#475569" 
                                    strokeWidth={2} 
                                    dot={{ r: 3, strokeWidth: 1.5, fill: '#FFFFFF', stroke: '#475569' }} 
                                    activeDot={{ r: 5, strokeWidth: 0, fill: '#475569' }} 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

        </div>
    );
};

export default WaterQualityChart;
