import React, { useState } from 'react';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import EventsApis from '@/services/Events/event.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Events = () => {
    const [uploadedImage, setUploadedImage] = useState<File | null>(null);
    const queryClient = useQueryClient();

    const {
        data: EventData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['Currenttownhalls'],
        queryFn: async () => {
            const response = await EventsApis.GetCurrentEventData({});
            return response.data.data.townHalls[0];
        },
        staleTime: 5 * 60 * 1000,
    });

    const updateMutation = useMutation({
        mutationFn: EventsApis.UpdateCurrentEventData,
        onSuccess: () => {

            alert('Content saved successfully!');
        },
        onError: (err) => {
            console.error('Error updating event data:', err);
            alert('Failed to save content. Please try again.');
        },
    });

    // Set initial preview image from API
    const initialImage = EventData?.compressedImageUrl || null;

    // Initial form values
    const initialValues = {
        headline: EventData?.heading || '',
        subheadline: EventData?.subHeading || '',
        body: EventData?.body || '',
        button1Label: EventData?.townhallBtn1Label || '',
        button1Url: EventData?.townhallBtn1Url || '',
        button2Label: EventData?.townhallBtn2Label || '',
        button2Url: EventData?.townhallBtn2Url || '',
        imageFile: null,
        existingImage: EventData?.compressedImageUrl || ''
    };

    const validationSchema = Yup.object({
        headline: Yup.string().required('Headline is required'),
        subheadline: Yup.string().required('Subheadline is required'),
        body: Yup.string().required('Body is required'),
        button1Label: Yup.string().required('Button 1 Label is required'),
        button1Url: Yup.string().url('Must be a valid URL').required('Button 1 URL is required'),
        button2Label: Yup.string().required('Button 2 Label is required'),
        button2Url: Yup.string().url('Must be a valid URL').required('Button 2 URL is required'),
        imageFile: Yup.mixed()
            .nullable()
            .test(
                'is-valid-size',
                'Image dimensions must be at most 1300x900 pixels',
                (value) => {
                    if (!value) return true; // Skip if no new image is uploaded
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const img = document.createElement('img');
                            img.onload = () => {
                                if (img.width <= 1300 && img.height <= 900) {
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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            setFieldValue('imageFile', file);
            setUploadedImage(file);
        }
    };

    const handleSubmit = async (values: any) => {
        const formData = new FormData();
        formData.append("townhallId", EventData?.id || "");
        formData.append("heading", values.headline || "");
        formData.append("subHeading", values.subheadline || "");
        formData.append("body", values.body || "");
        formData.append("townhallBtn1Label", values.button1Label || "");
        formData.append("townhallBtn1Url", values.button1Url || "");
        formData.append("townhallBtn2Label", values.button2Label || "");
        formData.append("townhallBtn2Url", values.button2Url || "");
        if (values.imageFile) {
            formData.append('photoUrl', values.imageFile);
        } else {
            formData.append('photoUrl', values.existingImage);
        }

        updateMutation.mutate(formData);
    };

    if (isLoading) {
        return (
            <>
                <Header />
                <h1 style={{ marginTop: '100px' }}>Loading...</h1>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <h1 style={{ marginTop: '100px' }}>Error loading event data</h1>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="container-fluid" style={{ maxWidth: '1550px' }}>
                {/* Main Content */}
                <div className="row">
                    <div className="col-12">
                        <div className="form-wrapper">
                            <h1 className="page-title">Content Management: /monthly-townhall</h1>
                            <p className="page-description">
                                This page allows you to edit live content on the Town Halls & Reviews page of the Photo Contest website.<br />
                                Changes here will impact live content on the production server.
                            </p>

                            <Formik
                                initialValues={initialValues}
                                validationSchema={validationSchema}
                                onSubmit={handleSubmit}
                                enableReinitialize={true}
                            >
                                {({ setFieldValue, values }) => (
                                    <Form className="townhall-form">
                                        {/* Headline */}
                                        <div className="form-group">
                                            <label className="form-label">Headline:</label>
                                            <Field
                                                type="text"
                                                name="headline"
                                                className="form-control form-input"
                                            />
                                            <ErrorMessage name="headline" component="div" className="text-danger" />
                                        </div>

                                        {/* Subheadline */}
                                        <div className="form-group">
                                            <label className="form-label">Subheadline:</label>
                                            <Field
                                                type="text"
                                                name="subheadline"
                                                className="form-control form-input"
                                            />
                                            <ErrorMessage name="subheadline" component="div" className="text-danger" />
                                        </div>

                                        {/* Body */}
                                        <div className="form-group">
                                            <label className="form-label">Body:</label>
                                            <Field
                                                as="textarea"
                                                name="body"
                                                className="form-control form-textarea"
                                                rows="4"
                                            />
                                            <ErrorMessage name="body" component="div" className="text-danger" />
                                        </div>

                                        {/* Button 1 Label */}
                                        <div className="form-group">
                                            <label className="form-label">Button 1 Label:</label>
                                            <Field
                                                type="text"
                                                name="button1Label"
                                                className="form-control form-input"
                                            />
                                            <ErrorMessage name="button1Label" component="div" className="text-danger" />
                                        </div>

                                        {/* Button 1 URL */}
                                        <div className="form-group">
                                            <label className="form-label">Button 1 URL:</label>
                                            <Field
                                                type="url"
                                                name="button1Url"
                                                className="form-control form-input"
                                            />
                                            <ErrorMessage name="button1Url" component="div" className="text-danger" />
                                        </div>

                                        {/* Button 2 Label */}
                                        <div className="form-group">
                                            <label className="form-label">Button 2 Label:</label>
                                            <Field
                                                type="text"
                                                name="button2Label"
                                                className="form-control form-input"
                                            />
                                            <ErrorMessage name="button2Label" component="div" className="text-danger" />
                                        </div>

                                        {/* Button 2 URL */}
                                        <div className="form-group">
                                            <label className="form-label">Button 2 URL:</label>
                                            <Field
                                                type="url"
                                                name="button2Url"
                                                className="form-control form-input"
                                            />
                                            <ErrorMessage name="button2Url" component="div" className="text-danger" />
                                        </div>

                                        {/* Image Upload */}
                                        <div className="form-group image-upload-group">
                                            <label className="form-label">Upload Image<br />Max(1300 x 900 px)</label>
                                            <div className="upload-section">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, setFieldValue)}
                                                    className="d-none"
                                                    id="imageUpload"
                                                />
                                                <label htmlFor="imageUpload" className="btn btn-secondary upload-btn">
                                                    Upload
                                                </label>
                                                {(uploadedImage || values.existingImage) && (
                                                    <div className="uploaded-image-preview mt-3">
                                                        <img
                                                            src={uploadedImage ? URL.createObjectURL(uploadedImage) : values.existingImage}
                                                            alt="Uploaded preview"
                                                            className="img-thumbnail"
                                                            style={{ maxWidth: '200px', maxHeight: '200px' }}
                                                        />
                                                    </div>
                                                )}
                                                <ErrorMessage name="imageFile" component="div" className="text-danger" />

                                            </div>
                                        </div>

                                        {/* Save Button */}
                                        <div className="form-group save-section" style={{ display: 'flex', justifyContent: 'end' }}>
                                            <button
                                                type="submit"
                                                className="btn btn-primary save-btn"
                                                disabled={updateMutation.isPending}
                                            >
                                                {updateMutation.isPending ? (
                                                    <span className="loader" />
                                                ) : (
                                                    'Save'
                                                )}
                                            </button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Events;