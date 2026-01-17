import { useState } from "react";
import { signIn, signUp, autoSignIn } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

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

  const client = generateClient<Schema>();

  const clearForm = () => {
    setFormData(initialFormData);
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const createPlayer = async (email: string) => {
    const result = await client.models.Player.create({
      email,
      score: 0,
      activeGuess: null,
    });
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignIn) {
        await signIn({
          username: formData.email,
          password: formData.password,
        });
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

        await signUp({
          username: formData.email,
          password: formData.password,
          options: {
            userAttributes: {
              email: formData.email,
            },
            autoSignIn: {
              enabled: true,
            },
          },
        });

        await autoSignIn();

        // Create the Player record in the database
        await createPlayer(formData.email);
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
