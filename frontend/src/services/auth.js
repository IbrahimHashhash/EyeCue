import { AUTH_CONSTANTS } from "../config/constants.js";
import ENDPOINTS from "../api/endpoints.js";

export const authService = {
    async loginAsGuest(formData) {
        const response = await fetch(ENDPOINTS.AUTH.GUEST_LOGIN, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Guest login failed");
        return data;
    },

    saveUser(user) {
        localStorage.setItem(AUTH_CONSTANTS.STORAGE_KEY, JSON.stringify(user));
    },

    getUser() {
        const user = localStorage.getItem(AUTH_CONSTANTS.STORAGE_KEY);
        return user ? JSON.parse(user) : null;
    },

    redirectUser(user) {
        const redirectPath = user.role === AUTH_CONSTANTS.ROLES.TEACHER
            ? AUTH_CONSTANTS.ROUTES.TEACHER
            : AUTH_CONSTANTS.ROUTES.STUDENT;
        window.location.href = redirectPath;
    }
};

export default authService;