"use client";

import { useEffect, useState } from "react";

/**
 * The success/error line for the native-POST forms. Their API routes redirect
 * back with ?<param>=ok|error; this shows the matching message once and drops
 * the parameter, so a refresh doesn't show it again.
 */
export function FormStatusMessage({ param, ok, error }: { param: string; ok: string; error: string }) {
  const [status, setStatus] = useState<"ok" | "error" | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const value = params.get(param);
    if (value !== "ok" && value !== "error") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the status only exists in the URL after the redirect
    setStatus(value);
    params.delete(param);
    const search = params.toString();
    window.history.replaceState({}, "", window.location.pathname + (search ? `?${search}` : ""));
  }, [param]);

  if (!status) return null;
  return (
    <p
      role="status"
      className={
        status === "ok"
          ? "mb-4 rounded-[2px] bg-[#e6f4ea] px-4 py-3 text-[#1e4620]"
          : "mb-4 rounded-[2px] bg-[#fdecea] px-4 py-3 text-[#611a15]"
      }
    >
      {status === "ok" ? ok : error}
    </p>
  );
}
