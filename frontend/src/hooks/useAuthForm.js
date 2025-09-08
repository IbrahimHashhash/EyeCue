import { useState } from "react";
import { FORM_DEFAULTS } from "../config/constants";

export const useAuthForm = () => {
    const [formData, setFormData] = useState(FORM_DEFAULTS);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError("");
    };

    const resetForm = () => {
        setFormData(FORM_DEFAULTS);
        setError("");
    };

    return { formData, isLoading, error, setIsLoading, setError, updateField, resetForm };
};