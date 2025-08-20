
import { createContext, useContext, useRef, useState } from "react";

export const ExpandContext = createContext({ expanded: false });

export function ExpandButton() {

  const { open, close, expanded } = useContext(ExpandContext);
  const handle = expanded ? close : open;
  const icon = expanded ? "✕" : "⛶";
  const label = expanded ? "Cerrar" : "Expandir";
  return (
    <button
      onClick={handle}
      className="ml-2 bg-white border rounded-full shadow p-1 text-sm"
      aria-label={label}
    >
      {icon}

    </button>
  );
}

export default function ExpandableCard({ children, expandedHeight = "85vh" }) {

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

      const numericHeight = parseFloat(expandedHeight);
      const top = (100 - numericHeight) / 2;
      setStyle({
        top: `${top}vh`,

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

            className="bg-white p-4 rounded-lg shadow-lg overflow-hidden absolute transition-all duration-300 flex flex-col"
            style={style}
          >

            {children}
          </div>
        </div>
      )}
    </ExpandContext.Provider>
  );
}

