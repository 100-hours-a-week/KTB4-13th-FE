import { useNavigate } from "react-router-dom";

import { requestLogout } from "@/features/auth/api/logoutApi";
import { useAuth } from "@/features/auth/context/useAuth";

export function useLogout() {
  const navigate = useNavigate();
  const { clearAccessToken } = useAuth();

  const logout = async () => {
    const isServerLogoutSucceeded = await requestLogout();

    // Clear locally even when the server call fails so this tab stops acting as the user.
    // On failure the HttpOnly refresh cookie and server session remain, so a reload can
    // restore the session through the app-start reissue; the result is returned for that.
    clearAccessToken();
    navigate("/login", { replace: true });

    return isServerLogoutSucceeded;
  };

  return { logout };
}
