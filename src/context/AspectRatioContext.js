// src/context/AspectRatioContext.js
import { createContext, useContext, useEffect, useState } from "react";

const AspectRatioContext = createContext();

export const AspectRatioProvider = ({ children }) => {
  const [isMacbookRatio, setIsMacbookRatio] = useState(false);

  useEffect(() => {
    const updateRatio = () => {
      const ratio = window.innerWidth / window.innerHeight;
      setIsMacbookRatio(ratio > 1.50 && ratio < 1.62);
    };

    updateRatio();
    window.addEventListener("resize", updateRatio);
    return () => window.removeEventListener("resize", updateRatio);
  }, []);

  return (
    <AspectRatioContext.Provider value={{ isMacbookRatio }}>
      {children}
    </AspectRatioContext.Provider>
  );
};

export const useAspectRatio = () => useContext(AspectRatioContext);