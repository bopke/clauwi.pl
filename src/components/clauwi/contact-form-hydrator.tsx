"use client";

import { useEffect } from "react";

// The mirrored Kadence contact form (home + kontakt pages) now submits as a
// plain native POST to /api/contact (see scripts/mirror.mjs's
// rewriteContactFormAction), which redirects back with ?contact=ok|error.
// This hydrator shows a status message near the form on that redirect, then
// cleans the query param so a refresh doesn't re-show it.
export function ContactFormHydrator() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("contact");
    if (status !== "ok" && status !== "error") return;

    const forms = document.querySelectorAll<HTMLFormElement>('form[data-contact-form="true"]');
    forms.forEach((form) => {
      if (form.parentElement?.querySelector("[data-contact-status]")) return;
      const p = document.createElement("p");
      p.setAttribute("data-contact-status", "true");
      p.textContent =
        status === "ok"
          ? "Dziękujemy! Wiadomość została wysłana."
          : "Nie udało się wysłać wiadomości. Sprawdź, czy wszystkie pola są wypełnione, i spróbuj ponownie.";
      p.style.cssText =
        status === "ok"
          ? "margin-bottom:1rem;padding:.75rem 1rem;border-radius:2px;background:#e6f4ea;color:#1e4620;"
          : "margin-bottom:1rem;padding:.75rem 1rem;border-radius:2px;background:#fdecea;color:#611a15;";
      form.parentElement?.insertBefore(p, form);
    });

    params.delete("contact");
    const search = params.toString();
    window.history.replaceState({}, "", window.location.pathname + (search ? `?${search}` : ""));
  }, []);

  return null;
}
