import { useState } from "react";

export default function ExpandableCard({ children }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative">
      {!expanded && (
        <>
          {children}
          <button
            onClick={() => setExpanded(true)}
            className="absolute top-2 right-2 bg-white border rounded-full shadow p-1 text-sm"
            aria-label="Expandir"
          >
            ⛶
          </button>
        </>
      )}
      {expanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setExpanded(false)}
          />
          <div className="bg-white p-4 rounded-lg shadow-lg relative max-h-[90vh] w-[90vw] overflow-auto">
            <button
              onClick={() => setExpanded(false)}
              className="absolute top-2 right-2 bg-gray-200 rounded-full p-1"
              aria-label="Cerrar"
            >
              ✕
            </button>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
