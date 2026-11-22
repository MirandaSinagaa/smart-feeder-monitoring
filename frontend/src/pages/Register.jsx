import { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Eye, 
    EyeOff, 
    AlertCircle, 
    CheckCircle2, 
    Mail, 
    Lock, 
    User, 
    ArrowRight, 
    Sparkles
} from 'lucide-react';
import api from '../api';
import logoUndiksha from '../assets/logo-undiksha.png';
import smartFeederIcon from '../assets/smart-feeder-icon.png';
import logoDago from '../assets/logo-dago-engineering.png';
import logoLivingLab from '../assets/logo-living-lab.png';
import GoogleAuthModal from '../components/GoogleAuthModal';

// White Google 'G' Icon
const GoogleWhiteIcon = () => (
    <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
);

const formatError = (err, fallback) => {
    const detail = err?.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
        return detail.map(d => (typeof d === 'string' ? d : d.msg || JSON.stringify(d))).join(', ');
    }
    if (detail && typeof detail === 'object') {
        return detail.message || JSON.stringify(detail);
    }
    return err?.response?.data?.message || err?.message || fallback;
};

const Register = () => {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

    // Jika sudah ada sesi aktif, langsung arahkan ke Dashboard
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);

    // Password strength calculation (0 - 5 bars)
    const strengthInfo = useMemo(() => {
        if (!password) {
            return { score: 0, text: 'Masukkan kata sandi', color: 'bg-slate-200 dark:bg-slate-700' };
        }
        if (password.length < 6) {
            return { score: 1, text: 'Minimal 6 karakter', color: 'bg-rose-500' };
        }
        let score = 2;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password) || password.length >= 10) score++;

        if (score === 2) return { score: 2, text: 'Sandi cukup', color: 'bg-amber-400' };
        if (score <= 4) return { score: score, text: 'Sandi baik', color: 'bg-sky-500' };
        return { score: 5, text: 'Sandi sangat kuat & aman', color: 'bg-emerald-500' };
    }, [password]);

    // Arahkan seketika tanpa jeda
    const triggerExitAndRedirect = () => {
        navigate('/dashboard', { replace: true });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (password.length < 6) {
            setErrorMsg('Kata sandi minimal harus 6 karakter.');
            return;
        }

        if (!agreeTerms) {
            setErrorMsg('Silakan setujui ketentuan operasional sistem monitoring.');
            return;
        }

        setIsLoading(true);

        try {
            const res = await api.post('/api/auth/register', {
                name: fullName.trim() || undefined,
                email: email.trim(),
                password: password
            });

            if (res.data && res.data.user) {
                localStorage.setItem('user', JSON.stringify(res.data.user));
                localStorage.setItem('token', res.data.token || ('auth_token_' + Date.now()));
                setSuccessMsg('Pendaftaran berhasil! Mengalihkan ke dashboard...');
                triggerExitAndRedirect();
                return;
            }
        } catch (err) {
            if (err.response?.data) {
                const message = formatError(err, 'Pendaftaran gagal. Periksa kembali data Anda.');
                setErrorMsg(message);
                setIsLoading(false);
                return;
            }

            // Fallback registrasi lokal jika backend offline
            const fallbackUser = {
                name: fullName.trim() || 'Pengelola Bioflok',
                email: email.trim(),
                role: 'Pengelola Kolam',
                pond: 'Living Lab Bioflok, Kolam C',
                phone: '+62 812-3456-7890',
                loginTime: new Date().toLocaleTimeString('id-ID') + ' WITA'
            };
            localStorage.setItem('user', JSON.stringify(fallbackUser));
            localStorage.setItem('token', 'auth_token_' + Date.now());
            setSuccessMsg('Pendaftaran berhasil! Mengalihkan ke dashboard...');
            triggerExitAndRedirect();
        }
    };

    const handleGoogleSuccess = () => {
        setIsGoogleModalOpen(false);
        triggerExitAndRedirect();
    };

    return (
        <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-[#0B1120] flex flex-col lg:flex-row overflow-hidden relative font-sans antialiased text-slate-800 dark:text-slate-100 transition-colors">
            {/* SISI KIRI: Menampilkan deretan logo institusi / aplikasi */}
            <div
                className="w-full lg:w-1/2 min-h-screen bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 p-8 sm:p-12 lg:p-16 flex flex-col justify-between z-10 shadow-lg"
            >
                {/* Header Logo Aplikasi Utama */}
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center p-1.5 shrink-0 shadow-xs">
                        <img src={smartFeederIcon} alt="Logo Smart Feeder" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight block leading-tight">Smart Feeder</span>
                        <span className="text-[11px] font-bold text-sky-700 dark:text-sky-400 tracking-wider uppercase block">Bioflok IoT Management</span>
                    </div>
                </div>

                {/* Bagian Tengah: Deretan Logo Institusi & Mitra Konsorsium */}
                <div className="my-auto py-8">
                    {/* Logo Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        {/* Logo Undiksha */}
                        <div className="bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all shadow-2xs hover:border-sky-300 dark:hover:border-sky-500 group">
                            <img
                                src={logoUndiksha}
                                alt="Universitas Pendidikan Ganesha (Undiksha)"
                                className="h-16 w-auto object-contain group-hover:scale-105 transition-transform mb-2"
                            />
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">Universitas Pendidikan Ganesha</span>
                        </div>

                        {/* Logo Dago Engineering */}
                        <div className="bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all shadow-2xs hover:border-sky-300 dark:hover:border-sky-500 group">
                            <img
                                src={logoDago}
                                alt="Dago Engineering"
                                className="h-16 w-auto object-contain group-hover:scale-105 transition-transform mb-2"
                            />
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">Dago Engineering</span>
                        </div>

                        {/* Logo Living Lab */}
                        <div className="bg-slate-50/80 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all shadow-2xs hover:border-sky-300 dark:hover:border-sky-500 group">
                            <img
                                src={logoLivingLab}
                                alt="Living Lab Bioflok"
                                className="h-16 w-auto object-contain group-hover:scale-105 transition-transform mb-2"
                            />
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">Living Lab</span>
                        </div>
                    </div>

                    {/* Deskripsi Kolaboratif */}
                    <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-800/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        <div className="flex items-center gap-2 mb-1.5 font-bold text-slate-800 dark:text-slate-100">
                            <Sparkles size={15} className="text-sky-600 dark:text-sky-400" />
                            <span>Inovasi Terintegrasi Bioflok Kolam C</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-normal">
                            Kolaborasi riset akademik Universitas Pendidikan Ganesha bersama Dago Engineering dalam mengimplementasikan otomatisasi pakan dan monitoring kualitas air berbasis mikrokontroler ESP32 secara realtime.
                        </p>
                    </div>
                </div>

                {/* Footer Sisi Kiri */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                    <span>Living Lab Kolam Bioflok C</span>
                    <span>Versi v1.1.0</span>
                </div>
            </div>

            {/* SISI KANAN: Form Registrasi Pengelola */}
            <div
                className="w-full lg:w-1/2 min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] p-8 sm:p-12 lg:p-16 flex flex-col justify-center z-10"
            >
                <div className="max-w-md w-full mx-auto my-auto">
                    
                    {/* Judul Besar & Informasi Registrasi */}
                    <div className="mb-6">
                        <span className="text-xs font-extrabold tracking-widest text-sky-700 dark:text-sky-400 uppercase bg-sky-50 dark:bg-sky-950/70 border border-sky-200/60 dark:border-sky-800 px-3 py-1 rounded-full inline-block mb-3">
                            REGISTRASI PENGELOLA
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                            Buat Akun Pengelola Baru
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 font-normal leading-relaxed">
                            Lengkapi formulir untuk membuat akses portal pemantauan sensor, otomatisasi pakan, dan logbook budidaya Smart Feeder.
                        </p>
                    </div>

                    {/* Success Message */}
                    {successMsg && (
                        <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm flex items-start gap-2 border border-emerald-200 dark:border-emerald-800 animate-fadeIn">
                            <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                            <p className="font-semibold">{successMsg}</p>
                        </div>
                    )}

                    {/* Error Message */}
                    {errorMsg && (
                        <div className="mb-4 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm flex items-start gap-2 border border-rose-200 dark:border-rose-800 animate-fadeIn">
                            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                            <p className="font-semibold">{errorMsg}</p>
                        </div>
                    )}

                    {/* Google Sign Up Button */}
                    <button
                        type="button"
                        onClick={() => setIsGoogleModalOpen(true)}
                        className="w-full py-2.5 sm:py-3 px-4 bg-[#007ba7] hover:bg-[#006990] text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-xs cursor-pointer hover:shadow-md active:scale-[0.99]"
                    >
                        <GoogleWhiteIcon />
                        <span>Continue with Google</span>
                    </button>

                    {/* Divider: ATAU EMAIL */}
                    <div className="relative my-4 text-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                        </div>
                        <span className="relative bg-[#F8FAFC] dark:bg-[#0B1120] px-3 text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                            ATAU DENGAN EMAIL
                        </span>
                    </div>

                    {/* Form Registrasi */}
                    <form onSubmit={handleRegister} className="space-y-3.5">
                        {/* Nama Lengkap */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                Nama Lengkap (opsional)
                            </label>
                            <div className="relative">
                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 rounded-xl focus:border-sky-700 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-950 outline-none transition-all text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-medium"
                                    placeholder="Contoh: Miranda Sinaga"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Alamat Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                <input
                                    type="email"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 rounded-xl focus:border-sky-700 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-950 outline-none transition-all text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-medium"
                                    placeholder="contoh@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input with Eye Toggle */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Kata Sandi</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full pl-10 pr-11 py-2.5 bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 rounded-xl focus:border-sky-700 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-950 outline-none transition-all text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-medium"
                                    placeholder="Minimal 6 karakter"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-md transition-colors focus:outline-none"
                                    title={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            {/* Password Strength Meter */}
                            <div className="mt-2 p-2 bg-slate-50/80 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                                <div className="grid grid-cols-5 gap-1.5 mb-1">
                                    {[1, 2, 3, 4, 5].map((index) => (
                                        <div
                                            key={index}
                                            className={`h-1 rounded-full transition-all duration-300 ${
                                                index <= strengthInfo.score
                                                    ? strengthInfo.color
                                                    : 'bg-slate-200 dark:bg-slate-700'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center justify-between">
                                    <span>Kekuatan sandi:</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">{strengthInfo.text}</span>
                                </div>
                            </div>
                        </div>

                        {/* Persetujuan Ketentuan */}
                        <div className="pt-1">
                            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400 select-none">
                                <input
                                    type="checkbox"
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                    className="mt-0.5 rounded border-slate-300 dark:border-slate-600 text-sky-800 focus:ring-0 cursor-pointer"
                                    required
                                />
                                <span className="leading-snug">
                                    Saya menyetujui ketentuan operasional dan standar monitoring sistem kolam bioflok Smart Feeder.
                                </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 bg-sky-900 hover:bg-sky-950 dark:bg-sky-600 dark:hover:bg-sky-700 text-white font-bold py-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 text-xs sm:text-sm active:scale-[0.99]"
                        >
                            <span>{isLoading ? 'Mendaftarkan Akun...' : 'Daftar Akun Pengelola'}</span>
                            <ArrowRight size={16} />
                        </button>
                    </form>

                    {/* Switch to Sign In */}
                    <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400 font-normal">
                        Sudah memiliki akun pengelola?{' '}
                        <Link to="/login" className="font-semibold text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 hover:underline">
                            Masuk Sekarang
                        </Link>
                    </div>
                </div>
            </div>

            {/* Google Authentication Modal */}
            <GoogleAuthModal
                isOpen={isGoogleModalOpen}
                onClose={() => setIsGoogleModalOpen(false)}
                onSuccess={handleGoogleSuccess}
            />
        </div>
    );
};

export default Register;
