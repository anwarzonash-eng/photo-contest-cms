import Header from '@/components/layout/Header'
import React, { useState } from 'react'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import ActivityApis from '@/services/Activity/activity.api';
import NotificationForm from '@/components/NotificationForm'






const Index = () => {


    const [showForm, setShowForm] = useState(false);
    const [editingNotification, setEditingNotification] = useState(null);
    const [loadingNotificationId, setLoadingNotificationId] = useState<string | null>(null);
    const [Notificationsdata, setNotificationsdata] = useState<Notification[]>([]);

    // Use react-query to fetch notifications with infinite scroll
    const {
        data: infiniteData,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery({
        queryKey: ['notifications'],
        queryFn: async ({ pageParam = 0 }) => {
            const response = await ActivityApis.NotificationList({ offSet: pageParam, limit: 10 });
            return response.data.data.notifications;
        },
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === 10 ? allPages.length * 10 : undefined;
        },
        initialPageParam: 0,
    });

    const queryClient = useQueryClient();

    const stopStartMutation = useMutation({
        mutationFn: async ({ notificationId, isStopped }: { notificationId: string, isStopped: boolean }) => {
            return await ActivityApis.NotificationStopAndStart({ notificationId, isStopped });
        },
        onSuccess: () => {

        },
        onError: () => {
            alert('Failed to update notification status.');
        }
    });




    interface Notification {
        id: number;
        from: string;
        message: string;
        postTime: string;
        expire: string;
        image: string | null;
        isActive: boolean;
    }

    // Map API data to UI format
    const allRawNotifications = infiniteData?.pages.flat() || [];
    const notifications: Notification[] = Array.isArray(allRawNotifications)
        ? allRawNotifications.map((item: any) => ({
            id: item.id,
            from: 'Ken from Photo Contest',
            message: item.message,
            postTime: item.postedAt ? new Date(item.postedAt).toLocaleString('en-GB', { hour12: false }) + ' UTC' : '',
            expire: item.expirationType === 'never' ? 'Never' : (item.expiredAt ? new Date(item.expiredAt).toLocaleString('en-GB', { hour12: false }) + ' UTC' : ''),
            image: item.photo_url || item.compressedImageUrl || null,
            isActive: !!item.isActive
        }))
        : [];

    React.useEffect(() => {
        setNotificationsdata(notifications);
    }, [infiniteData]);

    const handleEditNotification = (id: any) => {
        const notificationToEdit = allRawNotifications.find((item: any) => item.id === id);

        if (notificationToEdit) {
            setEditingNotification(notificationToEdit);
            setShowForm(true);
        }
    };

    const handleStopStartNotification = (notificationId: string, isActive: boolean) => {
        setLoadingNotificationId(notificationId);
        stopStartMutation.mutate(
            { notificationId, isStopped: isActive },
            {
                onSuccess: () => {
                    setNotificationsdata((prev) =>
                        prev.map((n) =>
                            String(n.id) === notificationId
                                ? { ...n, isActive: !isActive }
                                : n
                        )
                    );
                },
                onSettled: () => setLoadingNotificationId(null)
            }
        );
    };



    return (
        <>
            <Header />
            <div className="container-fluid" style={{ maxWidth: '1550px' }}>
                <div className="row">
                    <div className="col-12">
                        <div className="content-wrapper" style={{ padding: '20px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
                            <div className="d-flex align-items-center mb-4" style={{ marginTop: '80px' }}>

                                <div>
                                    <h1 className="h3 mb-1 text-dark fw-bold">
                                        {editingNotification ? "Edit Notification" :
                                            (showForm && !editingNotification ? " Create Notification" : " Notifications")}
                                    </h1>

                                </div>
                            </div>

                            <div className="d-flex justify-content-end mb-4">
                                <button
                                    className={`btn ${showForm ? 'btn-outline-secondary' : 'btn-primary'} btn-lg px-4 `}
                                    onClick={() => {
                                        if (showForm) {
                                            setShowForm(false);
                                            setEditingNotification(null);
                                        } else {
                                            setShowForm(true);
                                        }
                                    }}
                                    style={{ borderRadius: '10px', fontWeight: '400', color: 'black', fontSize: '18px' }}
                                >

                                    {showForm ? 'back' : 'Create New Notification'}
                                </button>
                            </div>

                            {showForm ? (
                                <NotificationForm
                                    onSuccess={() => {
                                        setShowForm(false);
                                        setEditingNotification(null);
                                    }}
                                    onClose={() => {
                                        setShowForm(false);
                                        setEditingNotification(null);
                                    }}
                                    editData={editingNotification}
                                />
                            ) : (
                                <div className="notification-list">
                                    {isLoading ? (
                                        <div className="text-center py-5">
                                            <span className="h5 text-secondary">Loading...</span>
                                        </div>
                                    ) : Notificationsdata.length === 0 ? (
                                        <div className="text-center py-5">
                                            <div className="card border-0 shadow-sm p-5" style={{ borderRadius: '15px' }}>
                                                <div className="text-muted">

                                                    <h4 className="text-dark mb-3">No Notifications Found</h4>

                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        Notificationsdata.map((notification) => (
                                            <div key={notification.id} className="card mb-4 border-0 shadow-sm position-relative" style={{ borderRadius: '15px', overflow: 'hidden' }}>
                                                <div className="card-body p-4">
                                                    <div className="row align-items-start">
                                                        <div className="col-md-9">
                                                            <div className="mb-3">
                                                                <div className="d-flex align-items-center mb-2">
                                                                    <label className="text-primary fw-semibold small text-uppercase mb-1">From:</label>
                                                                    <input className="form-control bg-light border-0 rounded-3" readOnly value={notification.from} />
                                                                </div>
                                                            </div>
                                                            <div className="mb-3">
                                                                <label className="text-primary fw-semibold small text-uppercase mb-2 d-block">Message:</label>
                                                                <textarea
                                                                    className="form-control bg-light border-0 rounded-3"
                                                                    style={{ fontSize: '15px', lineHeight: '1.6', resize: 'none' }}
                                                                    rows={4}
                                                                    value={notification.message}
                                                                    readOnly
                                                                />
                                                            </div>
                                                            <div className="row mb-3">
                                                                <div className="col-md-6">
                                                                    <div className="d-flex align-items-center">

                                                                        <div>
                                                                            <label className="text-primary fw-semibold small text-uppercase mb-1">Post Time:</label>
                                                                            <div className="text-muted small">{notification.postTime}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <div className="d-flex align-items-center">

                                                                        <div>
                                                                            <label className="text-primary fw-semibold small text-uppercase mb-1">Expire:</label>
                                                                            <div className="text-muted small">{notification.expire}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="d-flex gap-2 mt-4">
                                                                <button
                                                                    className="btn btn-outline-primary px-3 py-2"
                                                                    onClick={() => handleEditNotification(notification.id)}
                                                                    style={{ borderRadius: '8px', fontWeight: '500' }}
                                                                >

                                                                    View/Edit
                                                                </button>
                                                                <button
                                                                    className={`btn px-3 py-2 ${notification.isActive
                                                                        ? 'btn-outline-danger'
                                                                        : 'btn-outline-success'
                                                                        }`}
                                                                    style={{ borderRadius: '8px', fontWeight: '500' }}
                                                                    onClick={() => handleStopStartNotification(String(notification.id), notification.isActive)}
                                                                    disabled={loadingNotificationId === String(notification.id) && stopStartMutation.isPending}
                                                                >
                                                                    {loadingNotificationId === String(notification.id) && stopStartMutation.isPending
                                                                        ? 'Loading...'
                                                                        : notification.isActive ? 'Stop' : 'Start'}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="col-md-3">
                                                            <div className="text-center position-relative">
                                                                <span className={`badge position-absolute top-0 end-0 mt-2 me-2 ${notification.isActive
                                                                    ? 'bg-success'
                                                                    : 'bg-secondary'
                                                                    } px-2 py-1`} style={{ fontSize: '1rem', zIndex: 2 }}>
                                                                    {notification.isActive ? 'Active' : 'Inactive'}
                                                                </span>
                                                                <label className="text-primary fw-semibold small text-uppercase mb-2 d-block">Image:</label>
                                                                {notification.image ? (
                                                                    <img
                                                                        src={notification.image}
                                                                        alt="Notification"
                                                                        className="rounded-3 shadow-sm"
                                                                        style={{
                                                                            width: '120px',
                                                                            height: '80px',
                                                                            objectFit: 'cover'
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div
                                                                        className="d-flex align-items-center justify-content-center bg-light border rounded-3"
                                                                        style={{
                                                                            width: '120px',
                                                                            height: '80px',
                                                                            border: '2px dashed #dee2e6',
                                                                            margin: ' auto'
                                                                        }}
                                                                    >
                                                                        <div className="text-center">

                                                                            <div className="text-muted small">No Image</div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    {hasNextPage && (
                                        <div className="text-center mt-4">
                                            <button
                                                className="btn btn-primary px-4 py-2"
                                                onClick={() => fetchNextPage()}
                                                disabled={isFetchingNextPage}
                                                style={{ borderRadius: '8px', fontWeight: '500' }}
                                            >
                                                {isFetchingNextPage ? 'Loading...' : 'Load More'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Index
