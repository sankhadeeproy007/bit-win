import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AuthModal from "../../components/AuthModal/AuthModal";
import { useAuthForm } from "../../hooks/useAuthForm";

const mockOnClose = vi.fn();
const mockOnSuccess = vi.fn();
const mockSetFormData = vi.fn();
const mockHandleSubmit = vi.fn();
const mockSwitchToSignUp = vi.fn();
const mockSwitchToSignIn = vi.fn();

vi.mock("../../hooks/useAuthForm", () => ({
  useAuthForm: vi.fn(),
}));

const createMockReturnValue = (overrides: Record<string, unknown> = {}) => {
  const { formData: formDataOverrides, ...restOverrides } = overrides;
  return {
    isSignIn: true,
    formData: {
      email: "",
      password: "",
      confirmPassword: "",
      ...(formDataOverrides as Record<string, string> | undefined),
    },
    error: null,
    loading: false,
    setFormData: mockSetFormData,
    handleSubmit: mockHandleSubmit,
    switchToSignUp: mockSwitchToSignUp,
    switchToSignIn: mockSwitchToSignIn,
    ...restOverrides,
  };
};

const renderAuthModal = (props = {}) => {
  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onSuccess: mockOnSuccess,
    ...props,
  };
  return render(<AuthModal {...defaultProps} />);
};

const setupMock = (overrides = {}) => {
  vi.mocked(useAuthForm).mockReturnValue(createMockReturnValue(overrides));
};

describe("AuthModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation for sign in mode
    setupMock();
  });

  it("renders the modal when open is true", () => {
    renderAuthModal();

    expect(screen.getByText("Welcome to BitWin!")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("does not render the modal when open is false", () => {
    renderAuthModal({ open: false });

    expect(screen.queryByText("Welcome to BitWin!")).not.toBeInTheDocument();
  });

  it("displays error message when error is present", () => {
    setupMock({ error: "Invalid credentials" });
    renderAuthModal();

    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  it("disables submit button and shows loading state when loading is true", () => {
    setupMock({
      loading: true,
      formData: {
        email: "test@example.com",
        password: "password123",
      },
    });
    renderAuthModal();

    // When loading, the button should be disabled
    // Note: When loading, button text is replaced with CircularProgress, so we find by role
    const buttons = screen.getAllByRole("button");
    const submitButton = buttons.find(
      (btn) => btn.getAttribute("type") === "submit"
    );
    expect(submitButton).toBeDefined();
    expect(submitButton).toBeDisabled();
  });

  it("disables submit button when email or password is empty", () => {
    setupMock({
      formData: {
        email: "",
        password: "mypassword",
      },
    });
    renderAuthModal();

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    expect(submitButton).toBeDisabled();
  });

  it("enables submit button when all required fields are filled", () => {
    setupMock({
      formData: {
        email: "test@example.com",
        password: "password123",
      },
    });
    renderAuthModal();

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    expect(submitButton).not.toBeDisabled();
  });

  it("enables submit button when all fields including confirmPassword are filled in sign up mode", () => {
    setupMock({
      isSignIn: false,
      formData: {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      },
    });
    renderAuthModal();

    const submitButton = screen.getByRole("button", { name: /sign up/i });
    expect(submitButton).not.toBeDisabled();
  });

  it("calls handleSubmit when form is submitted", async () => {
    const { userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();

    setupMock({
      formData: {
        email: "test@example.com",
        password: "password123",
      },
    });
    renderAuthModal();

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(submitButton);

    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });

  it("displays current form data values", () => {
    setupMock({
      isSignIn: false,
      formData: {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      },
    });
    renderAuthModal();

    expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
    // Both password fields have the same value, so there should be 2 matches
    expect(screen.getAllByDisplayValue("password123")).toHaveLength(2);
  });
});
