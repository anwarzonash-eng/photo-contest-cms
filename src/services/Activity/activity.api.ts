import axiosInstance from "@/config/axios";




const ActivityApis = {


    GetActivityCalloutData: () => {
        return axiosInstance.post("/admin/fetchActivityCallout", {});
    },

    UpdateActivityCallout: (body: any) => {
        return axiosInstance.post("/admin/updateActivityCallout", body);
    },



};

export default ActivityApis;