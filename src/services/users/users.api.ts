import axiosInstance from "@/config/axios";



interface GetUserList {
    offSet: Number;
    limit: Number;
    searchKeyword?: string;
    sortBy?: string;
    sortType?: string;
}


interface UpdateName {
    userId: string,
    name?: string,
    status?: string
}

const UsersApis = {
    GetUserList: (body: GetUserList) => {

        return axiosInstance.post("/admin/getAllUsersList", body);
    },

    UpdateUserName: (body: UpdateName) => {

        return axiosInstance.post("/admin/updateUser", body);
    },


    getUserHuntedPhotos: (body: any) => {
        return axiosInstance.post(`/photo/get_user_photos`, body);
    },

    getPortfolioPhotos: (body: any) => {
        return axiosInstance.post(`/photo/view-gallery`, body);
    },

    removeUserPhoto: (body: any) => {
        return axiosInstance.post(`/photo/remove`, body);
    }
};

export default UsersApis;