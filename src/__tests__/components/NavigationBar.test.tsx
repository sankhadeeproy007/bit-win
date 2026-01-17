import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import NavigationBar from "../../components/NavigationBar/NavigationBar";
import { useAuth } from "../../hooks/useAuth";
import { useAuthModal } from "../../hooks/useAuthModal";

const mockOpenAuthModal = vi.fn();
const mockLogout = vi.fn();
const mockCloseAuthModal = vi.fn();

vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../hooks/useAuthModal", () => ({
  useAuthModal: vi.fn(),
}));

describe("NavigationBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementations
    vi.mocked(useAuthModal).mockReturnValue({
      isOpen: false,
      openAuthModal: mockOpenAuthModal,
      closeAuthModal: mockCloseAuthModal,
    });
  });

  it("renders sign in button when user is not authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
      checkAuth: vi.fn(),
      logout: mockLogout,
    });

    render(<NavigationBar />);

    expect(screen.getByText("Sign In / Sign Up")).toBeInTheDocument();
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
  });

  it("renders user info and logout button when user is authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        userId: "123",
        email: "test@example.com",
      },
      loading: false,
      isAuthenticated: true,
      checkAuth: vi.fn(),
      logout: mockLogout,
    });

    render(<NavigationBar />);

    expect(screen.getByText("test@example.com")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.queryByText("Sign In / Sign Up")).not.toBeInTheDocument();
  });

  it("calls logout when logout button is clicked", async () => {
    const { userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();

    vi.mocked(useAuth).mockReturnValue({
      user: {
        userId: "123",
        email: "test@example.com",
      },
      loading: false,
      isAuthenticated: true,
      checkAuth: vi.fn(),
      logout: mockLogout,
    });

    render(<NavigationBar />);

    const logoutButton = screen.getByText("Logout");
    await user.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it("calls openAuthModal when sign in button is clicked", async () => {
    const { userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();

    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      isAuthenticated: false,
      checkAuth: vi.fn(),
      logout: mockLogout,
    });

    render(<NavigationBar />);

    const signInButton = screen.getByText("Sign In / Sign Up");
    await user.click(signInButton);

    expect(mockOpenAuthModal).toHaveBeenCalledTimes(1);
  });
});
