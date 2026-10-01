import { useLocation, useNavigate } from "react-router-dom";

// Pops back to the list it came from so history does not stack a second list entry.
export function useReturnToAddressList() {
  const location = useLocation();
  const navigate = useNavigate();

  return () => {
    if (location.key === "default") {
      navigate("/my/addresses", { replace: true });
      return;
    }

    navigate(-1);
  };
}
