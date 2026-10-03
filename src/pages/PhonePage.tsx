import { Navigate } from "react-router-dom";

/** Phone lives under Settings now. */
export function PhonePage() {
  return <Navigate to="/settings?section=phone" replace />;
}
