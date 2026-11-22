import { 
    Droplet, Compass, Thermometer, 
    ShieldCheck, Info
} from 'lucide-react';
import WaterQualityChart from '../components/WaterQualityChart';

const WaterQuality = () => {

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            
            {/* Hero Banner Card - Vibe Elegan, Kalem & Senada dengan Tampilan Login */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs transition-all animate-card-slideup">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5 mb-2.5">
                            <span className="text-[10px] sm:text-xs font-extrabold tracking-widest text-sky-700 dark:text-sky-400 uppercase bg-sky-50 dark:bg-sky-950/70 border border-sky-200/60 dark:border-sky-800 px-3 py-1 rounded-full inline-block">
                                KUALITAS AIR &amp; TELEMETRI
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                Sensor ESP32 Dev V4
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                            Monitoring Kondisi Sistem &amp; Kualitas Air
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-2xl font-normal leading-relaxed">
                            Monitoring kontinu telemetri sensor DO, pH, Suhu, dan Amonia Kolam Bioflok C berbasis IoT ESP32 &amp; Google Sheets Live Sync.
                        </p>
                    </div>
                </div>
            </div>

            {/* Interactive Chart Section */}
            <WaterQualityChart />

            {/* Standar & Panduan Analitik Kualitas Air Bioflok */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 sm:p-6 transition-all">
                <div className="flex items-center gap-2 mb-4">
                    <Info className="text-sky-700 dark:text-sky-400" size={19} />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                        Pedoman Ambang Batas Kualitas Air Kolam Bioflok Nila
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50/80 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700/80">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-lg bg-sky-100/70 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center">
                                <Droplet size={15} />
                            </div>
                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">Dissolved Oxygen (DO)</h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                            Kadar oksigen terlarut mutlak &gt; 4.0 mg/L. Aerator venturi menjaga respirasi bakteri aerob pengurai amonia dan mencegah hipoksia pada ikan nila.
                        </p>
                        <div className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 flex justify-between tabular-nums">
                            <span className="text-slate-500 dark:text-slate-400">Ambang Aman:</span>
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">&gt; 4.0 mg/L</span>
                        </div>
                    </div>

                    <div className="bg-slate-50/80 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700/80">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-lg bg-teal-100/70 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                                <Compass size={15} />
                            </div>
                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">Derajat Keasaman (pH)</h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                            Rentang ideal 6.8 - 8.2 mendukung efektivitas flok bioflok. Bila pH &gt; 8.5 fraksi gas NH3 beracun meningkat tajam membahayakan insang ikan.
                        </p>
                        <div className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 flex justify-between tabular-nums">
                            <span className="text-slate-500 dark:text-slate-400">Ambang Ideal:</span>
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">6.8 - 8.2 pH</span>
                        </div>
                    </div>

                    <div className="bg-slate-50/80 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700/80">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                                <Thermometer size={15} />
                            </div>
                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">Suhu Air Kolam</h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                            Suhu 26.0 - 30.0 °C memaksimalkan laju metabolisme, pencernaan pelet, serta stabilitas bakteri nitrifikasi dalam flok bioflok.
                        </p>
                        <div className="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 flex justify-between tabular-nums">
                            <span className="text-slate-500 dark:text-slate-400">Ambang Optimal:</span>
                            <span className="font-bold text-sky-800 dark:text-sky-300">26.0 - 30.0 °C</span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800/60 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
                    <ShieldCheck size={18} className="text-sky-700 dark:text-sky-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                        <strong className="text-slate-900 dark:text-white">Proteksi Otomatis Smart Feeder:</strong> Kontrol logika ESP32 Dev V4 secara otomatis mengunci aktuator semprot pakan jika terdeteksi nilai <em>DO &lt; 3.8 mg/L</em> demi menghindari akumulasi pembusukan pelet tak terkonsumsi yang berisiko menaikkan amonia bebas.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WaterQuality;
