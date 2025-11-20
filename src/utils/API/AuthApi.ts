
import AuthApis from "@/services/auth/auth.api";


// <-----------Login-------------->
export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

export interface Results {
    user: User;
    token: string;
}

export interface Data {
    results: Results;
}

export interface LoginApiResponse {
    status: string;
    data: Data;
}

interface LoginPayload {
    email: string;
    password: string;
}


// <------------------------->
export const Loginapi = async (lowercaseEmail: string, userPassword: string): Promise<LoginApiResponse> => {
    console.log(lowercaseEmail)
    try {

        const payload: LoginPayload = {
            email: lowercaseEmail,
            password: userPassword,
        };

        const response = await AuthApis.login(payload);
        console.log(response)
        return response.data;
    } catch (error) {

        throw error;
    }
};





