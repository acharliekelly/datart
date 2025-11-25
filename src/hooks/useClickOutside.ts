import { useEffect } from "react";

export function useClickOutside(
  ref: React.RefObject<HTMLDivElement | null>,
  onOutside: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    function handle(event: MouseEvent | TouchEvent) {
      const el = ref.current;
      if (!el) return;
      if (event.target instanceof Node && el.contains(event.target)) {
        return; // clicked inside
      }
      onOutside();
    }

    document.addEventListener("mousedown", handle);
    document.addEventListener("touchstart", handle);

    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("touchstart", handle);
    };
  }, [ref, onOutside, enabled]);
}