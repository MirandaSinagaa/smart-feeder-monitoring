import { useEffect, useRef, useState } from 'react';
import lottie from 'lottie-web/build/player/lottie_light.js';

const LoadingScreen = ({
    fullScreen = true,
    isDataReady = true,
    minLoops = 1,
    onComplete = null,
}) => {
    const containerRef = useRef(null);
    const animRef = useRef(null);
    const [animationData, setAnimationData] = useState(null);
    const [isAnimReady, setIsAnimReady] = useState(false);
    const [loopCount, setLoopCount] = useState(0);
    const [isFadingOut, setIsFadingOut] = useState(false);
    const [hasSafetyTimePassed, setHasSafetyTimePassed] = useState(false);

    // 1. Muat data Lottie School of Fish dari public folder
    useEffect(() => {
        let isMounted = true;

        const loadLottieData = async () => {
            try {
                const res = await fetch('/school-of-fish.json');
                if (!res.ok) throw new Error('File not found at /school-of-fish.json');
                const data = await res.json();
                if (isMounted) setAnimationData(data);
            } catch {
                try {
                    const fallbackRes = await fetch('/School of Fish.json');
                    const fallbackData = await fallbackRes.json();
                    if (isMounted) setAnimationData(fallbackData);
                } catch (fallbackErr) {
                    console.error('Gagal memuat animasi lottie School of Fish:', fallbackErr);
                }
            }
        };

        loadLottieData();

        return () => {
            isMounted = false;
        };
    }, []);

    // 2. Inisialisasi Lottie Web Player & Pasang Event Listeners
    useEffect(() => {
        if (!containerRef.current || !animationData) return;

        // Bersihkan instance sebelumnya bila ada
        if (animRef.current) {
            animRef.current.destroy();
        }

        try {
            const anim = lottie.loadAnimation({
                container: containerRef.current,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                animationData: animationData,
            });
            animRef.current = anim;

            // Pastikan animasi benar-benar sudah siap di-render di DOM sebelum ditampilkan
            anim.addEventListener('DOMLoaded', () => {
                setIsAnimReady(true);
            });

            // Deteksi setiap 1 siklus animasi selesai secara presisi
            anim.addEventListener('loopComplete', () => {
                setLoopCount(prev => prev + 1);
            });
        } catch (err) {
            console.error('Error saat me-render animasi lottie:', err);
            // Fallback agar tidak macet jika terjadi error render
            const fallbackTimer = setTimeout(() => {
                setIsAnimReady(true);
                setLoopCount(1);
            }, 0);
            return () => clearTimeout(fallbackTimer);
        }

        return () => {
            if (animRef.current) {
                animRef.current.destroy();
                animRef.current = null;
            }
        };
    }, [animationData]);

    // 3. Safety Fallback: 1 siklus loop School of Fish berdurasi ~2.0 detik (60 frame @ 29.97fps)
    useEffect(() => {
        const safetyTimer = setTimeout(() => {
            setHasSafetyTimePassed(true);
        }, minLoops * 2100);
        return () => clearTimeout(safetyTimer);
    }, [minLoops]);

    // 4. Syarat Keluar: Animasi sudah siap + Minimal 1x animasi full selesai + Data sensor siap
    useEffect(() => {
        const isMinLoopMet = loopCount >= minLoops || hasSafetyTimePassed;

        if (isAnimReady && isMinLoopMet && isDataReady && !isFadingOut) {
            const startFade = setTimeout(() => {
                setIsFadingOut(true);
            }, 0);
            const fadeTimer = setTimeout(() => {
                if (onComplete) {
                    onComplete();
                }
            }, 500); // Transisi fade-out halus 500ms
            return () => {
                clearTimeout(startFade);
                clearTimeout(fadeTimer);
            };
        }
    }, [isAnimReady, loopCount, minLoops, hasSafetyTimePassed, isDataReady, isFadingOut, onComplete]);

    const content = (
        <div className="flex flex-col items-center justify-center select-none">
            {/* Lottie Animation Container - Murni Animasi Ikan Tanpa Teks Apapun */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
                {/* Subtle Ambient Radial Highlight */}
                <div className="absolute inset-0 rounded-full bg-sky-500/10 dark:bg-sky-400/15 blur-3xl pointer-events-none transform scale-90" />

                {/* Wadah Render Animasi Lottie School of Fish (Hanya ditampilkan setelah DOMLoaded) */}
                <div
                    ref={containerRef}
                    className={`w-full h-full relative z-10 filter drop-shadow-sm transition-opacity duration-300 ease-out ${isAnimReady ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                        }`}
                    aria-label="Animasi School of Fish"
                />
            </div>
        </div>
    );

    if (!fullScreen) {
        return (
            <div className={`w-full py-12 flex items-center justify-center transition-opacity duration-500 ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}>
                {content}
            </div>
        );
    }

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-[#F8FAFC]/95 dark:bg-[#0B1120]/95 backdrop-blur-md transition-all duration-500 ease-out ${isFadingOut ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'
                }`}
        >
            {content}
        </div>
    );
};

export default LoadingScreen;
