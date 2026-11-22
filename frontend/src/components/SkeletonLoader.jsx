// Precision Hardware Telemetry: Theme-Aware Zero-CLS Skeleton Loader

export const SkeletonBox = ({ className = "", style = {} }) => (
    <div 
        className={`animate-shimmer-theme rounded-md ${className}`} 
        style={style}
    />
);

// 1. Zero-CLS Skeleton untuk 4 Kartu Metrik Sensor Utama (DO, pH, Suhu, Amonia)
// Dimensi 100% presisi mencerminkan struktur kartu sensor asli
export const KpiCardSkeleton = () => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
            {[1, 2, 3, 4].map((item) => (
                <div 
                    key={item}
                    className="bg-white dark:bg-neutral-900/90 rounded-2xl border border-neutral-200/80 dark:border-white/[0.07] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between min-h-[178px]"
                >
                    <div>
                        {/* Header Badge Sensor & Status Pill */}
                        <div className="flex justify-between items-center mb-3.5">
                            <SkeletonBox className="h-5 w-24 rounded border border-transparent" />
                            <SkeletonBox className="h-5 w-16 rounded-full" />
                        </div>

                        {/* Icon Container (32x32) & Judul Sensor */}
                        <div className="flex items-center gap-2.5 mb-1">
                            <SkeletonBox className="w-8 h-8 rounded-lg shrink-0" />
                            <SkeletonBox className="h-4.5 w-36 rounded" />
                        </div>

                        {/* Subtitle Ambang Batas */}
                        <div className="pl-10.5 mb-3">
                            <SkeletonBox className="h-3.5 w-32 rounded" />
                        </div>

                        {/* Big Metric Value (3xl font-metric 36px) & Unit */}
                        <div className="pl-10.5 mb-1 flex items-baseline gap-2">
                            <SkeletonBox className="h-9 w-24 rounded-lg" />
                            <SkeletonBox className="h-4 w-10 rounded" />
                        </div>
                    </div>

                    {/* Footer Voltase Probe & Delta */}
                    <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-white/[0.06] flex items-center justify-between">
                        <SkeletonBox className="h-3.5 w-36 rounded" />
                        <SkeletonBox className="h-4.5 w-12 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
};

// 2. Zero-CLS Skeleton untuk Banner Status Kolam & 4 Kotak Ringkasan Biomassa
export const StatusOverviewSkeleton = () => {
    return (
        <div className="bg-white dark:bg-neutral-900/90 rounded-2xl border border-neutral-200/80 dark:border-white/[0.07] p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-none">
            {/* Top Bar Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-neutral-100 dark:border-white/[0.06] gap-4">
                <div className="flex items-center gap-3.5">
                    <SkeletonBox className="w-11 h-11 rounded-xl shrink-0" />
                    <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                            <SkeletonBox className="h-6 w-44 rounded-lg" />
                            <SkeletonBox className="h-5 w-20 rounded-full" />
                        </div>
                        <SkeletonBox className="h-3.5 w-64 rounded" />
                    </div>
                </div>
                <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-neutral-50/80 dark:bg-white/[0.03] border border-neutral-200/70 dark:border-white/[0.07] w-60">
                    <SkeletonBox className="w-8 h-8 rounded-lg shrink-0" />
                    <div className="space-y-1.5 flex-1">
                        <SkeletonBox className="h-3.5 w-28 rounded" />
                        <SkeletonBox className="h-3 w-32 rounded" />
                    </div>
                </div>
            </div>

            {/* Quick Metrics Strip 4 Kolom */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 pt-5">
                {[1, 2, 3, 4].map((i) => (
                    <div 
                        key={i} 
                        className="p-4 rounded-xl bg-neutral-50/60 dark:bg-white/[0.02] border border-neutral-200/60 dark:border-white/[0.06] space-y-2.5"
                    >
                        <div className="flex items-center gap-1.5">
                            <SkeletonBox className="w-3.5 h-3.5 rounded" />
                            <SkeletonBox className="h-3 w-28 rounded" />
                        </div>
                        <SkeletonBox className="h-7 w-20 rounded-lg" />
                        <SkeletonBox className="h-3 w-36 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
};

// 3. Zero-CLS Skeleton untuk Area Grafik Kualitas Air
export const ChartSkeleton = () => {
    return (
        <div className="bg-white dark:bg-neutral-900/90 rounded-2xl border border-neutral-200/80 dark:border-white/[0.07] p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-none space-y-6">
            {/* Header Kontrol Grafik */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <SkeletonBox className="w-5 h-5 rounded" />
                        <SkeletonBox className="h-6 w-52 rounded-lg" />
                    </div>
                    <SkeletonBox className="h-3.5 w-72 rounded" />
                </div>
                <div className="flex gap-1.5 p-1 bg-neutral-100/80 dark:bg-white/[0.03] rounded-xl border border-neutral-200/60 dark:border-white/[0.07]">
                    <SkeletonBox className="h-7 w-20 rounded-lg" />
                    <SkeletonBox className="h-7 w-20 rounded-lg" />
                    <SkeletonBox className="h-7 w-20 rounded-lg" />
                </div>
            </div>

            {/* Simulating Waveform Canvas */}
            <div className="h-[340px] w-full bg-neutral-50/50 dark:bg-white/[0.02] p-4 sm:p-6 rounded-xl border border-neutral-100/80 dark:border-white/[0.06] flex flex-col justify-between">
                <div className="flex justify-between items-center border-b border-dashed border-neutral-200/80 dark:border-white/[0.06] pb-2">
                    <SkeletonBox className="h-3 w-8 rounded" />
                    <SkeletonBox className="h-1.5 w-4/5 rounded" />
                    <SkeletonBox className="h-3 w-8 rounded" />
                </div>
                <div className="flex justify-between items-center border-b border-dashed border-neutral-200/80 dark:border-white/[0.06] py-2">
                    <SkeletonBox className="h-3 w-8 rounded" />
                    <SkeletonBox className="h-1.5 w-5/6 rounded" />
                    <SkeletonBox className="h-3 w-8 rounded" />
                </div>

                {/* Shimmer Waveform Bar Pillars */}
                <div className="flex items-end justify-between h-44 px-3 gap-2">
                    {[45, 68, 48, 85, 58, 92, 70, 88, 62, 94, 76, 85].map((h, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                            <SkeletonBox 
                                className="w-full rounded-t-sm opacity-80" 
                                style={{ height: `${h}%` }}
                            />
                            <SkeletonBox className="h-2 w-8 rounded" />
                        </div>
                    ))}
                </div>

                {/* Legend Row */}
                <div className="flex justify-center items-center gap-6 pt-3 border-t border-neutral-200/80 dark:border-white/[0.06]">
                    <div className="flex items-center gap-2">
                        <SkeletonBox className="w-2.5 h-2.5 rounded-full" />
                        <SkeletonBox className="h-3 w-14 rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                        <SkeletonBox className="w-2.5 h-2.5 rounded-full" />
                        <SkeletonBox className="h-3 w-14 rounded" />
                    </div>
                    <div className="flex items-center gap-2">
                        <SkeletonBox className="w-2.5 h-2.5 rounded-full" />
                        <SkeletonBox className="h-3 w-14 rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
};

// 4. Zero-CLS Skeleton untuk Baris Log Tabel Google Sheets
export const TableRowSkeleton = ({ rows = 5 }) => {
    return (
        <>
            {Array.from({ length: rows }).map((_, idx) => (
                <tr key={idx} className="border-b border-neutral-100 dark:border-white/[0.06]">
                    <td className="px-3.5 py-3.5"><SkeletonBox className="h-4 w-20 rounded" /></td>
                    <td className="px-3.5 py-3.5"><SkeletonBox className="h-4 w-14 rounded" /></td>
                    <td className="px-3.5 py-3.5"><SkeletonBox className="h-4 w-12 rounded" /></td>
                    <td className="px-3.5 py-3.5"><SkeletonBox className="h-4 w-12 rounded" /></td>
                    <td className="px-3.5 py-3.5"><SkeletonBox className="h-4 w-16 rounded" /></td>
                    <td className="px-3.5 py-3.5"><SkeletonBox className="h-4 w-14 rounded" /></td>
                    <td className="px-3.5 py-3.5"><SkeletonBox className="h-4 w-10 rounded" /></td>
                    <td className="px-3.5 py-3.5"><SkeletonBox className="h-4 w-10 rounded" /></td>
                    <td className="px-3.5 py-3.5"><SkeletonBox className="h-4 w-10 rounded" /></td>
                    <td className="px-3.5 py-3.5"><SkeletonBox className="h-4 w-14 rounded" /></td>
                    <td className="px-3.5 py-3.5"><SkeletonBox className="h-5 w-20 rounded-full" /></td>
                </tr>
            ))}
        </>
    );
};


