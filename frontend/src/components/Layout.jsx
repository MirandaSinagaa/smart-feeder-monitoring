import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSensor } from '../context/useSensor';
import LoadingScreen from './LoadingScreen';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { loading } = useSensor();
    const [showLoadingScreen, setShowLoadingScreen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleLogout = () => {
        setIsLoggingOut(true);
        sessionStorage.setItem('closingSplitDoors', 'true');
        setTimeout(() => {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            navigate('/login', { replace: true });
        }, 650);
    };

    return (
        <div className={`flex min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] font-sans text-slate-800 dark:text-slate-100 transition-all duration-700 ease-in-out ${
            isLoggingOut ? 'scale-[0.96] opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        }`}>
            {/* 
              Loading Screen Lottie School of Fish:
              - Animasi dipastikan siap (DOMLoaded) sebelum ditampilkan.
              - Minimal 1x siklus animasi penuh selesai (loopComplete >= 1) DAN data sensor siap (!loading)
                sebelum melakukan fade-out transisi masuk ke beranda.
            */}
            {showLoadingScreen && (
                <LoadingScreen
                    fullScreen={true}
                    isDataReady={!loading}
                    minLoops={1}
                    onComplete={() => setShowLoadingScreen(false)}
                />
            )}

            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} onLogout={handleLogout} />
            <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
                <Header />
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div key={location.pathname} className="animate-page-enter">
                        <Outlet /> 
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
