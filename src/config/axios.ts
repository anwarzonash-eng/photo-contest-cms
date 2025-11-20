import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import Cookies from 'js-cookie';

// Define public routes
const publicRoutes: string[] = ["/login"];



// Create an Axios instance
const axiosInstance: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // Use environment variable for base URL
    headers: {
        "Content-Type": "application/json",
    },
});


axiosInstance.interceptors.request.use(
    (config) => {

        const userDataStr = Cookies.get("PhotoContestCMS.");
        const userData = userDataStr ? JSON.parse(userDataStr) : null;
        const token = userData?.token?.token || null;


        // Check if the route is public
        const isPublicRoute: boolean = publicRoutes.some((route: string) =>
            config.url?.includes(route)
        );

        if (!isPublicRoute) {
            // Inject Authorization header if token exists
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error: AxiosError) => {
        // Handle request error
        return Promise.reject(error);
    }
);

// Response interceptor to handle global errors
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        // Handle response error
        if (error.response?.status === 401) {
            // Redirect to login if token is invalid or expired
            if (typeof window !== 'undefined') {
                Cookies.remove("PhotoContestCMS.");
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;