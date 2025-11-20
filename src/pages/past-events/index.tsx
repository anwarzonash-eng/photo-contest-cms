import Header from '@/components/layout/Header';
import React, { useState } from 'react';
import Image from 'next/image';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import EventsApis from '@/services/Events/event.api';
import Link from 'next/link';

// Define types for townhall data
interface Townhall {
    id: string;
    date: string;
    guestName: string;
    description: string;
    townhallBtnLabel: string;
    videoLink: string;
    compressedImageUrl: string;
}

// Define types for form values
interface FormValues {
    date: string;
    line1: string;
    line2: string;
    buttonLabel: string;
    buttonUrl: string;
    imageFile: File | null;
    existingImage: string;
}

const PastEvents = () => {
    const [showModal, setShowModal] = useState<boolean>(false);
    const [modalTitle, setModalTitle] = useState<string>('Add');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    const queryClient = useQueryClient();

    const [initialValues, setInitialValues] = useState<FormValues>({
        date: '',
        line1: '',
        line2: '',
        buttonLabel: '',
        buttonUrl: '',
        imageFile: null,
        existingImage: '',
    });

    const {
        data: townhalls = [] as Townhall[],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['townhalls'],
        queryFn: async () => {
            const response = await EventsApis.GetPastEventList({});
            return response.data.data.townHalls;
        },
        staleTime: 5 * 60 * 1000,
    });

    const createMutation = useMutation({
        mutationFn: EventsApis.CreatePastEvent,
        onSuccess: () => {
            queryClient.invalidateQueries(['townhalls'] as any);
            setShowModal(false);
        },
        onError: (error: any) => {
            console.error('Create error:', error);
        },
    });

    const updateMutation = useMutation({
        mutationFn: EventsApis.UpdatePastEvent,
        onSuccess: () => {
            queryClient.invalidateQueries(['townhalls'] as any);
            setShowModal(false);
        },
        onError: (error: any) => {
            console.error('Update error:', error);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: EventsApis.DeletePastEvent,
        onSuccess: () => {
            queryClient.invalidateQueries(['townhalls'] as any);
        },
        onError: (error: any) => {
            console.error('Delete error:', error);
        },
    });

    // Validation schema, conditionally skipping imageFile validation for edit mode
    const validationSchema = Yup.object({
        date: Yup.string().required('Date is required'),
        line1: Yup.string().required('Line 1 is required'),
        line2: Yup.string().required('Line 2 is required'),
        buttonLabel: Yup.string().required('Button Label is required'),
        buttonUrl: Yup.string().url('Invalid URL').required('Button URL is required'),
        imageFile: editingId
            ? Yup.mixed()
                .nullable()
                .test(
                    'is-valid-size',
                    'Image dimensions must be at most 1050x700 pixels',
                    (value) => {
                        if (!value) return true; // Skip if no new image is uploaded
                        return new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                const img = document.createElement('img');
                                img.onload = () => {
                                    if (img.width <= 1050 && img.height <= 700) {
                                        resolve(true);
                                    } else {
                                        resolve(false);
                                    }
                                };
                                img.onerror = () => resolve(false);
                                img.src = e.target?.result as string;
                            };
                            reader.onerror = () => resolve(false);
                            reader.readAsDataURL(value as Blob);
                        });
                    }
                )
            : Yup.mixed()
                .test(
                    'is-required',
                    'Please upload an image',
                    function (value) {
                        const { existingImage } = this.parent;
                        return existingImage ? true : !!value;
                    }
                )
                .test(
                    'is-valid-size',
                    'Image dimensions must be at most 1050x700 pixels',
                    (value) => {
                        if (!value) return true;
                        return new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                const img = document.createElement('img');
                                img.onload = () => {
                                    if (img.width <= 1050 && img.height <= 700) {
                                        resolve(true);
                                    } else {
                                        resolve(false);
                                    }
                                };
                                img.onerror = () => resolve(false);
                                img.src = e.target?.result as string;
                            };
                            reader.onerror = () => resolve(false);
                            reader.readAsDataURL(value as Blob);
                        });
                    }
                ),
    });

    const handleAddNew = () => {
        setInitialValues({
            date: '',
            line1: '',
            line2: '',
            buttonLabel: '',
            buttonUrl: '',
            imageFile: null,
            existingImage: '',
        });
        setPreviewImage(null);
        setModalTitle('Add');
        setEditingId(null);
        setShowModal(true);
    };

    const handleEdit = (id: string) => {
        const townhall = townhalls.find((th: any) => th.id === id);
        if (townhall) {
            setInitialValues({
                date: townhall.date,
                line1: townhall.guestName || '',
                line2: townhall.description || '',
                buttonLabel: townhall.townhallBtnLabel || '',
                buttonUrl: townhall.videoLink || '',
                imageFile: null,
                existingImage: townhall.compressedImageUrl,
            });
            setPreviewImage(townhall.compressedImageUrl);
            setModalTitle('Edit');
            setEditingId(id);
            setShowModal(true);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this townhall?')) {
            deleteMutation.mutate({ townhallId: id });
        }
    };

    const handleSubmit = async (
        values: FormValues,
        { resetForm }: FormikHelpers<FormValues>
    ) => {
        const formData = new FormData();
        formData.append('photoUrl', (values.imageFile || values.existingImage) as any);
        formData.append('guestName', values.line1);
        formData.append('description', values.line2);
        formData.append('videoLink', values.buttonUrl);
        formData.append('townhallBtnLabel', values.buttonLabel);
        formData.append('date', values.date);
        if (editingId) {
            formData.append('townhallId', editingId);
        }

        if (editingId) {
            updateMutation.mutate(formData);
        } else {
            createMutation.mutate(formData);
        }
    };

    if (isLoading) {
        return (<>
            <Header />
            <h1 style={{ marginTop: "100px" }}>Loading...</h1>
        </>)

    }


    return (
        <>
            <Header />
            <div className="container-fluid" style={{ maxWidth: '1550px' }}>
                <div className="row">
                    <div className="col-12">
                        <div className="content-wrapper">
                            <h1 className="page-title" style={{ marginTop: '20px' }}>
                                Content Management: /previous-monthly-townhall
                            </h1>
                            <p className="page-description">
                                This page allows you to edit live content on the (Previous) Town
                                Halls & Reviews page of the Photo Contest website.
                                <br />
                                Changes here will impact live content on the production server.
                            </p>
                            <div className="add-new-section">
                                <button
                                    className="btn btn-outline-dark add-new-btn"
                                    onClick={handleAddNew}
                                >
                                    Add New
                                </button>
                            </div>
                            <div className="current-live-section">
                                <h2 className="section-title">Current Live:</h2>
                                {townhalls.length == 0 ? <p>No Records Founds</p> : error ? (
                                    <p>Error loading townhalls</p>
                                ) : (
                                    townhalls.map((townhall: Townhall) => (
                                        <div key={townhall.id} className="townhall-item">
                                            <div className="row align-items-center">
                                                <div className="col-md-2">
                                                    <div className="townhall-image">
                                                        <Image
                                                            src={townhall.compressedImageUrl}
                                                            alt={townhall.date}
                                                            width={120}
                                                            height={120}
                                                            className="img-fluid rounded"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-10">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <h3 className="townhall-date">{townhall.date}</h3>
                                                        <div className="action-buttons">
                                                            <button
                                                                className="btn-sm btn-outline-secondary me-2"
                                                                onClick={() => handleEdit(townhall.id)}
                                                                style={{ border: 'none', backgroundColor: 'transparent' }}
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button
                                                                className="btn-sm btn-outline-danger"
                                                                onClick={() => handleDelete(townhall.id)}
                                                                style={{ border: 'none', backgroundColor: 'transparent' }}
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="townhall-info">{townhall.guestName}</p>
                                                    <p className="townhall-description">{townhall.description}</p>
                                                    <Link
                                                        href={townhall.videoLink}
                                                        target="_blank"
                                                        className="btn btn-warning btn-sm"
                                                        style={{ padding: '10px' }}
                                                    >
                                                        {townhall.townhallBtnLabel}
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showModal && (
                <>
                    <div
                        className="modal-backdrop fade show"
                        style={{ zIndex: 1040 }}
                    ></div>
                    <div
                        className="modal fade show"
                        style={{ display: 'block', zIndex: 1050 }}
                        tabIndex={-1}
                        role="dialog"
                    >
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">{modalTitle}</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowModal(false)}
                                    ></button>
                                </div>
                                <Formik
                                    initialValues={initialValues}
                                    validationSchema={validationSchema}
                                    enableReinitialize={true}
                                    onSubmit={handleSubmit}
                                >
                                    {({ values, handleChange, handleSubmit, setFieldValue, errors, touched }) => (
                                        <form onSubmit={handleSubmit}>
                                            <div className="modal-body">
                                                <div className="mb-3">
                                                    <label className="form-label modal-label">DATE:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control modal-input"
                                                        name="date"
                                                        value={values.date}
                                                        onChange={handleChange}
                                                    />
                                                    {touched.date && errors.date && (
                                                        <div className="text-danger">{errors.date}</div>
                                                    )}
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label modal-label">Line 1:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control modal-input"
                                                        name="line1"
                                                        value={values.line1}
                                                        onChange={handleChange}
                                                    />
                                                    {touched.line1 && errors.line1 && (
                                                        <div className="text-danger">{errors.line1}</div>
                                                    )}
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label modal-label">Line 2:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control modal-input"
                                                        name="line2"
                                                        value={values.line2}
                                                        onChange={handleChange}
                                                    />
                                                    {touched.line2 && errors.line2 && (
                                                        <div className="text-danger">{errors.line2}</div>
                                                    )}
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label modal-label">
                                                        Upload Image Max(1050 x 700 px)
                                                    </label>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="form-control"
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                setFieldValue('imageFile', file);
                                                                setPreviewImage(URL.createObjectURL(file));
                                                            }
                                                        }}
                                                    />
                                                    {touched.imageFile && errors.imageFile && (
                                                        <div className="text-danger">{errors.imageFile}</div>
                                                    )}
                                                    {previewImage && (
                                                        <div className="mt-3">
                                                            <p>Preview:</p>
                                                            <Image
                                                                src={previewImage}
                                                                alt="Preview"
                                                                width={200}
                                                                height={200}
                                                                className="img-fluid"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label modal-label">Button Label:</label>
                                                    <input
                                                        type="text"
                                                        className="form-control modal-input"
                                                        name="buttonLabel"
                                                        value={values.buttonLabel}
                                                        onChange={handleChange}
                                                    />
                                                    {touched.buttonLabel && errors.buttonLabel && (
                                                        <div className="text-danger">{errors.buttonLabel}</div>
                                                    )}
                                                </div>
                                                <div className="mb-3">
                                                    <label className="form-label modal-label">Button URL:</label>
                                                    <input
                                                        type="url"
                                                        className="form-control modal-input"
                                                        name="buttonUrl"
                                                        value={values.buttonUrl}
                                                        onChange={handleChange}
                                                    />
                                                    {touched.buttonUrl && errors.buttonUrl && (
                                                        <div className="text-danger">{errors.buttonUrl}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="modal-footer">
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary save-btn"
                                                    disabled={createMutation.isPending || updateMutation.isPending}
                                                >
                                                    {createMutation.isPending || updateMutation.isPending ? (
                                                        <span className="loader" />
                                                    ) : (
                                                        'Save'
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </Formik>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default PastEvents;