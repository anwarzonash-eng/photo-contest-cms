import axiosInstance from "@/config/axios";

interface LoginBody {
    email: string;
    password: string
}



const AuthApis = {
    login: (body: LoginBody) => {

        return axiosInstance.post("/admin/login", body);
    },
};

export default AuthApis;
