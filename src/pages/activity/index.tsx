import Header from '@/components/layout/Header'
import React, { useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'

interface NotificationFormData {
    from: string;
    message: string;
    buttonLabel: string;
    buttonUrl: string;
    imageFile: File | null;
    postTime: string;
    expireTime: string;
    showNumberOfTimes: number;
    cameraTypes: string[];
    photoTypes: string[];
    burningBits: string[];
    genre: string[];
    weCanHelpWith: string[];
    letsHuntFor: string[];
    imGoodAt: string[];
}

const validationSchema = Yup.object({
    from: Yup.string().email('Invalid email').required('From email is required'),
    message: Yup.string().required('Message is required'),
    buttonLabel: Yup.string().required('Button Label is required'),
    buttonUrl: Yup.string().url('Invalid URL').required('Button URL is required'),
    postTime: Yup.string().required('Post time is required'),
    expireTime: Yup.string().required('Expire time is required'),
    showNumberOfTimes: Yup.number().min(1, 'Must be at least 1').required('Number of times is required'),
});

const Index = () => {
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const initialValues: NotificationFormData = {
        from: 'Karl from Photo Contest (not editable)',
        message: '',
        buttonLabel: '',
        buttonUrl: '',
        imageFile: null,
        postTime: '',
        expireTime: '',
        showNumberOfTimes: 1,
        cameraTypes: [],
        photoTypes: [],
        burningBits: [],
        genre: [],
        weCanHelpWith: [],
        letsHuntFor: [],
        imGoodAt: [],
    };

    const handleSubmit = (values: NotificationFormData) => {
        console.log('Form submitted with values:', values);
        // TODO: Implement API call to send notification
    };

    const checkboxOptions = {
        cameraTypes: ['Canon', 'Nikon', 'Sony', 'Fujifilm', 'Olympus', 'Panasonic', 'Leica', 'Other'],
        photoTypes: ['Hunting', 'Professional', 'Daily', 'Travel', 'Street', 'Portrait'],
        burningBits: ['0-4', '5-9', '10-14', '15-19', '20+'],
        genre: ['Landscape', 'Portrait', 'Street', 'Wildlife', 'Sports', 'Architecture', 'Macro', 'Abstract', 'Other'],
        weCanHelpWith: ['Composition', 'Technical', 'Post Processing', 'Equipment', 'Lighting', 'Business'],
        letsHuntFor: ['Landscapes', 'Street Photography', 'Wildlife', 'Architecture', 'People/Portraits', 'Night Photography', 'Macro', 'Abstract'],
        imGoodAt: ['Composition', 'Lighting', 'Post Processing', 'Equipment Knowledge', 'Technical Settings', 'Creative Vision', 'Business Side', 'Teaching']
    };

    return (
        <>
            <Header />
            <div className="container-fluid" style={{ maxWidth: '1550px' }}>
                <div className="row">
                    <div className="col-12">
                        <div className="content-wrapper" style={{ padding: '20px' }}>
                            <h1 style={{ fontSize: '18px', marginBottom: '10px', marginTop: '80px' }}>
                                This page enables you to send a notification to users' activity feed page.
                            </h1>
                            <p style={{ color: '#0066cc', textDecoration: 'underline', cursor: 'pointer', marginBottom: '30px' }}>
                                View Existing Notifications
                            </p>

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
                                                    />
                                                    <div style={{ fontSize: '12px', color: '#666', textAlign: 'right', marginTop: '5px' }}>
                                                        Max characters: 0/777
                                                    </div>
                                                    <ErrorMessage name="message" component="div" className="text-danger" />
                                                </div>

                                                {/* Button Label */}
                                                <div className="mb-3">
                                                    <label className="form-label" style={{ fontWeight: 'bold' }}>Button Label:</label>
                                                    <Field
                                                        type="text"
                                                        name="buttonLabel"
                                                        className="form-control"
                                                    />
                                                    <ErrorMessage name="buttonLabel" component="div" className="text-danger" />
                                                </div>

                                                {/* Button URL */}
                                                <div className="mb-3">
                                                    <label className="form-label" style={{ fontWeight: 'bold' }}>Button URL:</label>
                                                    <Field
                                                        type="url"
                                                        name="buttonUrl"
                                                        className="form-control"
                                                    />
                                                    <ErrorMessage name="buttonUrl" component="div" className="text-danger" />
                                                </div>

                                                {/* Upload Image */}
                                                <div className="mb-3">
                                                    <label className="form-label" style={{ fontWeight: 'bold' }}>
                                                        Upload Image<br />
                                                        <small>Max (??? X ??? Px)</small>
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
                                                            <input type="radio" name="postTimeType" value="immediately" defaultChecked />
                                                            <label className="ms-1">Immediately</label>
                                                        </div>
                                                        <div>
                                                            <input type="radio" name="postTimeType" value="specific" />
                                                            <label className="ms-1">Set Time</label>
                                                        </div>
                                                        <Field
                                                            type="datetime-local"
                                                            name="postTime"
                                                            className="form-control"
                                                            style={{ width: 'auto' }}
                                                        />
                                                        <span>UTC</span>
                                                    </div>
                                                </div>

                                                {/* Expire Time */}
                                                <div className="mb-3">
                                                    <label className="form-label" style={{ fontWeight: 'bold' }}>Expire</label>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div>
                                                            <input type="radio" name="expireType" value="never" defaultChecked />
                                                            <label className="ms-1">Never</label>
                                                        </div>
                                                        <div>
                                                            <input type="radio" name="expireType" value="specific" />
                                                            <label className="ms-1">Set Time</label>
                                                        </div>
                                                        <Field
                                                            type="datetime-local"
                                                            name="expireTime"
                                                            className="form-control"
                                                            style={{ width: 'auto' }}
                                                        />
                                                        <span>UTC</span>
                                                    </div>
                                                </div>

                                                {/* Show Number of Times */}
                                                <div className="mb-3">
                                                    <label className="form-label" style={{ fontWeight: 'bold' }}>Show Number of Times</label>
                                                    <Field
                                                        type="number"
                                                        name="showNumberOfTimes"
                                                        className="form-control"
                                                        style={{ width: '100px' }}
                                                        min="1"
                                                    />
                                                    <ErrorMessage name="showNumberOfTimes" component="div" className="text-danger" />
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                {/* Who Section */}
                                                <div className="mb-4">
                                                    <label className="form-label" style={{ fontWeight: 'bold', fontSize: '16px' }}>Who</label>

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

                                                        {/* Photo Type Column */}
                                                        <div className="col-md-4">
                                                            <strong>Photo Type</strong>
                                                            {checkboxOptions.photoTypes.map((option) => (
                                                                <div key={option} className="form-check">
                                                                    <Field type="checkbox" name="photoTypes" value={option} className="form-check-input" id={`photoType-${option}`} />
                                                                    <label className="form-check-label" htmlFor={`photoType-${option}`}>{option}</label>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Burning Bits Column */}
                                                        <div className="col-md-4">
                                                            <strong>Burning Bits</strong>
                                                            {checkboxOptions.burningBits.map((option) => (
                                                                <div key={option} className="form-check">
                                                                    <Field type="checkbox" name="burningBits" value={option} className="form-check-input" id={`burningBits-${option}`} />
                                                                    <label className="form-check-label" htmlFor={`burningBits-${option}`}>{option}</label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="row mt-3">
                                                        {/* Genre Column */}
                                                        <div className="col-md-4">
                                                            <strong>Genre</strong>
                                                            {checkboxOptions.genre.map((option) => (
                                                                <div key={option} className="form-check">
                                                                    <Field type="checkbox" name="genre" value={option} className="form-check-input" id={`genre-${option}`} />
                                                                    <label className="form-check-label" htmlFor={`genre-${option}`}>{option}</label>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* We can help with Column */}
                                                        <div className="col-md-4">
                                                            <strong>We can help with</strong>
                                                            {checkboxOptions.weCanHelpWith.map((option) => (
                                                                <div key={option} className="form-check">
                                                                    <Field type="checkbox" name="weCanHelpWith" value={option} className="form-check-input" id={`weCanHelpWith-${option}`} />
                                                                    <label className="form-check-label" htmlFor={`weCanHelpWith-${option}`}>{option}</label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Let's Hunt For Section */}
                                                <div className="mb-4">
                                                    <strong>Let's Hunt For:</strong>
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            {checkboxOptions.letsHuntFor.slice(0, Math.ceil(checkboxOptions.letsHuntFor.length / 2)).map((option) => (
                                                                <div key={option} className="form-check">
                                                                    <Field type="checkbox" name="letsHuntFor" value={option} className="form-check-input" id={`letsHuntFor-${option}`} />
                                                                    <label className="form-check-label" htmlFor={`letsHuntFor-${option}`}>{option}</label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="col-md-6">
                                                            {checkboxOptions.letsHuntFor.slice(Math.ceil(checkboxOptions.letsHuntFor.length / 2)).map((option) => (
                                                                <div key={option} className="form-check">
                                                                    <Field type="checkbox" name="letsHuntFor" value={option} className="form-check-input" id={`letsHuntFor-${option}`} />
                                                                    <label className="form-check-label" htmlFor={`letsHuntFor-${option}`}>{option}</label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* I'm Good At Section */}
                                                <div className="mb-4">
                                                    <strong>I'm Good At:</strong>
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            {checkboxOptions.imGoodAt.slice(0, Math.ceil(checkboxOptions.imGoodAt.length / 2)).map((option) => (
                                                                <div key={option} className="form-check">
                                                                    <Field type="checkbox" name="imGoodAt" value={option} className="form-check-input" id={`imGoodAt-${option}`} />
                                                                    <label className="form-check-label" htmlFor={`imGoodAt-${option}`}>{option}</label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="col-md-6">
                                                            {checkboxOptions.imGoodAt.slice(Math.ceil(checkboxOptions.imGoodAt.length / 2)).map((option) => (
                                                                <div key={option} className="form-check">
                                                                    <Field type="checkbox" name="imGoodAt" value={option} className="form-check-input" id={`imGoodAt-${option}`} />
                                                                    <label className="form-check-label" htmlFor={`imGoodAt-${option}`}>{option}</label>
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
                                                    fontSize: '16px'
                                                }}
                                            >
                                                {isSubmitting ? 'Sending...' : 'Send Notification'}
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
    )
}

export default Index
