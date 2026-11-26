import axios from 'axios';

export interface Resource {
    id: number;
    name: string;
    description:string;
    location: string;
    status: string;
}

export interface RequestItem{
    id: number;
    resourceId: number;
    resourceName: string;
    description: string;
    status: string;
} 

interface Page {
    items: Resource[];
    page: number;
    size: number;
    totalitems: number;
    totalpage: number;
}

interface ApiError {
    code: string;
    message: string;
}

export const MIN = 10;
export const MAX = 200;

const baseURL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8080';
export const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.request.use(request => {
    if (!request.baseURL) {
        throw new Error("Configura la URL de la API en el .env");
    }
    const token = localStorage.getItem('token');
    if (token) {request.headers['Authorization'] = `Bearer ${token}`;}
    return request;
});

api.interceptors.response.use(
    response => response,
    error => {
        const url=error.config?.url;
        if(error.response?.status === 401 && url !== '/login' && url !== '/register') {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    });

export function message (error:unknown){
    if (axios.isAxiosError<ApiError>(error)){
        return error.response?.data?.message || 'No se pudo contextar al servidor';
    }
    return error instanceof Error ? error.message : 'Ocurrio un error';
}
export function unavailable (resource:Resource){
    return resource.status === 'UNAVAILABLE';
}

export function isUnavailable (error:unknown){
    return axios.isAxiosError<ApiError>(error) && error.response?.status === 404&&
    ['RESOURCE_CLOSED','CLOSED'].includes(error.response?.data?.code || '');

}

export const service ={
    register:(name_string, email:string, password:string) => api.post('/register',{name:name_string,email,password}),

    login:(email:string, password:string) => api.post<{token:string}>('/auth/login',{email,password}),

    list 

}