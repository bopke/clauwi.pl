// Rama publicznej strony. Strony w trybie „legacy” zawierają własny nagłówek
// i stopkę (z oryginalnego HTML), więc tutaj renderujemy tylko children.
// UWAGA: legacy/base.css (CSS motywu Kadence) NIE jest importowane tutaj —
// zrobiło to globalnie dla WSZYSTKICH stron publicznych, więc jego ogólne
// selektory elementów (button, input, table…) nadpisywały klasy Tailwind na
// nowych stronach (kalendarz kursów, katalog doradców). Import jest teraz
// tylko w plikach, które faktycznie renderują zmirrorowaną treść: strona
// główna i katalog [...slug].
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-full flex-col">{children}</div>;
}
