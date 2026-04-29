import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function LaunchGate() {
  const nav = useNavigate();

  useEffect(() => {
    nav("/welcome", { replace: true });
  }, [nav]);

  return null;
}

