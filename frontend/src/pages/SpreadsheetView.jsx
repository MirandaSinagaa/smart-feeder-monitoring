import { useState } from 'react';
import { 
    ExternalLink, 
    RefreshCw, 
    Maximize2, 
    Minimize2, 
    Copy, 
    Check, 
    Info 
} from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';

const LOGBOOK_SHEET = {
    id: "1-5Twlt3EUlWii5_3bXzSlF7qPSkBSQ2_FRHkLLkGdEg",
    gid: "1129568060",
    name: "Logbook Budidaya Ikan Nila",
    subtitle: "Rekap jadwal pakan, checklist harian, sampling bobot & perawatan kolam bioflok • Kolam C (GID: 1129568060)"
};

const BOT_EMAIL = "feeder-bot@smartfeeder-api.iam.gserviceaccount.com";

const SpreadsheetView = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [iframeKey, setIframeKey] = useState(0);
    const [copied, setCopied] = useState(false);
    const [showGuide, setShowGuide] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    const DIRECT_URL = `https://docs.google.com/spreadsheets/d/${LOGBOOK_SHEET.id}/edit?gid=${LOGBOOK_SHEET.gid}#gid=${LOGBOOK_SHEET.gid}`;
    const EMBED_URL = `https://docs.google.com/spreadsheets/d/${LOGBOOK_SHEET.id}/edit?gid=${LOGBOOK_SHEET.gid}&embedded=true`;

    const handleRefresh = () => {
        setIsLoading(true);
        setIframeKey(prev => prev + 1);
    };

    const handleCopyBotEmail = () => {
        navigator.clipboard.writeText(BOT_EMAIL);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <div className={`space-y-5 transition-all max-w-7xl mx-auto ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900 p-4 sm:p-6 overflow-hidden flex flex-col' : ''}`}>
            
            {/* Hero Banner Card - Vibe Elegan, Kalem & Senada dengan Tampilan Login */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs transition-all shrink-0 animate-card-slideup">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5 mb-2.5">
                            <span className="text-[10px] sm:text-xs font-extrabold tracking-widest text-sky-700 dark:text-sky-400 uppercase bg-sky-50 dark:bg-sky-950/70 border border-sky-200/60 dark:border-sky-800 px-3 py-1 rounded-full inline-block">
                                GOOGLE SHEETS LIVE SYNC
                            </span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                Living Lab Bioflok C
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                            {LOGBOOK_SHEET.name}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-2xl font-normal leading-relaxed truncate">
                            {LOGBOOK_SHEET.subtitle}
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-stretch sm:self-auto justify-end">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRefresh();
                            }}
                            className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-semibold transition-all shadow-2xs flex items-center gap-2 cursor-pointer active:scale-[0.99]"
                            title="Muat ulang lembar spreadsheet"
                        >
                            <RefreshCw size={13} className={`${isLoading ? 'animate-spin' : ''}`} />
                            <span>Segarkan</span>
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsFullscreen(!isFullscreen);
                            }}
                            className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-semibold transition-all shadow-2xs flex items-center gap-2 cursor-pointer active:scale-[0.99]"
                            title={isFullscreen ? "Keluar Layar Penuh" : "Tampilan Layar Penuh"}
                        >
                            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                            <span className="hidden sm:inline">{isFullscreen ? 'Normal' : 'Fullscreen'}</span>
                        </button>

                        <button
                            onClick={() => window.open(DIRECT_URL, '_blank')}
                            className="px-4 py-2.5 bg-[#007ba7] hover:bg-[#006990] text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-[0.99] whitespace-nowrap"
                            title="Buka Spreadsheet di Tab Baru"
                        >
                            <span>Buka di Google Sheets</span>
                            <ExternalLink size={13} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Panduan Akses & Sinkronisasi Bot */}
            {showGuide && !isFullscreen && (
                <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-4 sm:p-5 text-xs text-slate-700 relative">
                    <button
                        onClick={() => setShowGuide(false)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 text-sm font-bold p-1 cursor-pointer"
                        title="Sembunyikan panduan"
                    >
                        ✕
                    </button>
                    <div className="flex items-start gap-3">
                        <Info size={18} className="text-sky-700 shrink-0 mt-0.5" />
                        <div className="space-y-1.5 pr-6">
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Panduan Akses Lembar Logbook Budidaya:</h4>
                            <p className="text-slate-500 leading-relaxed font-normal">
                                1. Jika lembar kerja di bawah meminta login, Anda dapat melihatnya langsung saat login akun Google atau memastikan akses berbagi di Google Sheets disetel ke <strong className="text-slate-800">"Siapa saja yang memiliki link dapat melihat"</strong> (Anyone with the link can view).
                            </p>
                            <p className="text-slate-500 leading-relaxed font-normal">
                                2. Untuk integrasi pencatatan logbook otomatis ke backend FastAPI, bagikan (Share) spreadsheet ini ke email Service Account berikut:
                            </p>
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                <code className="bg-white border border-slate-200 text-sky-900 font-mono text-[11px] px-2.5 py-1 rounded-lg font-semibold select-all">
                                    {BOT_EMAIL}
                                </code>
                                <button
                                    onClick={handleCopyBotEmail}
                                    className="px-2.5 py-1 bg-white hover:bg-slate-50 text-sky-800 border border-slate-200 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                                >
                                    {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                    <span>{copied ? 'Tersalin!' : 'Salin Email Bot'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Kontainer Iframe Spreadsheet */}
            <div className={`bg-white rounded-2xl border border-slate-200/70 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] overflow-hidden relative ${isFullscreen ? 'flex-1 min-h-0' : 'h-[calc(100vh-250px)] min-h-[580px]'}`}>
                {/* Indikator Loading Menggunakan Lottie School of Fish Murni */}
                {isLoading && (
                    <div className="absolute inset-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xs flex items-center justify-center z-10">
                        <LoadingScreen fullScreen={false} />
                    </div>
                )}

                <iframe
                    key={iframeKey}
                    src={EMBED_URL}
                    title="Logbook Budidaya Ikan Nila Google Sheets"
                    className="w-full h-full border-0"
                    onLoad={() => setIsLoading(false)}
                    allow="clipboard-read; clipboard-write"
                />
            </div>
        </div>
    );
};

export default SpreadsheetView;
