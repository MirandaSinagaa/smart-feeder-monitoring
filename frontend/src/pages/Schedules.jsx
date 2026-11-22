import { useState } from 'react';
import { Clock, Plus, ToggleLeft, ToggleRight, Trash2, Wind, Shield, RefreshCw } from 'lucide-react';
import { useSensor } from '../context/SensorContext';

const Schedules = () => {
    const { sensorData, schedules, toggleSchedule, createSchedule, deleteSchedule, manualFeed } = useSensor();
    const hopperPct = sensorData?.status_overview?.hopper_remaining_percent ?? 64;
    const hopperKg = ((hopperPct / 100) * 5.0).toFixed(1);

    const [showModal, setShowModal] = useState(false);
    const [timeOfDay, setTimeOfDay] = useState('Pagi');
    const [scheduledTime, setScheduledTime] = useState('08:00');
    const [targetAmount, setTargetAmount] = useState(500);
    const [pelletType, setPelletType] = useState('Hi-Pro-Vite 781-2');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [manualAmount, setManualAmount] = useState(50);
    const [isDispensing, setIsDispensing] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const success = await createSchedule({
            pool_id: 1,
            time_of_day: timeOfDay,
            scheduled_time: scheduledTime,
            target_amount_gram: parseFloat(targetAmount),
            pellet_type: pelletType,
            is_active: true
        });
        setIsSubmitting(false);
        if (success) {
            setShowModal(false);
            setScheduledTime('08:00');
            setTargetAmount(500);
        }
    };

    const handleManualFeedSubmit = async () => {
        setIsDispensing(true);
        await manualFeed(manualAmount);
        setIsDispensing(false);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Hero Banner Card - Vibe Elegan, Kalem & Senada dengan Tampilan Login */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs transition-all animate-card-slideup">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5 mb-2.5">
                            <span className="text-[10px] sm:text-xs font-extrabold tracking-widest text-sky-700 dark:text-sky-400 uppercase bg-sky-50 dark:bg-sky-950/70 border border-sky-200/60 dark:border-sky-800 px-3 py-1 rounded-full inline-block">
                                OTOMATISASI PAKAN
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                ESP32 Servo &amp; Valve Dispenser
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                            Penjadwalan Pakan Otomatis
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-2xl font-normal leading-relaxed">
                            Atur waktu dan dosis pakan pelet otomatis mikrokontroler ESP32 terhubung living lab.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowModal(true);
                            }}
                            className="px-4 py-2.5 bg-sky-900 hover:bg-sky-950 dark:bg-sky-600 dark:hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-[0.99]"
                        >
                            <Plus size={16} />
                            <span>Tambah Jadwal Baru</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid 2 Kolom: Daftar Jadwal & Status Feeder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Kolom Kiri: Daftar Jadwal Aktif */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/70 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
                        <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Clock size={18} className="text-sky-700" /> Jadwal Pakan Otomatis Terprogram
                        </h2>

                        {schedules.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm font-normal">
                                Belum ada jadwal pakan yang tersimpan. Klik "Tambah Jadwal Baru" di atas.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {schedules.map((sch) => (
                                    <div 
                                        key={sch.id} 
                                        className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                                            sch.is_active 
                                                ? 'bg-white border-slate-200/80 shadow-2xs' 
                                                : 'bg-slate-50/70 border-slate-200/50 opacity-60'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl font-mono text-sm font-bold ${
                                                sch.is_active ? 'bg-sky-50 text-sky-900 border border-sky-100' : 'bg-slate-200 text-slate-500'
                                            }`}>
                                                {sch.scheduled_time}
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-800 text-sm">{sch.time_of_day}</span>
                                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                                        sch.is_active 
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' 
                                                            : 'bg-slate-100 text-slate-600 border-slate-200'
                                                    }`}>
                                                        {sch.is_active ? 'AKTIF' : 'NONAKTIF'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5 font-normal">
                                                    Dosis: <span className="font-semibold text-slate-700">{sch.target_amount_gram} gram</span> • Jenis: {sch.pellet_type}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => toggleSchedule(sch.id, sch.is_active)}
                                                className="cursor-pointer transition-colors"
                                                title={sch.is_active ? "Nonaktifkan jadwal" : "Aktifkan jadwal"}
                                            >
                                                {sch.is_active ? (
                                                    <ToggleRight size={32} className="text-sky-700 hover:text-sky-800" />
                                                ) : (
                                                    <ToggleLeft size={32} className="text-slate-300 hover:text-slate-400" />
                                                )}
                                            </button>

                                            <button 
                                                onClick={() => deleteSchedule(sch.id)}
                                                className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                title="Hapus jadwal ini"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Kolom Kanan: Status Hopper & Manual Dispenser */}
                <div className="space-y-6">
                    {/* Status Hopper */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/70 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
                        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                            <Shield size={16} className="text-sky-700" /> Status Silo Smart Feeder
                        </h3>

                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-slate-500">Kapasitas Silo Terisi</span>
                                <span className="font-extrabold text-slate-900 text-sm font-metric">{hopperPct}% (~{hopperKg} kg)</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-slate-500">Estimasi Pelet Habis</span>
                                <span className="font-semibold text-slate-800">4-5 Hari</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-slate-500">Frekuensi Semprotan</span>
                                <span className="font-semibold text-slate-800">2x Sehari (Pagi & Sore)</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-slate-500">Safety Interlock DO</span>
                                <span className="font-semibold text-emerald-700">Aktif ({'>'} 3.8 mg/L)</span>
                            </div>
                        </div>
                    </div>

                    {/* Manual Dispenser Control */}
                    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/70 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
                        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <Wind size={16} className="text-sky-700" /> Pemicu Pakan Manual
                        </h3>
                        <p className="text-xs text-slate-500 mb-4 font-normal">
                            Kirim sinyal langsung ke aktuator untuk memberi pakan.
                        </p>

                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-slate-700 block">Pilih Dosis Pakan (Gram):</label>
                            <div className="grid grid-cols-3 gap-2">
                                {[25, 50, 100].map((amt) => (
                                    <button 
                                        key={amt}
                                        type="button"
                                        onClick={() => setManualAmount(amt)}
                                        className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                            manualAmount === amt 
                                                ? 'bg-sky-900 text-white shadow-2xs font-bold' 
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        {amt}g
                                    </button>
                                ))}
                            </div>

                            <button 
                                onClick={handleManualFeedSubmit}
                                disabled={isDispensing}
                                className="w-full mt-2 py-2.5 bg-sky-900 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition-all duration-200 ease-out flex items-center justify-center gap-2 shadow-xs hover:shadow-md hover:shadow-sky-500/25 hover:-translate-y-0.5 active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                            >
                                {isDispensing ? (
                                    <>
                                        <RefreshCw size={14} className="animate-spin" />
                                        <span>Mengirim Sinyal IoT...</span>
                                    </>
                                ) : (
                                    <>
                                        <Wind size={15} />
                                        <span>Beri Pakan {manualAmount}g Sekarang</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Modal Tambah Jadwal Baru */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                            <Plus size={20} className="text-sky-700" /> Tambah Jadwal Pakan
                        </h3>
                        <p className="text-xs text-slate-500 mb-6 font-normal">
                            Masukkan parameter waktu dan dosis pakan pelet bioflok.
                        </p>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Waktu</label>
                                <select 
                                    value={timeOfDay} 
                                    onChange={(e) => setTimeOfDay(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-sky-600"
                                >
                                    <option value="Pagi">Pagi (Subuh / Sarapan)</option>
                                    <option value="Siang">Siang (Tengah Hari)</option>
                                    <option value="Sore">Sore (Menjelang Senja)</option>
                                    <option value="Malam">Malam (Pakan Tambahan)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Jam Semprot (Format HH:MM WITA)</label>
                                <input 
                                    type="time" 
                                    value={scheduledTime}
                                    onChange={(e) => setScheduledTime(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-sky-600"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Dosis Pelet (Gram)</label>
                                <input 
                                    type="number" 
                                    min="10"
                                    max="2000"
                                    value={targetAmount}
                                    onChange={(e) => setTargetAmount(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-sky-600 font-mono"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Pelet Pakan</label>
                                <input 
                                    type="text" 
                                    value={pelletType}
                                    onChange={(e) => setPelletType(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-sky-600"
                                />
                            </div>

                            <div className="flex gap-3 pt-3">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2.5 bg-sky-900 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition-all duration-200 ease-out cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:shadow-sky-500/25 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none shadow-xs flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <RefreshCw size={13} className="animate-spin" />
                                            <span>Menyimpan Jadwal...</span>
                                        </>
                                    ) : (
                                        <span>Simpan Jadwal</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Schedules;
