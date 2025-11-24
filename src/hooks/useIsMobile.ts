import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= MOBILE_BREAKPOINT;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

    const update = () => setIsMobile(mq.matches);

    update();
    mq.addEventListener("change", update);
    window.addEventListener("resize", update);

    return () => {
      mq.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    }
  }, []);

  return isMobile;
}