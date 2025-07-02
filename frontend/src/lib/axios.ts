import axios from 'axios';

export const axiosInstance=axios.create({
    baseURL:"http://localhost:5001/api/v1",
    withCredentials:true // to send cookies with every request
})