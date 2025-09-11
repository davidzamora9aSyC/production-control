import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth({ children }) {
  const { isAuthenticated, isChecking, revalidate } = useAuth();
  const location = useLocation();

  // Revalida token cuando cambia la ruta
  useEffect(() => {
    // Revalida solo cuando cambia la ruta y ya terminó el arranque
    if (!isChecking && isAuthenticated) {
      revalidate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (isChecking) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8 text-gray-600">
        Verificando sesión...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
