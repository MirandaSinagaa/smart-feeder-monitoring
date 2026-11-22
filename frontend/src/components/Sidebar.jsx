import { LayoutDashboard, Activity, BookOpen, Clock, Settings, ChevronLeft, ChevronRight, LogOut, Waves, User } from 'lucide-react';
import smartFeederIcon from '../assets/smart-feeder-icon.png';
import logoUndiksha from '../assets/logo-undiksha.png';
import logoDago from '../assets/logo-dago-engineering.png';
import logoLivingLab from '../assets/logo-living-lab.png';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSensor } from '../context/SensorContext';

const Sidebar = ({ isOpen, toggleSidebar, onLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { sensorData, biomassData } = useSensor();
    const fishCount = biomassData?.fish_count || sensorData?.status_overview?.fish_count || 84;

    const userStr = localStorage.getItem('user');
    const userObj = userStr ? JSON.parse(userStr) : null;
    const userName = userObj?.name || 'Miranda Sinaga';
    const userRole = userObj?.role || 'Pengelola Kolam';

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    // Struktur Navigasi Baru Sesuai Desain Referensi
    const workspaceItems = [
        {
            title: "Dashboard",
            icon: LayoutDashboard,
            path: "/dashboard",
            isActive: (pathname) => pathname === '/dashboard' || pathname === '/'
        },
        {
            title: "Monitoring",
            icon: Activity,
            path: "/monitoring",
            isActive: (pathname) => pathname === '/monitoring' || pathname === '/water-quality' || pathname === '/analytics'
        },
        {
            title: "Pencatatan Data",
            icon: BookOpen,
            path: "/cultivation",
            isActive: (pathname) => pathname.startsWith('/cultivation') || pathname.startsWith('/pencatatan-data') || pathname === '/spreadsheet'
        },
        {
            title: "Riwayat",
            icon: Clock,
            path: "/logs",
            isActive: (pathname) => pathname === '/logs' || pathname === '/riwayat'
        }
    ];

    const settingItems = [
        {
            title: "Pengaturan",
            icon: Settings,
            path: "/settings",
            isActive: (pathname) => pathname === '/settings' || pathname === '/pengaturan' || pathname === '/profile'
        }
    ];

    const handleNavClick = (path) => {
        navigate(path);
    };

    return (
        <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col h-screen sticky top-0 transition-all duration-300 relative group z-50 select-none shadow-[1px_0_3px_0_rgba(15,23,42,0.02)] dark:shadow-none overflow-visible shrink-0`}>

            {/* Toggle Sidebar Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    toggleSidebar();
                }}
                className="absolute -right-3.5 top-5 w-7 h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-sky-900 dark:hover:text-sky-300 hover:border-sky-300 hover:bg-sky-50/60 dark:hover:bg-slate-700 rounded-full shadow-xs hover:shadow-sm z-50 transition-all flex items-center justify-center cursor-pointer focus:outline-none ring-2 ring-white dark:ring-slate-900"
                title={isOpen ? "Ciutkan Sidebar" : "Perluas Sidebar"}
                aria-label={isOpen ? "Ciutkan Sidebar" : "Perluas Sidebar"}
            >
                {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>

            {/* Sidebar Content */}
            <div className="flex flex-col h-full overflow-x-hidden">
                {/* Header: Logo & Unit Smart Feeder */}
                <div className="px-4 pt-4 pb-2 shrink-0">
                    <div
                        onClick={() => navigate('/dashboard')}
                        className={`flex items-center gap-3 mb-4 font-bold ${isOpen ? 'justify-start px-1' : 'justify-center'} mt-1 cursor-pointer group`}
                        title="Smart Feeder Bioflok IoT"
                    >
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center p-1.5 shrink-0 shadow-2xs group-hover:border-sky-300 group-hover:bg-sky-50/40 transition-all">
                            <img src={smartFeederIcon} alt="Logo Smart Feeder" className="w-full h-full object-contain" />
                        </div>
                        {isOpen && (
                            <div className="leading-tight overflow-hidden whitespace-nowrap">
                                <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight block">Smart Feeder</span>
                                <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider block">Data Management</span>
                            </div>
                        )}
                    </div>

                    {/* Target Unit Kolam */}
                    <div className="mb-3 overflow-hidden">
                        {isOpen && (
                            <div className="flex items-center justify-between px-1 mb-1.5">
                                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Target Unit</label>
                                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800">Online</span>
                            </div>
                        )}
                        <div className={`border border-slate-200/70 dark:border-slate-700/80 rounded-xl p-2.5 flex items-center bg-slate-50/60 dark:bg-slate-800/40 shadow-2xs cursor-default ${isOpen ? 'justify-between' : 'justify-center'}`}>
                            {isOpen ? (
                                <>
                                    <div className="min-w-0">
                                        <div className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate flex items-center gap-1.5">
                                            <Waves size={13} className="text-sky-600 dark:text-sky-400 shrink-0" />
                                            Kolam Bioflok C
                                        </div>
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">Nila • {fishCount} Ekor</div>
                                    </div>
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 ring-4 ring-emerald-100 dark:ring-emerald-950"></span>
                                </>
                            ) : (
                                <div className="font-bold text-sky-900 dark:text-sky-300 text-xs text-center" title="Kolam Bioflok C">K.C</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigasi Link Menu Terkelompok: Workspace & Settings */}
                <div className="flex-1 min-h-0 px-3 py-1 flex flex-col justify-start overflow-y-auto sidebar-scroll">

                    {/* BAGIAN 1: WORKSPACE */}
                    <div className="mb-3">
                        {isOpen ? (
                            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1.5 block uppercase tracking-wider px-2 shrink-0">
                                Workspace
                            </label>
                        ) : (
                            <div className="h-2"></div>
                        )}
                        <nav className="flex flex-col gap-1 pr-0.5">
                            {workspaceItems.map((item, index) => {
                                const Icon = item.icon;
                                const isActive = item.isActive(location.pathname);

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleNavClick(item.path)}
                                        className={`flex items-center ${isOpen ? 'gap-3 justify-start px-3' : 'justify-center p-2.5'} w-full text-left py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-150 cursor-pointer shrink-0 ${isActive
                                            ? 'bg-sky-50/90 dark:bg-sky-950/70 text-sky-950 dark:text-sky-300 font-semibold border border-sky-200/80 dark:border-sky-800 shadow-2xs'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-medium'
                                            }`}
                                        title={item.title}
                                    >
                                        <Icon size={17} className={`shrink-0 ${isActive ? 'text-sky-700 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`} />
                                        {isOpen && <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.title}</span>}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="h-px bg-slate-200/60 dark:bg-slate-800 my-1 mx-2"></div>

                    {/* BAGIAN 2: SETTINGS */}
                    <div className="mt-2">
                        {isOpen ? (
                            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1.5 block uppercase tracking-wider px-2 shrink-0">
                                Setting
                            </label>
                        ) : (
                            <div className="h-2"></div>
                        )}
                        <nav className="flex flex-col gap-1 pr-0.5">
                            {settingItems.map((item, index) => {
                                const Icon = item.icon;
                                const isActive = item.isActive(location.pathname);

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleNavClick(item.path)}
                                        className={`flex items-center ${isOpen ? 'gap-3 justify-start px-3' : 'justify-center p-2.5'} w-full text-left py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-150 cursor-pointer shrink-0 ${isActive
                                            ? 'bg-sky-50/90 dark:bg-sky-950/70 text-sky-950 dark:text-sky-300 font-semibold border border-sky-200/80 dark:border-sky-800 shadow-2xs'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100 font-medium'
                                            }`}
                                        title={item.title}
                                    >
                                        <Icon size={17} className={`shrink-0 ${isActive ? 'text-sky-700 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'}`} />
                                        {isOpen && <span className="whitespace-nowrap overflow-hidden text-ellipsis">{item.title}</span>}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                </div>

                {/* Footer: Profil Pengguna Kecil di Bawah & Logout Button */}
                <div className="mt-auto px-3.5 py-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">

                    {/* Profil Pengguna Kecil di bagian paling bawah sidebar */}
                    {isOpen ? (
                        <div
                            onClick={() => navigate('/settings')}
                            className="mb-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2.5 cursor-pointer hover:border-sky-300 dark:hover:border-sky-600 hover:bg-slate-100/60 dark:hover:bg-slate-800 transition-all group"
                            title="Profil Pengelola Akun"
                        >
                            <div className="w-7 h-7 rounded-lg bg-sky-900 dark:bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                                <User size={13} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-sky-700 dark:group-hover:text-sky-400 leading-tight">
                                    {userName}
                                </span>
                                <span className="block text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                                    {userRole}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div
                            onClick={() => navigate('/settings')}
                            className="flex justify-center mb-2.5 cursor-pointer"
                            title={`${userName} (${userRole})`}
                        >
                            <div className="w-8 h-8 rounded-lg bg-sky-900 dark:bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs hover:scale-105 transition-transform">
                                <User size={14} />
                            </div>
                        </div>
                    )}

                    {/* Mitra Konsorsium Logos */}
                    {isOpen && (
                        <div className="mb-2.5 p-1.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                            <div className="flex items-center justify-center gap-2">
                                <img src={logoUndiksha} alt="Undiksha" className="h-4.5 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" title="Undiksha" />
                                <div className="h-3 w-px bg-slate-200 dark:bg-slate-700"></div>
                                <img src={logoDago} alt="Dago Engineering" className="h-4.5 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" title="Dago Engineering" />
                                <div className="h-3 w-px bg-slate-200 dark:bg-slate-700"></div>
                                <img src={logoLivingLab} alt="Living Lab" className="h-4.5 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity" title="Living Lab" />
                            </div>
                        </div>
                    )}

                    {/* Tombol Keluar dari Sistem */}
                    {isOpen ? (
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50/70 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                        >
                            <LogOut size={14} />
                            <span>Keluar dari Sistem</span>
                        </button>
                    ) : (
                        <div className="flex justify-center py-1">
                            <button
                                onClick={handleLogout}
                                className="p-2 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                                title="Keluar (Logout)"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
