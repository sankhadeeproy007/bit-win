import { createContext } from "react";

interface AuthModalContextType {
  openAuthModal: () => void;
  closeAuthModal: () => void;
  isOpen: boolean;
}

export const AuthModalContext = createContext<AuthModalContextType | undefined>(
  undefined
);
