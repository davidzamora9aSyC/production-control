import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function Tooltip({ content, children, offset = 8, shiftX = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, place: "bottom" }); // place: bottom|top

  useEffect(() => {
    if (!visible || !ref.current) return;
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    // Clamp within viewport horizontally with 8px padding
    const padding = 8;
    let left = pos.left;
    if (left + rect.width + padding > window.innerWidth) left = window.innerWidth - rect.width - padding;
    if (left < padding) left = padding;
    let next = left !== pos.left ? { ...pos, left } : pos;
    // If tooltip goes beyond viewport bottom, flip above
    if (rect.bottom > window.innerHeight - padding && pos.place === "bottom") {
      const height = rect.height;
      next = { ...next, top: next.top - (height + offset * 2), place: "top" };
    }
    // If now above but there is no space on top, put at bottom again
    if (rect.top < padding && next.place === "top") {
      next = { ...next, top: next.top + (rect.height + offset * 2), place: "bottom" };
    }
    if (next !== pos) setPos(next);
  }, [visible, pos, offset]);

  const show = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const top = r.bottom + offset;
    const left = r.left + r.width / 2 + shiftX; // shift horizontally if requested
    setPos({ top, left, place: "bottom" });
    setVisible(true);
  };

  const hide = () => setVisible(false);

  return (
    <span onMouseEnter={show} onMouseLeave={hide} className="inline-block align-middle">
      {children}
      {visible && createPortal(
        <div
          ref={ref}
          style={{ position: "fixed", top: pos.top, left: pos.left, transform: "translateX(-50%)", zIndex: 9999 }}
          className="rounded bg-gray-800 text-white text-[10px] px-2 py-1 shadow-lg max-w-[28rem]"
        >
          {content}
        </div>,
        document.body
      )}
    </span>
  );
}
