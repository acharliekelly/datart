import { useCallback, useRef, useState } from "react";

interface UseDraggablePanelOptions {
  initialX: number; // px from left
  initialY: number; // px from top
}

export function useDraggablePanel({ initialX, initialY }: UseDraggablePanelOptions) {
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

      setPos({ x: startRef.current.x + dx, y: startRef.current.y + dy });
    };

    const handleUp = () => {
      draggingRef.current = false;
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  }, [pos.x, pos.y]);

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