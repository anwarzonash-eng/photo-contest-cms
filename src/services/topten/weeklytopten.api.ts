import axiosInstance from "@/config/axios";

interface toptenListBody {
    offSet: Number;
    limit: Number;
}


interface downloadWeeklyToptenPhotosBody {
    fileName: string;
    weekDate: string;
}


const WeekltTopTenApis = {
    WeeklyToptenList: (body: toptenListBody) => {
        return axiosInstance.post("/admin/weeklyTopTenList", body);
    },

    DownloadWeeklyToptenPhotos: (body: downloadWeeklyToptenPhotosBody) => {
        return axiosInstance.post("/admin/downloadWeeklyTopTen", body, {
            responseType: 'blob', 
        });
    },
};

export default WeekltTopTenApis;
