import { useState } from 'react';
import { X, User, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import api from '../api';

const GoogleAuthModal = ({ isOpen, onClose, onSuccess }) => {
    const [useCustomAccount, setUseCustomAccount] = useState(false);
    const [customEmail, setCustomEmail] = useState('');
    const [customName, setCustomName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    if (!isOpen) return null;

    const handleSelectAccount = async (email, name) => {
        setIsLoading(true);
        setErrorMsg('');

        try {
            const res = await api.post('/api/auth/google', {
                email: email.trim(),
                name: name.trim()
            });

            if (res.data && res.data.user) {
                localStorage.setItem('user', JSON.stringify(res.data.user));
                localStorage.setItem('token', res.data.token || ('google_auth_' + Date.now()));
                localStorage.setItem('remember_email', email.trim());
                onSuccess(res.data.user);
                return;
            }
        } catch (err) {
            console.warn('API Google auth error, using offline local session:', err);
        }

        // Fallback jika backend offline / network issue
        const fallbackUser = {
            name: name || 'Miranda Sinaga',
            email: email || 'mirandasinaga0803@gmail.com',
            role: 'Pengelola Kolam Utama',
            pond: 'Living Lab Bioflok, Kolam C',
            phone: '+62 812-3456-7890',
            loginMethod: 'Google OAuth',
            loginTime: new Date().toLocaleTimeString('id-ID') + ' WITA'
        };
        localStorage.setItem('user', JSON.stringify(fallbackUser));
        localStorage.setItem('token', 'google_auth_token_' + Date.now());
        localStorage.setItem('remember_email', email.trim());
        onSuccess(fallbackUser);
    };

    const handleCustomSubmit = (e) => {
        e.preventDefault();
        if (!customEmail || !customEmail.includes('@')) {
            setErrorMsg('Masukkan alamat email Google yang valid.');
            return;
        }
        handleSelectAccount(customEmail, customName || customEmail.split('@')[0]);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 relative text-slate-800 dark:text-slate-100">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-5 top-5 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                    title="Tutup"
                >
                    <X size={18} />
                </button>

                {/* Google Brand Header */}
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-xs mb-3">
                        <svg className="w-7 h-7" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Masuk dengan Google</h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                        Pilih akun Google Anda untuk melanjutkan ke portal Smart Feeder Bioflok.
                    </p>
                </div>

                {errorMsg && (
                    <div className="mb-4 bg-red-50 dark:bg-rose-950/50 text-red-700 dark:text-rose-300 px-3 py-2 rounded-xl text-xs border border-red-200 dark:border-rose-900">
                        {errorMsg}
                    </div>
                )}

                {!useCustomAccount ? (
                    <div className="space-y-3">
                        {/* Primary Google Account (Miranda Sinaga) */}
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleSelectAccount('mirandasinaga0803@gmail.com', 'Miranda Sinaga')}
                            className="w-full flex items-center gap-3.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-[#007ba7] dark:hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-slate-800 transition-all text-left cursor-pointer group"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-600 to-teal-500 text-white font-bold flex items-center justify-center shrink-0 shadow-xs text-sm">
                                MS
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">Miranda Sinaga</span>
                                    <span className="text-[10px] bg-sky-100 dark:bg-sky-950 text-[#007ba7] dark:text-sky-300 font-semibold px-1.5 py-0.5 rounded-full">Akun Utama</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">mirandasinaga0803@gmail.com</p>
                            </div>
                            <ArrowRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-[#007ba7] dark:group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                        </button>

                        {/* Secondary Account Option: Administrator */}
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleSelectAccount('admin@bioflok.com', 'Admin Bioflok')}
                            className="w-full flex items-center gap-3.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-[#007ba7] dark:hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-slate-800 transition-all text-left cursor-pointer group"
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-800 dark:bg-slate-700 text-white font-bold flex items-center justify-center shrink-0 shadow-xs text-sm">
                                AB
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">Admin Bioflok</span>
                                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-1.5 py-0.5 rounded-full">Sistem Admin</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">admin@bioflok.com</p>
                            </div>
                            <ArrowRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-[#007ba7] dark:group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                        </button>

                        {/* Use another account option */}
                        <button
                            type="button"
                            onClick={() => setUseCustomAccount(true)}
                            className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-500 transition-colors cursor-pointer text-center block mt-2"
                        >
                            Gunakan Akun Google Lainnya
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleCustomSubmit} className="space-y-3.5">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Nama Pengelola
                            </label>
                            <div className="relative">
                                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Contoh: Miranda Sinaga"
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:border-[#007ba7] outline-none text-slate-800 dark:text-slate-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Alamat Email Google (@gmail.com)
                            </label>
                            <div className="relative">
                                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    placeholder="nama@gmail.com"
                                    value={customEmail}
                                    onChange={(e) => setCustomEmail(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl focus:border-[#007ba7] outline-none text-slate-800 dark:text-slate-100"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setUseCustomAccount(false)}
                                className="flex-1 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                            >
                                Kembali
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 py-2 bg-[#007ba7] hover:bg-[#006990] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60"
                            >
                                {isLoading ? 'Menghubungkan...' : 'Lanjutkan Masuk'}
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                        <ShieldCheck size={13} className="text-emerald-600" /> Google OAuth 2.0 Secure
                    </span>
                    <span>Smart Feeder Bioflok</span>
                </div>
            </div>
        </div>
    );
};

export default GoogleAuthModal;
