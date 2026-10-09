import { act, render, screen } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { refreshToken } from "@/api/auth/auth";

jest.mock("@/api/auth/auth", () => ({
  refreshToken: jest.fn(),
  logoutUser: jest.fn(),
}));

function AuthState() {
  const { isAuthReady, isAuthenticated } = useAuth();
  return (
    <span>
      {isAuthReady ? "ready" : "checking"}:{isAuthenticated ? "authenticated" : "anonymous"}
    </span>
  );
}

describe("AuthProvider session restoration", () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it("waits for cookie recovery before declaring the user unauthenticated", async () => {
    window.localStorage.setItem("portfolio_auth_session", "true");
    let resolveRefresh: ((value: { authenticated: true }) => void) | undefined;
    (refreshToken as jest.Mock).mockReturnValue(
      new Promise<{ authenticated: true }>((resolve) => {
        resolveRefresh = resolve;
      }),
    );

    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>,
    );

    expect(screen.getByText("checking:anonymous")).toBeInTheDocument();

    await act(async () => {
      resolveRefresh?.({ authenticated: true });
    });

    expect(screen.getByText("ready:authenticated")).toBeInTheDocument();
  });

  it("does not call remote logout when cookie recovery has a transient failure", async () => {
    window.localStorage.setItem("portfolio_auth_session", "true");
    (refreshToken as jest.Mock).mockRejectedValue(new Error("network unavailable"));

    const { logoutUser } = jest.requireMock("@/api/auth/auth") as { logoutUser: jest.Mock };
    render(
      <AuthProvider>
        <AuthState />
      </AuthProvider>,
    );

    await screen.findByText("ready:anonymous");

    expect(logoutUser).not.toHaveBeenCalled();
    expect(window.localStorage.getItem("portfolio_auth_session")).toBe("true");
  });
});
