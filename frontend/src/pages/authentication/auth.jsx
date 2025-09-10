import AuthForm from "./authForm.jsx";
import authService from "../../services/auth.js";
import "./auth.css";

const AuthPage = () => {
    const handleGuestLogin = async (formData) => {
        const data = await authService.loginAsGuest(formData);
        authService.saveUser(data.user);
        authService.redirectUser(data.user);
    };

    return <AuthForm onSubmit={handleGuestLogin} />;
};

export default AuthPage;