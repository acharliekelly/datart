import { useEffect, useState } from "react";
import type { IpInfo, IpApiResponse } from "../logic/types";

const STORAGE_KEY = "datart:ipInfo";

export function useIpInfo() {
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(() => {
    if (typeof window === "undefined") return null;

    const cached = window.localStorage.getItem(STORAGE_KEY);
    if (!cached) return null;

    try {
      const parsed = JSON.parse(cached) as IpInfo;
      // very light sanity check
      if (!parsed || typeof parsed.ip !== "string") return null;
      return parsed;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState<boolean>(() => ipInfo === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // if we already have IP from cache, don't fetch again
    if (ipInfo) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchIpInfo = async () => {
      setLoading(true);
      try {
        const res = await fetch("https://ipapi.co/json");
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data: IpApiResponse = await res.json();

        const info: IpInfo = {
          ip: data.ip,
          city: data.city,
          region: data.region,
          country: data.country_name,
          continentCode: data.continent_code,
        };

        if (cancelled) return;

        setIpInfo(info);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
        setError(null);
      } catch (err) {
        if (cancelled) return;
        console.error("IP fetch failed:", err);
        setError(
          err instanceof Error ? err.message : "Unknown IP fetch error"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchIpInfo();

    return () => {
      cancelled = true;
    };
  }, [ipInfo]);

  return { ipInfo, loading, error };
}

