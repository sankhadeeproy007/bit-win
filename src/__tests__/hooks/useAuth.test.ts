import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAuth } from "../../hooks/useAuth";
import { getCurrentUser, fetchUserAttributes } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

vi.mock("aws-amplify/auth", () => ({
  getCurrentUser: vi.fn(),
  fetchUserAttributes: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("aws-amplify/utils", () => ({
  Hub: {
    listen: vi.fn(),
  },
}));

describe("useAuth", () => {
  const mockCleanup = vi.fn();
  let hubCallback: ((data: { payload: { event: string } }) => void) | null =
    null;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCleanup.mockClear();

    // Setup Hub.listen mock to capture the callback and return cleanup
    vi.mocked(Hub.listen).mockImplementation((channel, callback) => {
      if (channel === "auth") {
        hubCallback = callback as (data: {
          payload: { event: string };
        }) => void;
      }
      return mockCleanup;
    });
  });

  afterEach(() => {
    hubCallback = null;
  });

  it("returns authenticated user when getCurrentUser succeeds", async () => {
    const mockUser = {
      userId: "123",
    };
    const mockAttributes = {
      email: "test@example.com",
    };

    vi.mocked(getCurrentUser).mockResolvedValue(mockUser as never);
    vi.mocked(fetchUserAttributes).mockResolvedValue(mockAttributes as never);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual({
      userId: "123",
      email: "test@example.com",
    });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("calls checkAuth when signedIn event is received", async () => {
    vi.mocked(getCurrentUser)
      .mockRejectedValueOnce(new Error("Not authenticated"))
      .mockResolvedValueOnce({ userId: "123" } as never);
    vi.mocked(fetchUserAttributes).mockResolvedValue({
      email: "test@example.com",
    } as never);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Simulate signedIn event
    if (hubCallback) {
      hubCallback({ payload: { event: "signedIn" } });
    }

    await waitFor(() => {
      expect(getCurrentUser).toHaveBeenCalledTimes(2);
    });
  });

  it("sets user to null when signedOut event is received", async () => {
    const mockUser = {
      userId: "123",
    };
    const mockAttributes = {
      email: "test@example.com",
    };

    vi.mocked(getCurrentUser).mockResolvedValue(mockUser as never);
    vi.mocked(fetchUserAttributes).mockResolvedValue(mockAttributes as never);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    // Simulate signedOut event
    if (hubCallback) {
      hubCallback({ payload: { event: "signedOut" } });
    }

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
