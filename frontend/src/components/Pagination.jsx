import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ 
    currentPage = 1, 
    totalItems = 0, 
    pageSize = 10, 
    onPageChange 
}) => {
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    
    if (totalItems <= 0) return null;

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 4) {
                pages.push(1, 2, 3, 4, 5, '...', totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="text-slate-500 dark:text-slate-400 font-medium">
                Menampilkan <span className="font-bold text-slate-800 dark:text-slate-200">{startItem}</span> - <span className="font-bold text-slate-800 dark:text-slate-200">{endItem}</span> dari <span className="font-bold text-slate-800 dark:text-slate-200">{totalItems}</span> entri <span className="text-[11px] text-slate-400 font-normal">({pageSize} per halaman)</span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-end">
                {/* Tombol Sebelumnya */}
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
                    title="Halaman Sebelumnya"
                >
                    <ChevronLeft size={14} />
                </button>

                {/* Nomor Halaman */}
                {getPageNumbers().map((pageNum, idx) => {
                    if (pageNum === '...') {
                        return (
                            <span key={`ellipsis-${idx}`} className="px-1.5 text-slate-400 font-mono text-xs select-none">
                                ...
                            </span>
                        );
                    }

                    const isActive = pageNum === currentPage;
                    return (
                        <button
                            key={pageNum}
                            type="button"
                            onClick={() => onPageChange(pageNum)}
                            className={`min-w-[30px] h-7 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                                isActive
                                    ? 'bg-[#0284C7] text-white shadow-xs'
                                    : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                        >
                            {pageNum}
                        </button>
                    );
                })}

                {/* Tombol Berikutnya */}
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
                    title="Halaman Berikutnya"
                >
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
