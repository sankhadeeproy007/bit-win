import { useState } from "react";
import { signIn, signUp } from "../api/auth";

interface UseAuthFormProps {
  onSuccess: () => void;
  onClose: () => void;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

const initialFormData: FormData = {
  email: "",
  password: "",
  confirmPassword: "",
};

export const useAuthForm = ({ onSuccess, onClose }: UseAuthFormProps) => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clearForm = () => {
    setFormData(initialFormData);
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignIn) {
        await signIn(formData.email, formData.password);
      } else {
        if (!formData.email) {
          setError("Email is required");
          setLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        await signUp(formData.email, formData.password);
      }

      onSuccess();
      onClose();
      clearForm();
    } catch (err) {
      console.error("[Auth] Error during authentication:", err);
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${isSignIn ? "sign in" : "sign up"}. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const switchToSignUp = () => {
    setIsSignIn(false);
    clearForm();
  };

  const switchToSignIn = () => {
    setIsSignIn(true);
    clearForm();
  };

  return {
    isSignIn,
    formData,
    error,
    loading,
    setFormData: updateField,
    handleSubmit,
    switchToSignUp,
    switchToSignIn,
  };
};
