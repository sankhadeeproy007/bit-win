import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGuess } from "../../hooks/useGuess";
import {
  placeGuess,
  getActiveGuessStatus,
  resolveGuess,
} from "../../api/guess";
import { Direction } from "../../constants/game";

vi.mock("../../api/guess", () => ({
  placeGuess: vi.fn(),
  getActiveGuessStatus: vi.fn(),
  resolveGuess: vi.fn(),
}));

vi.mock("../../constants/game", () => ({
  GUESS_DURATION_MS: 60000,
  Direction: {
    UP: "up",
    DOWN: "down",
  },
}));

describe("useGuess", () => {
  const mockOnSuccess = vi.fn();
  const mockOnResolve = vi.fn();
  const mockOnTimerRestart = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock for getActiveGuessStatus - no active guess
    vi.mocked(getActiveGuessStatus).mockResolvedValue({
      hasActiveGuess: false,
      canBeResolved: false,
      remainingSeconds: null,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("checks active guess status on mount when userId is provided", async () => {
    renderHook(() =>
      useGuess({
        userId: "user-123",
        onSuccess: mockOnSuccess,
        onResolve: mockOnResolve,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(getActiveGuessStatus).toHaveBeenCalledWith("user-123");
  });

  it("successfully places a guess and calls onSuccess", async () => {
    const mockGuessResult = {
      direction: Direction.UP,
      priceAtGuess: 50000.5,
    };

    vi.mocked(placeGuess).mockResolvedValue(mockGuessResult);

    const { result } = renderHook(() =>
      useGuess({
        userId: "user-123",
        onSuccess: mockOnSuccess,
        onResolve: mockOnResolve,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await result.current.handleGuessSubmit(Direction.UP);
    });

    expect(placeGuess).toHaveBeenCalledWith("user-123", Direction.UP);
    expect(mockOnSuccess).toHaveBeenCalledWith({
      direction: Direction.UP,
      priceAtGuess: 50000.5,
    });
  });

  it("starts timer after successfully placing a guess", async () => {
    vi.useFakeTimers();

    vi.mocked(placeGuess).mockResolvedValue({
      direction: Direction.UP,
      priceAtGuess: 50000,
    });

    const { result } = renderHook(() =>
      useGuess({
        userId: "user-123",
        onSuccess: mockOnSuccess,
        onResolve: mockOnResolve,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await result.current.handleGuessSubmit(Direction.UP);
    });

    expect(result.current.timer).toBe(60);
  });

  it("sets timer when there is an active guess with remaining time", async () => {
    vi.useFakeTimers();

    vi.mocked(getActiveGuessStatus).mockResolvedValue({
      hasActiveGuess: true,
      canBeResolved: false,
      remainingSeconds: 30,
    });

    const { result } = renderHook(() =>
      useGuess({
        userId: "user-123",
        onSuccess: mockOnSuccess,
        onResolve: mockOnResolve,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.timer).toBe(30);
  });

  it("auto-resolves when guess can be resolved on mount", async () => {
    vi.mocked(getActiveGuessStatus).mockResolvedValue({
      hasActiveGuess: true,
      canBeResolved: true,
      remainingSeconds: null,
    });

    vi.mocked(resolveGuess).mockResolvedValue({
      resolved: true,
      isCorrect: true,
    });

    renderHook(() =>
      useGuess({
        userId: "user-123",
        onSuccess: mockOnSuccess,
        onResolve: mockOnResolve,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(resolveGuess).toHaveBeenCalledWith("user-123");
    expect(mockOnResolve).toHaveBeenCalledWith({ isCorrect: true });
  });

  it("calls onResolve with isCorrect true when guess is correct", async () => {
    vi.mocked(getActiveGuessStatus).mockResolvedValue({
      hasActiveGuess: true,
      canBeResolved: true,
      remainingSeconds: null,
    });

    vi.mocked(resolveGuess).mockResolvedValue({
      resolved: true,
      isCorrect: true,
    });

    renderHook(() =>
      useGuess({
        userId: "user-123",
        onSuccess: mockOnSuccess,
        onResolve: mockOnResolve,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockOnResolve).toHaveBeenCalledWith({ isCorrect: true });
  });

  it("calls onResolve with isCorrect false when guess is wrong", async () => {
    vi.mocked(getActiveGuessStatus).mockResolvedValue({
      hasActiveGuess: true,
      canBeResolved: true,
      remainingSeconds: null,
    });

    vi.mocked(resolveGuess).mockResolvedValue({
      resolved: true,
      isCorrect: false,
    });

    renderHook(() =>
      useGuess({
        userId: "user-123",
        onSuccess: mockOnSuccess,
        onResolve: mockOnResolve,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockOnResolve).toHaveBeenCalledWith({ isCorrect: false });
  });

  it("calls onTimerRestart when price has not changed", async () => {
    vi.useFakeTimers();

    vi.mocked(getActiveGuessStatus).mockResolvedValue({
      hasActiveGuess: true,
      canBeResolved: true,
      remainingSeconds: null,
    });

    vi.mocked(resolveGuess).mockResolvedValue({
      resolved: false,
      timerRestarted: true,
    });

    const { result } = renderHook(() =>
      useGuess({
        userId: "user-123",
        onSuccess: mockOnSuccess,
        onResolve: mockOnResolve,
        onTimerRestart: mockOnTimerRestart,
        onError: mockOnError,
      })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockOnTimerRestart).toHaveBeenCalled();
    expect(result.current.timer).toBe(60);
    expect(mockOnResolve).not.toHaveBeenCalled();
  });
});
