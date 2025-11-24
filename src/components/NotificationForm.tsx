import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import ActivityApis from '@/services/Activity/activity.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface NotificationFormData {
    from: string;
    message: string;
    btnLabel: string;
    btnUrl: string;
    photo: File | null;
    postedType: 'immediate' | 'scheduled';
    postedAt: string;
    expirationType: 'never' | 'scheduled';
    expiredAt: string;
    shownNoOfTimes: number;
    cameraTypes: string[];
    photographerTypes: string[];
    photoDesireRatio: string[];
    genresList: string[];
    photoAssistance: string[];
    meetFor: string[];
    strengths: string[];
}

interface NotificationFormProps {
    onClose?: () => void;
    onSuccess?: () => void;
    editData?: any; // The notification data to edit
}

const NotificationForm: React.FC<NotificationFormProps> = ({ onClose, onSuccess, editData }) => {
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const isEditMode = !!editData;

    const addNotificationMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            return await ActivityApis.Notification(formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            alert(isEditMode ? 'Notification updated successfully!' : 'Notification sent successfully!');
            onSuccess?.();
            onClose?.();
        },
        onError: () => {
            alert('An error occurred while sending the notification. Please try again.');
        }
    });

    const validationSchema = Yup.object({
        from: Yup.string(),
        message: Yup.string()
            .required('Message is required')
            .max(200, 'Message must be 200 characters or less'),
        btnLabel: Yup.string()
            .test('btnLabel-btnUrl-validation', 'Button Label is required when Button URL is provided', function (value) {
                const { btnUrl } = this.parent;
                if (btnUrl && btnUrl.length > 0 && (!value || value.length === 0)) {
                    return false;
                }
                return true;
            }),
        btnUrl: Yup.string()
            .url('Invalid URL')
            .test('btnUrl-btnLabel-validation', 'Button URL is required when Button Label is provided', function (value) {
                const { btnLabel } = this.parent;
                if (btnLabel && btnLabel.length > 0 && (!value || value.length === 0)) {
                    return false;
                }
                return true;
            }),
        postedAt: Yup.string().when('postedType', {
            is: 'scheduled',
            then: (schema) => schema.required('Post time is required when scheduled'),
            otherwise: (schema) => schema.optional(),
        }),
        expiredAt: Yup.string().when('expirationType', {
            is: 'scheduled',
            then: (schema) => schema.required('Expire time is required when scheduled'),
            otherwise: (schema) => schema.optional(),
        }),
        shownNoOfTimes: Yup.number().min(1, 'Must be at least 1').required('Number of times is required'),
    });

    // Function to parse target_conditions back to form fields
    const parseTargetConditions = (targetConditions: any[]) => {
        const result = {
            cameraTypes: [],
            photographerTypes: [],
            photoDesireRatio: [],
            genresList: [],
            photoAssistance: [],
            meetFor: [],
            strengths: [],
        };

        if (Array.isArray(targetConditions)) {
            targetConditions.forEach((condition: any) => {
                switch (condition.type) {
                    case 'camera_brand':
                        result.cameraTypes = condition.value || [];
                        break;
                    case 'photograper_type':
                        result.photographerTypes = condition.value || [];
                        break;
                    case 'photo_desire_ratio':
                        result.photoDesireRatio = condition.value || [];
                        break;
                    case 'genres_list':
                        result.genresList = condition.value || [];
                        break;
                    case 'photo_assistance':
                        result.photoAssistance = condition.value || [];
                        break;
                    case 'meet_for':
                        result.meetFor = condition.value || [];
                        break;
                    case 'strengths':
                        result.strengths = condition.value || [];
                        break;
                }
            });
        }

        return result;
    };

    const initialValues: NotificationFormData = isEditMode ? {
        from: 'Ken from Photo Contest (not editable)',
        message: editData.message || '',
        btnLabel: editData.btnLabel || '',
        btnUrl: editData.btnUrl || '',
        photo: null, // File will be handled separately
        postedType: editData.postedType || 'immediate',
        postedAt: editData.postedAt ? new Date(editData.postedAt).toISOString().slice(0, 16) : '',
        expirationType: editData.expirationType || 'never',
        expiredAt: editData.expiredAt ? new Date(editData.expiredAt).toISOString().slice(0, 16) : '',
        shownNoOfTimes: editData.shownNoOfTimes || 1,
        ...parseTargetConditions(editData.target_conditions || [])
    } : {
        from: 'Ken from Photo Contest (not editable)',
        message: '',
        btnLabel: '',
        btnUrl: '',
        photo: null,
        postedType: 'immediate',
        postedAt: '',
        expirationType: 'never',
        expiredAt: '',
        shownNoOfTimes: 1,
        cameraTypes: [],
        photographerTypes: [],
        photoDesireRatio: [],
        genresList: [],
        photoAssistance: [],
        meetFor: [],
        strengths: [],
    };

    // Set preview image for edit mode
    React.useEffect(() => {
        if (isEditMode && (editData.photo_url || editData.compressedImageUrl)) {
            setPreviewImage(editData.photo_url || editData.compressedImageUrl);
        }
    }, [isEditMode, editData]);

    const formatDateForApi = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${month}-${day}-${year} ${hours}:${minutes}`;
    };

    const handleSubmit = async (values: NotificationFormData, { setSubmitting }: any) => {
        try {
            // Format the data according to backend API structure
            const targetConditions = [];

            // Only include fields that have selected values
            if (values.cameraTypes.length > 0) {
                targetConditions.push({
                    type: "camera_brand",
                    value: values.cameraTypes
                });
            }

            if (values.photographerTypes.length > 0) {
                targetConditions.push({
                    type: "photograper_type",
                    value: values.photographerTypes
                });
            }

            if (values.photoDesireRatio.length > 0) {
                targetConditions.push({
                    type: "photo_desire_ratio",
                    value: values.photoDesireRatio
                });
            }

            if (values.genresList.length > 0) {
                targetConditions.push({
                    type: "genres_list",
                    value: values.genresList
                });
            }

            if (values.photoAssistance.length > 0) {
                targetConditions.push({
                    type: "photo_assistance",
                    value: values.photoAssistance
                });
            }

            if (values.meetFor.length > 0) {
                targetConditions.push({
                    type: "meet_for",
                    value: values.meetFor
                });
            }

            if (values.strengths.length > 0) {
                targetConditions.push({
                    type: "strengths",
                    value: values.strengths
                });
            }

            const formData = new FormData();
            formData.append('message', values.message);
            formData.append('btnLabel', values.btnLabel);
            formData.append('btnUrl', values.btnUrl);
            formData.append('postedType', values.postedType);
            formData.append('postedAt', formatDateForApi(values.postedAt));
            formData.append('expirationType', values.expirationType);
            formData.append('expiredAt', formatDateForApi(values.expiredAt));
            formData.append('shownNoOfTimes', values.shownNoOfTimes.toString());
            formData.append('target_conditions', JSON.stringify(targetConditions));

            // If editing, append the notification ID
            if (isEditMode && editData.id) {
                formData.append('notificationId', editData.id);
            }

            if (values.photo) {
                // New photo uploaded
                formData.append('photo', values.photo);
            } else if (isEditMode && (editData.photo_url || editData.compressedImageUrl)) {
                // No new photo, but existing photo URL available
                formData.append('photo_url', editData.photo_url || editData.compressedImageUrl);
            }
            // Use mutation instead of direct API call
            await addNotificationMutation.mutateAsync(formData);
        } catch (error) {
            console.error('Error sending notification:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const checkboxOptions = {
        cameraTypes: ['Canon', 'Nikon', 'Sony', 'Fuji', 'Olympus', 'Pentax', 'Leica', 'Smartphone', 'Lumix', 'Other'],
        photoTypes: ['Hunting', 'Professional', 'Daily', 'Travel', 'Street', 'Portrait'],
        burningBits: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        genre: ['Landscape', 'Portrait', 'Street', 'Wildlife', 'Sports', 'Architecture', 'Macro', 'Abstract', 'Other'],
        weCanHelpWith: ['Composition', 'Technical', 'Post Processing', 'Equipment', 'Lighting', 'Business'],
        letsHuntFor: ['Landscapes', 'Street Photography', 'Wildlife', 'Architecture', 'People/Portraits', 'Night Photography', 'Macro', 'Abstract'],
        imGoodAt: ['Composition', 'Lighting', 'Post Processing', 'Equipment Knowledge', 'Technical Settings', 'Creative Vision', 'Business Side', 'Teaching']
    };

    return (
        <div className="container-fluid" style={{ maxWidth: '1550px' }}>
            <div className="row">
                <div className="col-12">
                    <div className="content-wrapper" style={{ padding: '20px' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">

                            {/* {onClose && (
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={onClose}
                                >
                                    Close
                                </button>
                            )} */}
                        </div>

                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ values, errors, touched, setFieldValue, isSubmitting }) => (
                                <Form>
                                    <div className="row">
                                        <div className="col-md-6">
                                            {/* From Field */}
                                            <div className="mb-3">
                                                <label className="form-label" style={{ fontWeight: 'bold' }}>From:</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={values.from}
                                                    disabled
                                                    style={{ backgroundColor: '#f8f9fa' }}
                                                />
                                            </div>

                                            {/* Message Field */}
                                            <div className="mb-3">
                                                <label className="form-label" style={{ fontWeight: 'bold' }}>Message:</label>
                                                <Field
                                                    as="textarea"
                                                    name="message"
                                                    className="form-control"
                                                    rows={4}
                                                    style={{ resize: 'vertical' }}
                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                                        if (e.target.value.length <= 200) {
                                                            setFieldValue('message', e.target.value);
                                                        }
                                                    }}
                                                />
                                                <div style={{ fontSize: '12px', color: '#666', textAlign: 'right', marginTop: '5px' }}>
                                                    Max characters: {values.message.length}/200
                                                </div>
                                                <ErrorMessage name="message" component="div" className="text-danger" />
                                            </div>

                                            {/* Button Label */}
                                            <div className="mb-3">
                                                <label className="form-label" style={{ fontWeight: 'bold' }}>Button Label:</label>
                                                <Field
                                                    type="text"
                                                    name="btnLabel"
                                                    className="form-control"
                                                />
                                                <ErrorMessage name="btnLabel" component="div" className="text-danger" />
                                            </div>

                                            {/* Button URL */}
                                            <div className="mb-3">
                                                <label className="form-label" style={{ fontWeight: 'bold' }}>Button URL:</label>
                                                <Field
                                                    type="url"
                                                    name="btnUrl"
                                                    className="form-control"
                                                />
                                                <ErrorMessage name="btnUrl" component="div" className="text-danger" />
                                            </div>

                                            {/* Upload Image */}
                                            <div className="mb-3">
                                                <label className="form-label" style={{ fontWeight: 'bold' }}>
                                                    Upload Image<br />
                                                    <small>Max (250 × 167 Px)</small>
                                                </label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="form-control"
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const img = new Image();
                                                            img.onload = () => {
                                                                if (img.width <= 250 && img.height <= 167) {
                                                                    setFieldValue('photo', file);
                                                                    setPreviewImage(URL.createObjectURL(file));
                                                                } else {
                                                                    alert('Image size must be 250x167 pixels or smaller.');
                                                                    e.target.value = ''; // Reset the input
                                                                }
                                                            };
                                                            img.src = URL.createObjectURL(file);
                                                        }
                                                    }}
                                                />
                                                {previewImage && (
                                                    <div className="mt-2">
                                                        <img src={previewImage} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px' }} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Post Time */}
                                            <div className="mb-3">
                                                <label className="form-label" style={{ fontWeight: 'bold' }}>When</label>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div>
                                                        <Field type="radio" name="postedType" value="immediate" />
                                                        <label className="ms-1">immediate</label>
                                                    </div>
                                                    <div>
                                                        <Field type="radio" name="postedType" value="scheduled" />
                                                        <label className="ms-1">Set Time</label>
                                                    </div>
                                                    {values.postedType === 'scheduled' && (
                                                        <>
                                                            <Field
                                                                type="datetime-local"
                                                                name="postedAt"
                                                                className="form-control"
                                                                style={{ width: 'auto' }}
                                                            />
                                                            <span>UTC</span>
                                                        </>
                                                    )}
                                                </div>
                                                <ErrorMessage name="postedAt">
                                                    {(msg) => <div className="text-danger">{msg}</div>}
                                                </ErrorMessage>
                                            </div>

                                            {/* Expire Time */}
                                            <div className="mb-3">
                                                <label className="form-label" style={{ fontWeight: 'bold' }}>Expire</label>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div>
                                                        <Field type="radio" name="expirationType" value="never" />
                                                        <label className="ms-1">Never</label>
                                                    </div>
                                                    <div>
                                                        <Field type="radio" name="expirationType" value="scheduled" />
                                                        <label className="ms-1">Set Time</label>
                                                    </div>
                                                    {values.expirationType === 'scheduled' && (
                                                        <>
                                                            <Field
                                                                type="datetime-local"
                                                                name="expiredAt"
                                                                className="form-control"
                                                                style={{ width: 'auto' }}
                                                            />
                                                            <span>UTC</span>
                                                        </>
                                                    )}
                                                </div>
                                                <ErrorMessage name="expiredAt">
                                                    {(msg) => <div className="text-danger">{msg}</div>}
                                                </ErrorMessage>
                                            </div>

                                            {/* Show Number of Times */}
                                            <div className="mb-3">
                                                <label className="form-label" style={{ fontWeight: 'bold' }}>Show Number of Times</label>
                                                <Field
                                                    type="number"
                                                    name="shownNoOfTimes"
                                                    className="form-control"
                                                    style={{ width: '100px' }}
                                                    min="1"
                                                />
                                                <ErrorMessage name="shownNoOfTimes" component="div" className="text-danger" />
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            {/* Who Section */}
                                            <div className="mb-4">
                                                {/* <label className="form-label" style={{ fontWeight: 'bold', fontSize: '16px' }}>Who</label> */}

                                                <div className="row">
                                                    {/* Camera Column */}
                                                    <div className="col-md-4">
                                                        <strong>Camera</strong>
                                                        {checkboxOptions.cameraTypes.map((option) => (
                                                            <div key={option} className="form-check">
                                                                <Field type="checkbox" name="cameraTypes" value={option} className="form-check-input" id={`camera-${option}`} />
                                                                <label className="form-check-label" htmlFor={`camera-${option}`}>{option}</label>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Photographer Type Column */}
                                                    <div className="col-md-4">
                                                        <strong>Photographer Type</strong>
                                                        {checkboxOptions.photoTypes.map((option) => (
                                                            <div key={option} className="form-check">
                                                                <Field type="checkbox" name="photographerTypes" value={option} className="form-check-input" id={`photographerType-${option}`} />
                                                                <label className="form-check-label" htmlFor={`photographerType-${option}`}>{option}</label>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Photo Desire Ratio Column */}
                                                    <div className="col-md-4">
                                                        <strong>Burning Itch</strong>
                                                        {checkboxOptions.burningBits.map((option) => (
                                                            <div key={option} className="form-check">
                                                                <Field type="checkbox" name="photoDesireRatio" value={option} className="form-check-input" id={`photoDesireRatio-${option}`} />
                                                                <label className="form-check-label" htmlFor={`photoDesireRatio-${option}`}>{option}</label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="row mt-3">
                                                    {/* Genres List Column */}
                                                    <div className="col-md-4">
                                                        <strong>Genres</strong>
                                                        {checkboxOptions.genre.map((option) => (
                                                            <div key={option} className="form-check">
                                                                <Field type="checkbox" name="genresList" value={option} className="form-check-input" id={`genresList-${option}`} />
                                                                <label className="form-check-label" htmlFor={`genresList-${option}`}>{option}</label>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Photo Assistance Column */}
                                                    <div className="col-md-4">
                                                        <strong>Photo Assistance</strong>
                                                        {checkboxOptions.weCanHelpWith.map((option) => (
                                                            <div key={option} className="form-check">
                                                                <Field type="checkbox" name="photoAssistance" value={option} className="form-check-input" id={`photoAssistance-${option}`} />
                                                                <label className="form-check-label" htmlFor={`photoAssistance-${option}`}>{option}</label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Meet For Section */}
                                            <div className="mb-4">
                                                <strong>Meet For:</strong>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        {checkboxOptions.letsHuntFor.slice(0, Math.ceil(checkboxOptions.letsHuntFor.length / 2)).map((option) => (
                                                            <div key={option} className="form-check">
                                                                <Field type="checkbox" name="meetFor" value={option} className="form-check-input" id={`meetFor-${option}`} />
                                                                <label className="form-check-label" htmlFor={`meetFor-${option}`}>{option}</label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="col-md-6">
                                                        {checkboxOptions.letsHuntFor.slice(Math.ceil(checkboxOptions.letsHuntFor.length / 2)).map((option) => (
                                                            <div key={option} className="form-check">
                                                                <Field type="checkbox" name="meetFor" value={option} className="form-check-input" id={`meetFor-${option}`} />
                                                                <label className="form-check-label" htmlFor={`meetFor-${option}`}>{option}</label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Strengths Section */}
                                            <div className="mb-4">
                                                <strong>Strengths:</strong>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        {checkboxOptions.imGoodAt.slice(0, Math.ceil(checkboxOptions.imGoodAt.length / 2)).map((option) => (
                                                            <div key={option} className="form-check">
                                                                <Field type="checkbox" name="strengths" value={option} className="form-check-input" id={`strengths-${option}`} />
                                                                <label className="form-check-label" htmlFor={`strengths-${option}`}>{option}</label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="col-md-6">
                                                        {checkboxOptions.imGoodAt.slice(Math.ceil(checkboxOptions.imGoodAt.length / 2)).map((option) => (
                                                            <div key={option} className="form-check">
                                                                <Field type="checkbox" name="strengths" value={option} className="form-check-input" id={`strengths-${option}`} />
                                                                <label className="form-check-label" htmlFor={`strengths-${option}`}>{option}</label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="mt-4 text-center">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={isSubmitting}
                                            style={{
                                                padding: '10px 40px',
                                                fontSize: '16px',
                                                color: 'black'
                                            }}
                                        >
                                            {isSubmitting
                                                ? (isEditMode ? 'Updating...' : 'Sending...')
                                                : (isEditMode ? 'Update Notification' : 'Send Notification')
                                            }
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationForm;
