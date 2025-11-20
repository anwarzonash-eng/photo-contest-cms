import axiosInstance from "@/config/axios";


const Header = {
    headers: {
        "Content-Type": "multipart/form-data",
    },
}


const ActivityApis = {


    GetActivityCalloutData: () => {
        return axiosInstance.post("/admin/fetchActivityCallout", {});
    },

    UpdateActivityCallout: (body: any) => {
        return axiosInstance.post("/admin/updateActivityCallout", body);
    },

    Notification: (body: any) => {
        return axiosInstance.post("/admin/addUserNotifications", body, Header);
    },
    NotificationList: (body: any) => {
        return axiosInstance.post("/admin/fetchUserNotifications", body);
    },
    NotificationStopAndStart: (body: any) => {
        return axiosInstance.post("/admin/stopUserNotification", body);
    },


};

export default ActivityApis;