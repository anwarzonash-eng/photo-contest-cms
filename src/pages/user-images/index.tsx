'use client';

import React, { useState, useEffect } from 'react';
import Masonry from 'react-masonry-css';
import Header from '@/components/layout/Header';
import { useSearchParams, useRouter } from 'next/navigation';
import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

// Assuming UsersApis is a service module with typed API calls
import UsersApis from '@/services/users/users.api';
import { create } from 'domain';

// Define types for photo and API response
interface Photo {
    id: string;
    src: string;
    alt: string;
    createdAt?: string;
}

// Define the expected API response structure (adjust based on your actual API)
interface ApiResponse {
    data: {
        data: Photo[] | { results: Photo[] }; // Adjust based on API response shape
    };
}

// Define payload type for API calls
interface PhotoPayload {
    isPaid: boolean;
    offset: number;
    sortingType: string;
    user_id: string | null;
    value: string;
}

// Utility function to format date to DD/MM/YYYY
const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ''; // Handle invalid dates
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const Index: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get('id');
    const type = searchParams.get('type') as 'portfolio' | 'hunted' | null;
    const userName = searchParams.get('name') || 'User Name';
    const totalPhotosInitial = parseInt(searchParams.get('totalphoto') || '0', 10);
    const [totalPhotos, setTotalPhotos] = useState<number>(totalPhotosInitial);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);

    const { mutate: removeUserPhoto, isPending: isRemoving } = useMutation({
        mutationFn: (photoId: string) =>
            UsersApis.removeUserPhoto({
                photoId,
                photoType: type === 'hunted' ? 'hunted' : 'gallery_photo',
            }),
        onSuccess: () => {
            // Locally remove the photo from state
            setPhotos((prevPhotos) => prevPhotos.filter((photo) => photo.id !== selectedPhotoId));
            const newTotal = totalPhotos - 1;
            setTotalPhotos(newTotal);
            updateTotalPhotosInUrl(newTotal);
            setIsModalOpen(false);
            setSelectedPhotoId(null);
        },
        onError: (error: any) => {
            console.error('Error removing photo:', error);
            alert(error.response?.data?.message || 'Failed to remove photo. Please try again.');
            setIsModalOpen(false);
            setSelectedPhotoId(null);
        },
    });

    const openRemoveModal = (photoId: string) => {
        setSelectedPhotoId(photoId);
        setIsModalOpen(true);
    };

    const handleRemove = () => {
        if (selectedPhotoId) {
            removeUserPhoto(selectedPhotoId);
        }
    };

    const payload = (pageParam: any): PhotoPayload => ({
        isPaid: false,
        offset: pageParam,
        sortingType: 'upload_date',
        user_id: id,
        value: 'new',
    });

    const { ref, inView } = useInView();

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery<ApiResponse, Error>({
        queryKey: ['photos', type, id],
        queryFn: async ({ pageParam = 0 }) => {
            if (type === 'portfolio') {
                return await UsersApis.getPortfolioPhotos(payload(pageParam));
            } else if (type === 'hunted') {
                return await UsersApis.getUserHuntedPhotos(payload(pageParam));
            }
            throw new Error('Invalid type');
        },
        getNextPageParam: (lastPage: any, pages: any) => {
            const loadedCount = pages.reduce((acc: any, page: any) => {
                const photoData: any = type === 'portfolio' ? page.data.data : page.data.data.results;
                return acc + photoData.length;
            }, 0);
            if (loadedCount >= totalPhotos || lastPage.data.data.length === 0) {
                return undefined;
            }
            return pages.length * 10;
        },
        initialPageParam: 0,
        enabled: !!id && !!type,
    });

    useEffect(() => {
        if (data) {
            const allPhotos = data.pages.flatMap((page: any) => {
                const photoData = type === 'portfolio' ?
                    page.data.data : page.data.data.results;
                return photoData.map((photo: any) => ({
                    id: photo.id,
                    src: photo.photo_url,
                    alt: photo.name || 'Photo',
                    createdAt: photo.photo_posted_date,
                }));
            });
            setPhotos(allPhotos);
        }
    }, [data, type]);

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    useEffect(() => {
        setTotalPhotos(parseInt(searchParams.get('totalphoto') || '0', 10));
    }, [searchParams]);

    const updateTotalPhotosInUrl = (newTotal: number) => {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set('totalphoto', newTotal.toString());
        router.replace(`?${newSearchParams.toString()}`, { scroll: false });
    };

    const breakpointColumnsObj = {
        default: 3,
        1100: 3,
        700: 2,
        500: 1,
    };

    return (
        <>
            <Header />
            <div className="hunted-photos-container" style={{ marginTop: '30px', padding: '25px ' }}>


                <main className="main-content">
                    <div className="container-fluid">
                        <div className="content-header mb-4">
                            <h1 className="page-title">
                                {type === 'portfolio' ? 'PORTFOLIO PHOTOS' : 'HUNTED PHOTOS'}
                            </h1>
                            <div className="user-info">
                                <p className="user-label">{userName}</p>
                                <p className="photo-count">NUMBER OF PHOTOS: {totalPhotos}</p>
                            </div>
                        </div>

                        {status === 'pending' && photos.length === 0 && <p>Loading photos...</p>}
                        {status === 'error' && <p>Error fetching photos: {error?.message}</p>}
                        {status === 'success' && photos.length === 0 && <p>No photos available.</p>}

                        {photos.length > 0 && (
                            <div className="photos-grid">
                                <Masonry
                                    breakpointCols={breakpointColumnsObj}
                                    className="masonry-grid"
                                    columnClassName="masonry-grid-column"
                                >
                                    {photos.map((photo, index) => (
                                        <div
                                            key={photo.id}
                                            className="photo-item"
                                            ref={index === photos.length - 1 ? ref : null}
                                        >
                                            <div className="photo-wrapper">
                                                <img
                                                    src={photo.src}
                                                    alt={photo.alt}
                                                    className="photo-image"
                                                />


                                                <span className="photo-date" style={{ position: 'absolute' }}>{formatDate(photo.createdAt)}</span>
                                                <button
                                                    className="btn remove-btn"
                                                    onClick={() => openRemoveModal(photo.id)}
                                                >
                                                    REMOVE
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </Masonry>
                            </div>
                        )}
                        {isFetchingNextPage && <p>Loading more photos...</p>}
                        <div ref={ref} style={{ height: '1px' }} />
                    </div>
                </main>
            </div>

            {isModalOpen && (
                <>
                    <div className="backdrop" />
                    <div className="modal action_modal" style={{ display: 'block' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content modal_content">
                                <button
                                    type="button"
                                    className="modal_close"
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={isRemoving}
                                >
                                    <img src="/assets/img/icons/cross.svg" alt="Close" />
                                </button>
                                <h4 className="modal_title">Remove Photo</h4>
                                <div className="modal_desc">
                                    Are you sure you want to remove this photo? This action cannot be undone.
                                </div>
                                <div className="modal_buttons mt-4">
                                    <button
                                        className="btn yes"
                                        onClick={handleRemove}
                                        disabled={isRemoving}
                                    >
                                        {isRemoving ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" />
                                                Removing...
                                            </>
                                        ) : (
                                            'Yes'
                                        )}
                                    </button>
                                    <button
                                        className="btn no"
                                        onClick={() => setIsModalOpen(false)}
                                        disabled={isRemoving}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default Index;