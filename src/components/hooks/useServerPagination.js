import { useState, useCallback } from 'react';

function useServerPagination(initialPageSize = 20) {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const handlePageChange = useCallback((step, maxPages = totalPages) => {
        setCurrentPage((prev) => {
            let next = prev + step;
            if (next < 1) return 1;
            if (next > maxPages) return maxPages;
            return next;
        });
    }, [totalPages]);

    const setPaginationData = useCallback((data) => {
        if (data && typeof data === 'object') {
            setTotalCount(data.count || 0);
            setTotalPages(data.num_pages || 1);
            setCurrentPage(data.current_page || 1);
        }
    }, []);

    return {
        currentPage,
        pageSize,
        totalPages,
        totalCount,
        handlePageChange,
        setPaginationData,
        setCurrentPage,
        setPageSize
    };
}

export default useServerPagination;
