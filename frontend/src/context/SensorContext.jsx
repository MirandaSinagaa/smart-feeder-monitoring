/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api';

export const SensorContext = createContext();
export const useSensor = () => useContext(SensorContext);

export const SensorProvider = ({ children }) => {
    const [sensorData, setSensorData] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [biomassData, setBiomassData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);

    const showToast = useCallback((message, type = 'success') => {
        setToastMessage({ message, type });
        setTimeout(() => setToastMessage(null), 4000);
    }, []);

    // Mengambil data sensor IoT dari Google Sheets via FastAPI
    const fetchSensorData = useCallback(async (forceRefresh = false) => {
        try {
            if (forceRefresh) setIsRefreshing(true);
            const res = await api.get(`/api/sensors${forceRefresh ? '?refresh=true' : ''}`);
            if (res.data && res.data.status === 'success') {
                setSensorData(res.data);
                setError(null);
            } else if (res.data && res.data.status === 'warning') {
                setSensorData(res.data);
                showToast(res.data.message || 'Menggunakan data cache terakhir', 'warning');
            }
        } catch (err) {
            console.error('Gagal mengambil data sensor:', err);
            setError(err.response?.data?.detail || err.message || 'Gagal terhubung ke backend FastAPI');
        } finally {
            setLoading(false);
            if (forceRefresh) setIsRefreshing(false);
        }
    }, [showToast]);

    // Mengambil jadwal pakan
    const fetchSchedules = useCallback(async () => {
        try {
            const res = await api.get('/api/schedules');
            if (res.data && res.data.status === 'success') {
                setSchedules(res.data.data);
            }
        } catch (err) {
            console.error('Gagal mengambil jadwal pakan:', err);
        }
    }, []);

    // Mengambil data biomassa
    const fetchBiomass = useCallback(async () => {
        try {
            const res = await api.get('/api/biomass');
            if (res.data && res.data.status === 'success') {
                setBiomassData(res.data.data);
            }
        } catch {
            // endpoint biomassa opsional
        }
    }, []);

    // Memperbarui estimasi biomassa kolam
    const updateBiomass = async (newBiomass) => {
        try {
            const res = await api.post('/api/biomass', newBiomass);
            if (res.data && res.data.status === 'success') {
                await fetchBiomass();
                showToast('Estimasi bobot biomassa berhasil diperbarui!');
                return true;
            }
        } catch (err) {
            console.error('Error updating biomass:', err);
            showToast('Gagal memperbarui biomassa', 'error');
            return false;
        }
    };

    // Toggle on/off jadwal pakan
    const toggleSchedule = async (scheduleId, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            await api.patch(`/api/schedules/${scheduleId}/toggle`, { is_active: newStatus });
            setSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, is_active: newStatus ? 1 : 0 } : s));
            showToast(`Jadwal pakan berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
        } catch (err) {
            console.error('Error toggling schedule:', err);
            showToast('Gagal mengubah status jadwal', 'error');
        }
    };

    // Tambah jadwal pakan baru
    const createSchedule = async (newSchedule) => {
        try {
            const res = await api.post('/api/schedules', newSchedule);
            if (res.data && res.data.status === 'success') {
                await fetchSchedules();
                showToast('Jadwal pakan baru berhasil ditambahkan!');
                return true;
            }
        } catch (err) {
            console.error('Error creating schedule:', err);
            showToast(err.response?.data?.detail || 'Gagal menambahkan jadwal', 'error');
            return false;
        }
    };

    // Hapus jadwal pakan
    const deleteSchedule = async (scheduleId) => {
        try {
            await api.delete(`/api/schedules/${scheduleId}`);
            setSchedules(prev => prev.filter(s => s.id !== scheduleId));
            showToast('Jadwal pakan berhasil dihapus');
        } catch (err) {
            console.error('Error deleting schedule:', err);
            showToast('Gagal menghapus jadwal', 'error');
        }
    };

    // Beri pakan manual (instruksi ke ESP32)
    const manualFeed = async (amountGram = 50) => {
        try {
            const res = await api.post('/api/feed/manual', { amount_gram: amountGram });
            if (res.data && res.data.status === 'success') {
                showToast(res.data.message || `Pakan manual (${amountGram}g) berhasil disemprotkan!`);
                return true;
            }
        } catch (err) {
            console.error('Error in manual feed:', err);
            showToast('Gagal memicu pakan manual', 'error');
            return false;
        }
    };

    // Ekspor CSV
    const exportCSV = () => {
        window.open('http://127.0.0.1:8000/api/export-csv', '_blank');
        showToast('Sedang mengunduh file log sensor CSV...', 'info');
    };

    // Fetch otomatis saat load pertama dan interval setiap 30 detik
    useEffect(() => {
        let isMounted = true;
        const loadInitialData = async () => {
            if (isMounted) {
                await fetchSensorData();
                await fetchSchedules();
                await fetchBiomass();
            }
        };
        loadInitialData();

        const interval = setInterval(() => {
            if (isMounted) {
                fetchSensorData(false);
            }
        }, 30000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [fetchSensorData, fetchSchedules, fetchBiomass]);

    return (
        <SensorContext.Provider value={{
            sensorData,
            schedules,
            biomassData,
            loading,
            isRefreshing,
            error,
            fetchSensorData,
            fetchSchedules,
            fetchBiomass,
            updateBiomass,
            toggleSchedule,
            createSchedule,
            deleteSchedule,
            manualFeed,
            exportCSV,
            showToast
        }}>
            {children}
            {toastMessage && (
                <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-semibold transition-all duration-300 ${
                    toastMessage.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                    toastMessage.type === 'warning' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    toastMessage.type === 'info' ? 'bg-sky-50 text-sky-800 border-sky-200' :
                    'bg-slate-900 text-white border-slate-800'
                }`}>
                    <span className={`w-2 h-2 rounded-full ${
                        toastMessage.type === 'error' ? 'bg-rose-500' :
                        toastMessage.type === 'warning' ? 'bg-amber-500' :
                        toastMessage.type === 'info' ? 'bg-sky-500' :
                        'bg-emerald-400'
                    }`}></span>
                    <span>{toastMessage.message}</span>
                </div>
            )}
        </SensorContext.Provider>
    );
};

export default SensorContext;
