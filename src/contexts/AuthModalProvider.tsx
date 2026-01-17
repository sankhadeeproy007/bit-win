import { useState } from "react";
import type { ReactNode } from "react";
import { AuthModalContext } from "./AuthModalContext";

interface AuthModalProviderProps {
  children: ReactNode;
}

export const AuthModalProvider = ({ children }: AuthModalProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const openAuthModal = () => setIsOpen(true);
  const closeAuthModal = () => setIsOpen(false);

  return (
    <AuthModalContext.Provider
      value={{ openAuthModal, closeAuthModal, isOpen }}
    >
      {children}
    </AuthModalContext.Provider>
  );
};
