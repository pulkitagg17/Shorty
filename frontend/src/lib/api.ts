import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:3000",
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear any stored auth state if needed (though usually handled by AuthProvider)
            // Redirect to login
            if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);
