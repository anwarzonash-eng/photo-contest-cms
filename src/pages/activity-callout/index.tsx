import Header from '@/components/layout/Header'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import ActivityApis from '@/services/Activity/activity.api'



interface ActivityFormData {
    titleText: string;
    subtitleText: string;
    ctaText: string;
    ctaUrl: string;
}

const validationSchema = Yup.object({
    titleText: Yup.string().required('Title Text is required'),
    subtitleText: Yup.string().required('Subtitle Text is required'),
    ctaText: Yup.string().required('CTA Text is required'),
    ctaUrl: Yup.string().url('Must be a valid URL').required('CTA URL is required'),
});

const ActivityCallout = () => {


    // Fetch activity callout data
    const { data, isLoading, error } = useQuery({
        queryKey: ['activityCallout'],
        queryFn: async () => {
            const response = await ActivityApis.GetActivityCalloutData();
            return response.data.data.activityCallout;
        },
        staleTime: 5 * 60 * 1000,
    });

    // Set initial values from API data
    const initialValues: ActivityFormData = {
        titleText: data?.title || '',
        subtitleText: data?.subTitle || '',
        ctaText: data?.CTA || '',
        ctaUrl: data?.CTA_Url || '',
    };


    const handleSubmit = async (values: ActivityFormData) => {
        if (!data?.id) {
            alert('No activity callout ID found.');
            return;
        }
        const payload = {
            id: data.id,
            title: values.titleText,
            subTitle: values.subtitleText,
            CTA: values.ctaText,
            CTA_Url: values.ctaUrl,
        };
        try {
            const response = await ActivityApis.UpdateActivityCallout(payload);

            alert('Activity callout updated successfully!');

        } catch (err) {
            alert('Failed to update activity callout.');
            console.error(err);
        }
    };

    return (
        <>
            <Header />
            <div className="container-fluid" style={{ maxWidth: '1550px' }}>
                <div className="row">
                    <div className="col-12">
                        <div className="content-wrapper">
                            <div className="col">
                                <div className="activity_section_wrap">
                                    <div className="activity_header">
                                        <h1 style={{ fontSize: '24px', marginBottom: '30px', marginTop: '80px' }}>
                                            Activity Callout
                                        </h1>
                                    </div>

                                    {isLoading ? (
                                        <div style={{ fontSize: '20px', textAlign: 'center', margin: '40px 0' }}>Loading...</div>
                                    ) : (
                                        <Formik
                                            initialValues={initialValues}
                                            enableReinitialize={true}
                                            validationSchema={validationSchema}
                                            onSubmit={handleSubmit}
                                        >
                                            {({ isSubmitting, errors, touched }) => (
                                                <Form>
                                                    <div className="form-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                                                        {/* Title Text Field */}
                                                        <label
                                                            htmlFor="titleText"
                                                            style={{
                                                                display: 'block',
                                                                marginBottom: '6px',
                                                                fontSize: '16px',
                                                                fontWeight: '500'
                                                            }}
                                                        >
                                                            Title Text
                                                        </label>
                                                        <Field
                                                            type="text"
                                                            id="titleText"
                                                            name="titleText"
                                                            style={{
                                                                width: '100%',
                                                                padding: '8px',
                                                                border: errors.titleText && touched.titleText ? '2px solid #dc3545' : '2px solid #000',
                                                                borderRadius: '12px',
                                                                fontSize: '15px',
                                                                outline: 'none',
                                                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                                                marginBottom: '2px',
                                                                background: '#fff',
                                                                transition: 'border 0.2s'
                                                            }}
                                                        />
                                                        <ErrorMessage name="titleText">
                                                            {(msg) => (
                                                                <div style={{ color: '#dc3545', fontSize: '14px', marginBottom: '18px', marginTop: '2px' }}>
                                                                    {msg}
                                                                </div>
                                                            )}
                                                        </ErrorMessage>

                                                        {/* Subtitle Text Field */}
                                                        <label
                                                            htmlFor="subtitleText"
                                                            style={{
                                                                display: 'block',
                                                                marginBottom: '6px',
                                                                fontSize: '16px',
                                                                fontWeight: '500'
                                                            }}
                                                        >
                                                            Subtitle Text
                                                        </label>
                                                        <Field
                                                            type="text"
                                                            id="subtitleText"
                                                            name="subtitleText"
                                                            style={{
                                                                width: '100%',
                                                                padding: '8px',
                                                                border: errors.subtitleText && touched.subtitleText ? '2px solid #dc3545' : '2px solid #000',
                                                                borderRadius: '12px',
                                                                fontSize: '15px',
                                                                outline: 'none',
                                                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                                                marginBottom: '2px',
                                                                background: '#fff',
                                                                transition: 'border 0.2s'
                                                            }}
                                                        />
                                                        <ErrorMessage name="subtitleText">
                                                            {(msg) => (
                                                                <div style={{ color: '#dc3545', fontSize: '14px', marginBottom: '18px', marginTop: '2px' }}>
                                                                    {msg}
                                                                </div>
                                                            )}
                                                        </ErrorMessage>

                                                        {/* CTA Text Field */}
                                                        <label
                                                            htmlFor="ctaText"
                                                            style={{
                                                                display: 'block',
                                                                marginBottom: '6px',
                                                                fontSize: '16px',
                                                                fontWeight: '500'
                                                            }}
                                                        >
                                                            CTA Text
                                                        </label>
                                                        <Field
                                                            type="text"
                                                            id="ctaText"
                                                            name="ctaText"
                                                            style={{
                                                                width: '100%',
                                                                padding: '8px',
                                                                border: errors.ctaText && touched.ctaText ? '2px solid #dc3545' : '2px solid #000',
                                                                borderRadius: '12px',
                                                                fontSize: '15px',
                                                                outline: 'none',
                                                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                                                marginBottom: '2px',
                                                                background: '#fff',
                                                                transition: 'border 0.2s'
                                                            }}
                                                        />
                                                        <ErrorMessage name="ctaText">
                                                            {(msg) => (
                                                                <div style={{ color: '#dc3545', fontSize: '14px', marginBottom: '18px', marginTop: '2px' }}>
                                                                    {msg}
                                                                </div>
                                                            )}
                                                        </ErrorMessage>

                                                        {/* CTA URL Field */}
                                                        <label
                                                            htmlFor="ctaUrl"
                                                            style={{
                                                                display: 'block',
                                                                marginBottom: '6px',
                                                                fontSize: '16px',
                                                                fontWeight: '500'
                                                            }}
                                                        >
                                                            CTA URL
                                                        </label>
                                                        <Field
                                                            type="url"
                                                            id="ctaUrl"
                                                            name="ctaUrl"
                                                            style={{
                                                                width: '100%',
                                                                padding: '8px',
                                                                border: errors.ctaUrl && touched.ctaUrl ? '2px solid #dc3545' : '2px solid #000',
                                                                borderRadius: '12px',
                                                                fontSize: '15px',
                                                                outline: 'none',
                                                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                                                marginBottom: '2px',
                                                                background: '#fff',
                                                                transition: 'border 0.2s'
                                                            }}
                                                        />
                                                        <ErrorMessage name="ctaUrl">
                                                            {(msg) => (
                                                                <div style={{ color: '#dc3545', fontSize: '14px', marginBottom: '18px', marginTop: '2px' }}>
                                                                    {msg}
                                                                </div>
                                                            )}
                                                        </ErrorMessage>

                                                        {/* Submit Button */}
                                                        <div className="form-group" style={{ textAlign: 'center', marginTop: '30px' }}>
                                                            <button
                                                                type="submit"
                                                                disabled={isSubmitting}
                                                                style={{
                                                                    padding: '8px 32px',
                                                                    fontSize: '15px',
                                                                    backgroundColor: 'white',
                                                                    color: '#000',
                                                                    border: '2px solid #000',
                                                                    borderRadius: '8px',
                                                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                                                    opacity: isSubmitting ? 0.6 : 1,
                                                                    fontWeight: '500',
                                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                                                                }}
                                                            >
                                                                {isSubmitting ? 'Updating...' : 'Update'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </Form>
                                            )}
                                        </Formik>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ActivityCallout
