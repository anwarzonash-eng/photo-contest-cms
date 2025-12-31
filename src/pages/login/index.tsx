import React, { useState } from "react";
import { useFormik, FormikHelpers } from "formik";
import { useRouter } from 'next/navigation';
import { Loginapi } from "@/utils/API/AuthApi";
import { loginSchemas } from "@/schemas";
import { AES } from "crypto-js";
import Cookies from "js-cookie";

interface LoginFormValues {
    username: string;
    password: string;
}




// ??

const LoginPage: React.FC = () => {
    const [spinner, setSpinner] = useState<boolean>(false);
    const [error, setError] = useState<string | boolean>(false);
    const router = useRouter();
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const { values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldTouched, resetForm } = useFormik<LoginFormValues>({
        initialValues: {
            username: '',
            password: '',
        },
        validationSchema: loginSchemas, // Ensure loginSchemas validates username
        validateOnBlur: false,
        onSubmit: async (value: LoginFormValues, action: FormikHelpers<LoginFormValues>) => {
            const trimmedUsername = value.username.trim();
            const userPassword = value.password.trim();

            setSpinner(true);
            setError(false);

            try {
                const response: any = await Loginapi(trimmedUsername, userPassword);

                const userInfo = response.data[0];
                const token = response.data[1];

                const userData = { ...userInfo, token };

                Cookies.set("PhotoContestCMS.", JSON.stringify(userData));

                router.push("/");

                setSpinner(false);
                action.resetForm();
            } catch (error: any) {
                console.log(error);
                const message = error.response?.data?.message || "An error occurred during login";

                setError(message);
                setSpinner(false);
            }
        },
    });

    return (
        <section className="bos-section d-flex align-items-center">
            <div className="container">
                <div className="row">
                    <div className="col">
                        <div className="bos_content_wrap">
                            <h2 className="title">BOS</h2>
                            {error && (
                                <p style={{ color: 'red', textAlign: 'start' }}>
                                    {error}
                                </p>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className="form_group">
                                    <input
                                        type="text"
                                        id="username"
                                        placeholder="Username"
                                        name="username"
                                        onChange={handleChange}
                                        value={values.username}
                                        onBlur={handleBlur}
                                    />
                                </div>
                                {errors.username && touched.username ? (
                                    <p style={{ color: 'red', textAlign: 'start' }}>
                                        {errors.username}
                                    </p>
                                ) : null}
                                <div className="form_group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        placeholder="Password"
                                        name="password"
                                        onChange={handleChange}
                                        value={values.password}
                                        onBlur={handleBlur}
                                    />
                                </div>
                                {errors.password && touched.password ? (
                                    <p style={{ color: 'red', textAlign: 'start' }}>
                                        {errors.password}
                                    </p>
                                ) : null}
                                <div className="form_button">
                                    <button className="btn" type="submit">
                                        {!spinner ? "Go" : <span className="loader" />}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LoginPage;