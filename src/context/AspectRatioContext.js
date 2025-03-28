import { createContext, useContext, useEffect, useState } from "react";

const AspectRatioContext = createContext();

export const AspectRatioProvider = ({ children }) => {
  const [aspectRatio, setAspectRatio] = useState("");

  useEffect(() => {
    const updateRatio = () => {
      const ratio = window.innerWidth / window.innerHeight;
      if (ratio > 1.74 && ratio < 1.78) {
        setAspectRatio("16:9");
      } else if (ratio > 1.50 && ratio < 1.62) {
        setAspectRatio("16:10");
      } else {
        setAspectRatio("other");
      }
    };

    updateRatio();
    window.addEventListener("resize", updateRatio);
    return () => window.removeEventListener("resize", updateRatio);
  }, []);

  return (
    <AspectRatioContext.Provider value={{ aspectRatio }}>
      {children}
    </AspectRatioContext.Provider>
  );
};

export const useAspectRatio = () => useContext(AspectRatioContext);
