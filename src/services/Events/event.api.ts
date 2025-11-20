import axiosInstance from "@/config/axios";


const Header = {
    headers: {
        "Content-Type": "multipart/form-data",
    },
}

const EventsApis = {

    CreatePastEvent: (body: any) => {
        return axiosInstance.post("/townhall/add", body, Header);
    },
    GetPastEventList: (body: any) => {
        return axiosInstance.post("/townhall/list", body);
    },

    UpdatePastEvent: (body: any) => {
        return axiosInstance.post("/townhall/update", body, Header);
    },


    DeletePastEvent: (body: any) => {
        return axiosInstance.post("/townhall/delete", body,);
    },

    GetCurrentEventData: (body: any) => {
        return axiosInstance.post("/townhall/monthly-list", body);
    },
    UpdateCurrentEventData: (body: any) => {
        return axiosInstance.post("/townhall/updateMonthly", body, Header);
    },
};

export default EventsApis;