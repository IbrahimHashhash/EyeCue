import { useAuthForm } from "../../hooks/useAuthForm.js";

const AuthForm = ({ onSubmit }) => {
    const { formData, isLoading, error, setIsLoading, setError, updateField, resetForm } = useAuthForm();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) {
            setError("Please enter your name");
            return;
        }
        setIsLoading(true);
        try {
            await onSubmit(formData);
            resetForm();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Welcome to EyeCue</h1>
                    <p>Enter your name to continue as guest</p>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Your Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => updateField("name", e.target.value)}
                            placeholder="Enter your name"
                            disabled={isLoading}
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <select
                            value={formData.role}
                            onChange={(e) => updateField("role", e.target.value)}
                            disabled={isLoading}
                        >
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                        </select>
                    </div>
                    {error && <div className="error-message">{error}</div>}
                    <button type="submit" disabled={isLoading} className="auth-button">
                        {isLoading ? "Logging in..." : "Continue as Guest"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AuthForm;