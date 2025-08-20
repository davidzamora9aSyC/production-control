
import { createContext, useContext, useRef, useState } from "react";

const ExpandContext = createContext({ expanded: false });

export function ExpandButton() {
  const { open, expanded } = useContext(ExpandContext);
  if (expanded) return null;
  return (
    <button
      onClick={open}
      className="ml-2 bg-white border rounded-full shadow p-1 text-sm"
      aria-label="Expandir"
    >
      ⛶
    </button>
  );
}

export default function ExpandableCard({ children, expandedHeight = "90vh" }) {
  const [expanded, setExpanded] = useState(false);
  const [style, setStyle] = useState({});
  const cardRef = useRef(null);

  const open = () => {
    const rect = cardRef.current.getBoundingClientRect();
    setStyle({
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
    setExpanded(true);
    requestAnimationFrame(() => {
      setStyle({
        top: "5vh",
        left: "5vw",
        width: "90vw",
        height: expandedHeight,
      });
    });
  };

  const close = () => {
    const rect = cardRef.current.getBoundingClientRect();
    setStyle({
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    });
    setTimeout(() => setExpanded(false), 300);
  };

  return (
    <ExpandContext.Provider value={{ open, close, expanded }}>
      <div ref={cardRef} className={expanded ? "invisible" : ""}>
        {children}
      </div>
      {expanded && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={close}
          />
          <div
            className="bg-white p-4 rounded-lg shadow-lg overflow-auto absolute transition-all duration-300"
            style={style}
          >
            <button
              onClick={close}

              className="absolute top-2 right-2 bg-gray-200 rounded-full p-1"
              aria-label="Cerrar"
            >
              ✕
            </button>
            {children}
          </div>
        </div>
      )}

    </ExpandContext.Provider>
  );
}


