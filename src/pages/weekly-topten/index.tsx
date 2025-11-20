import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import WeekltTopTenApis from '@/services/topten/weeklytopten.api';

const Index = () => {
    const [topTenListData, setTopTenListData] = useState<any>(null);
    const [limit, setLimit] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null); // 👈 new

    const DonloadHandler = async (date: string, index: number): Promise<void> => {
        let weekDate = date.split('_').pop() || '';
        if (weekDate) {
            const [month, day, year] = weekDate.split('-').map(Number);
            const dateObj = new Date(year, month - 1, day);
            dateObj.setDate(dateObj.getDate() + 1);
            const formattedDate = `${String(dateObj.getMonth() + 1).padStart(2, '0')}.${String(dateObj.getDate()).padStart(2, '0')}.${dateObj.getFullYear()}`;
            weekDate = formattedDate;
        }

        const payload = {
            fileName: date,
            weekDate,
        };

        try {
            setDownloadingIndex(index);
            console.log('Sending payload:', payload);


            const response = await WeekltTopTenApis.DownloadWeeklyToptenPhotos(payload);
            if (response.status == 404) {
                throw new Error(`No photos found for the selected week.`)
            }
            const blob = new Blob([response.data], { type: 'application/zip' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${date}.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            alert("Something went wrong while dowloading weekly top ten")

        } finally {
            setDownloadingIndex(null);
        }
    };



    const fetchTopTenListHandler = async () => {
        try {
            const offset = (currentPage - 1) * limit;
            const payload = { offSet: offset, limit };
            const response = await WeekltTopTenApis.WeeklyToptenList(payload);
            setTopTenListData(response?.data?.data?.[0] || {});
        } catch (error) {
            console.error('Error fetching top ten list:', error);
        }
    };

    useEffect(() => {
        fetchTopTenListHandler();
    }, [limit, currentPage]);

    const totalRecords = parseInt(topTenListData?.records_count || '0');
    const totalPages = Math.ceil(totalRecords / limit);

    const getVisiblePages = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 10) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 4) {
                pages.push(1, 2, 3, 4, 5, '...', totalPages - 2, totalPages - 1, totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1, 2, 3, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    return (
        <>
            <Header />
            <section className="users-section">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col">
                            <div className="users_section_wrap">
                                <div className="user_header" style={{ marginBottom: "10px" }}>
                                    <div className="total_users">
                                        <span>Total Records</span>
                                        <span className="no">{totalRecords}</span>
                                    </div>
                                </div>
                                <div className="table-responsive">
                                    <table className="table align-middle table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topTenListData?.weeks?.length > 0 ? (
                                                topTenListData.weeks.map((date: string, index: number) => (
                                                    <tr key={index}>
                                                        <td style={{ width: '80%' }}>
                                                            <span className="name">{date}</span>
                                                        </td>
                                                        <td>
                                                            <button className="btn" style={{ width: "150px" }} onClick={() => DonloadHandler(date, index)} disabled={downloadingIndex === index}>
                                                                {downloadingIndex == index ? <span className="loader" /> : 'Download'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={2}>No data found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="user_bottom">
                                    <div className="showing_items">
                                        <span className="status">
                                            Showing: {(currentPage - 1) * limit + 1} -{' '}
                                            {Math.min(currentPage * limit, totalRecords)} of {totalRecords}
                                        </span>
                                        <select
                                            value={limit}
                                            onChange={(e) => {
                                                setCurrentPage(1);
                                                setLimit(Number(e.target.value));
                                            }}
                                        >
                                            {[10, 100, 250, 500, 1000].map((val) => (
                                                <option key={val} value={val}>{val}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <ul className="users_pagination">
                                        <li>
                                            <a
                                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                                style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                                            >
                                                <img src="./assets/img/icons/angle-left.svg" alt="prev" />
                                            </a>
                                        </li>
                                        {getVisiblePages().map((page, idx) =>
                                            page === '...' ? (
                                                <li key={`dots-${idx}`}><span>...</span></li>
                                            ) : (
                                                <li key={page} className={page === currentPage ? 'active' : ''}>
                                                    <a onClick={() => setCurrentPage(Number(page))}>{page}</a>
                                                </li>
                                            )
                                        )}
                                        <li>
                                            <a
                                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                                style={{ cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                                            >
                                                <img src="./assets/img/icons/angle-right.svg" alt="next" />
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Index;
