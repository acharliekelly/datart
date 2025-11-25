import { useCallback, useRef, useState } from "react";

interface UseDraggablePanelOptions {
  initialX: number; // px from left
  initialY: number; // px from top
  bounds?: {
    margin?: number;      // distance from edges
    panelWidth?: number;  // approx width in px
    panelHeight?: number; // approx height in px
  };
}

export function useDraggablePanel({ initialX, initialY, bounds }: UseDraggablePanelOptions) {
  const [pos, setPos] = useState({ x: initialX, y: initialY});
  const dragRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0, mouseX: 0, mouseY: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    startRef.current = {
      x: pos.x,
      y: pos.y,
      mouseX: e.clientX,
      mouseY: e.clientY,
    };

    const handleMove = (moveEvent: MouseEvent) => {
      if (!draggingRef.current) return;

      const dx = moveEvent.clientX - startRef.current.mouseX;
      const dy = moveEvent.clientY - startRef.current.mouseY;

      let nextX = startRef.current.x + dx;
      let nextY = startRef.current.y + dy;

      // clamp to viewport
      if (typeof window !== "undefined" && bounds) {
        const margin = bounds.margin ?? 12;
        const panelWidth = bounds.panelWidth ?? 280;
        const panelHeight = bounds.panelHeight ?? 260;

        const maxX = window.innerWidth - panelWidth - margin;
        const maxY = window.innerHeight - panelHeight - margin;

        nextX = Math.max(margin, Math.min(maxX, nextX));
        nextY = Math.max(margin, Math.min(maxY, nextY));
      }

      setPos({ x: nextX, y: nextY });
    };

    const handleUp = () => {
      draggingRef.current = false;
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  }, [pos.x, pos.y, bounds]);

  const panelStyle: React.CSSProperties = {
    position: "absolute",
    left: pos.x,
    top: pos.y,
  };

  const handleProps = {
    onMouseDown,
    ref: dragRef,
  };

  return { panelStyle, handleProps };
}